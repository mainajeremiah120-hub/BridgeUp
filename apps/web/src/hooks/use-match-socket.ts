import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type MatchRole = 'caller' | 'callee';
type CameraStatus = 'idle' | 'starting' | 'ready' | 'blocked' | 'error';
type MatchMessage = { id: string; content: string; senderName: string; createdAt: string };
type WebRtcSignal =
  | { type: 'offer'; sdp: RTCSessionDescriptionInit }
  | { type: 'answer'; sdp: RTCSessionDescriptionInit }
  | { type: 'ice-candidate'; candidate: RTCIceCandidateInit };

interface UseMatchSocketReturn {
  isConnected: boolean;
  isSearching: boolean;
  isMatched: boolean;
  partnerId: string | null;
  room: string | null;
  sharedInterests: string[];
  messages: MatchMessage[];
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  cameraStatus: CameraStatus;
  cameraError: string | null;
  isCameraEnabled: boolean;
  isMicEnabled: boolean;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
  toggleCamera: () => void;
  toggleMic: () => void;
  sendMatchMessage: (content: string) => void;
  requestMatch: (userId: string, country: string, interests?: string[]) => void;
  leaveMatch: () => void;
  nextMatch: () => void;
}

const iceServers: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const useMatchSocket = (userId: string | null): UseMatchSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  const [sharedInterests, setSharedInterests] = useState<string[]>([]);
  const [messages, setMessages] = useState<MatchMessage[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const roomRef = useRef<string | null>(null);
  const roleRef = useRef<MatchRole | null>(null);
  const pendingSignalsRef = useRef<WebRtcSignal[]>([]);
  const lastRequestRef = useRef<{ userId: string; country: string; interests: string[] } | null>(null);

  const sendSignal = useCallback((signal: WebRtcSignal) => {
    const socket = socketRef.current;
    const activeRoom = roomRef.current;
    if (!socket || !activeRoom) return;
    socket.emit('webrtcSignal', { room: activeRoom, signal });
  }, []);

  const closePeerConnection = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;
    setRemoteStream(null);
    pendingSignalsRef.current = [];
  }, []);

  const createPeerConnection = useCallback(() => {
    if (peerRef.current) return peerRef.current;

    const peer = new RTCPeerConnection(iceServers);
    peerRef.current = peer;

    localStreamRef.current?.getTracks().forEach((track) => {
      const stream = localStreamRef.current;
      if (stream) peer.addTrack(track, stream);
    });

    peer.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) setRemoteStream(stream);
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({ type: 'ice-candidate', candidate: event.candidate.toJSON() });
      }
    };

    return peer;
  }, [sendSignal]);

  const handleSignal = useCallback(async (signal: WebRtcSignal) => {
    if (!localStreamRef.current) {
      pendingSignalsRef.current.push(signal);
      return;
    }

    const peer = createPeerConnection();

    const addQueuedIceCandidates = async () => {
      const queuedIce = pendingSignalsRef.current.filter((item) => item.type === 'ice-candidate');
      pendingSignalsRef.current = pendingSignalsRef.current.filter((item) => item.type !== 'ice-candidate');
      for (const item of queuedIce) {
        if (item.type === 'ice-candidate') {
          await peer.addIceCandidate(new RTCIceCandidate(item.candidate));
        }
      }
    };

    if (signal.type === 'offer') {
      await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      await addQueuedIceCandidates();
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      sendSignal({ type: 'answer', sdp: answer });
      return;
    }

    if (signal.type === 'answer') {
      if (!peer.currentRemoteDescription) {
        await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        await addQueuedIceCandidates();
      }
      return;
    }

    if (signal.type === 'ice-candidate') {
      if (!peer.currentRemoteDescription) {
        pendingSignalsRef.current.push(signal);
        return;
      }
      await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
    }
  }, [createPeerConnection, sendSignal]);

  const flushPendingSignals = useCallback(async () => {
    const pending = [...pendingSignalsRef.current];
    pendingSignalsRef.current = [];
    for (const signal of pending) {
      await handleSignal(signal);
    }
  }, [handleSignal]);

  const startOfferIfCaller = useCallback(async () => {
    if (roleRef.current !== 'caller' || !roomRef.current || !localStreamRef.current) return;

    const peer = createPeerConnection();
    if (peer.signalingState !== 'stable') return;

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    sendSignal({ type: 'offer', sdp: offer });
  }, [createPeerConnection, sendSignal]);

  const startCamera = useCallback(async () => {
    if (localStreamRef.current) return true;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('error');
      setCameraError('This browser does not support camera access.');
      return false;
    }

    try {
      setCameraStatus('starting');
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsCameraEnabled(stream.getVideoTracks().some((track) => track.enabled));
      setIsMicEnabled(stream.getAudioTracks().some((track) => track.enabled));
      setCameraStatus('ready');

      if (peerRef.current) {
        stream.getTracks().forEach((track) => peerRef.current?.addTrack(track, stream));
      }
      await flushPendingSignals();
      await startOfferIfCaller();
      return true;
    } catch (error: any) {
      const blocked = error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError';
      setCameraStatus(blocked ? 'blocked' : 'error');
      setCameraError(blocked ? 'Camera or microphone permission was blocked.' : 'Could not start the camera or microphone.');
      return false;
    }
  }, [flushPendingSignals, startOfferIfCaller]);

  const stopCamera = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setIsCameraEnabled(false);
    setIsMicEnabled(false);
    setCameraStatus('idle');
  }, []);

  const toggleCamera = useCallback(() => {
    const tracks = localStreamRef.current?.getVideoTracks() ?? [];
    const nextEnabled = !tracks.some((track) => track.enabled);
    tracks.forEach((track) => {
      track.enabled = nextEnabled;
    });
    setIsCameraEnabled(nextEnabled);
  }, []);

  const toggleMic = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks() ?? [];
    const nextEnabled = !tracks.some((track) => track.enabled);
    tracks.forEach((track) => {
      track.enabled = nextEnabled;
    });
    setIsMicEnabled(nextEnabled);
  }, []);

  const clearMatchState = useCallback(() => {
    closePeerConnection();
    roleRef.current = null;
    roomRef.current = null;
    setIsMatched(false);
    setPartnerId(null);
    setRoom(null);
    setSharedInterests([]);
    setMessages([]);
    setIsSearching(false);
  }, [closePeerConnection]);

  useEffect(() => {
    if (!userId) return;

    const socket = io('http://localhost:3001', {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('matchFound', async (data: { role: MatchRole; room: string; partnerId: string; sharedInterests?: string[] }) => {
      roleRef.current = data.role;
      roomRef.current = data.room;
      setIsSearching(false);
      setIsMatched(true);
      setRoom(data.room);
      setPartnerId(data.partnerId);
      setSharedInterests(data.sharedInterests || []);
      setMessages((prev) => [
        ...prev,
        {
          id: 'sys-match-found',
          content:
            data.sharedInterests && data.sharedInterests.length > 0
              ? `You are now connected. You both like: ${data.sharedInterests.join(', ')}.`
              : 'You are now connected. Camera chat is starting.',
          senderName: 'System',
          createdAt: now(),
        },
      ]);

      createPeerConnection();
      await startOfferIfCaller();
      await flushPendingSignals();
    });

    socket.on('partnerDisconnected', () => {
      setMessages((prev) => [
        ...prev,
        {
          id: 'sys-disconnected',
          content: 'Your partner disconnected.',
          senderName: 'System',
          createdAt: now(),
        },
      ]);
      clearMatchState();
    });

    socket.on('matchMessageReceived', (data: { content: string; senderName: string; createdAt: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: data.content,
          senderName: data.senderName || 'Partner',
          createdAt: data.createdAt || now(),
        },
      ]);
    });

    socket.on('webrtcSignalReceived', async (data: { signal: WebRtcSignal }) => {
      try {
        await handleSignal(data.signal);
      } catch (error) {
        setCameraStatus('error');
        setCameraError('Video connection failed. Try leaving and matching again.');
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      closePeerConnection();
      stopCamera();
    };
  }, [clearMatchState, closePeerConnection, createPeerConnection, flushPendingSignals, handleSignal, startOfferIfCaller, stopCamera, userId]);

  const requestMatch = useCallback((matchUserId: string, country: string, interests: string[] = []) => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;

    lastRequestRef.current = { userId: matchUserId, country, interests };

    closePeerConnection();
    roleRef.current = null;
    roomRef.current = null;
    setIsSearching(true);
    setIsMatched(false);
    setPartnerId(null);
    setRoom(null);
    setSharedInterests([]);
    setMessages([]);
    setRemoteStream(null);

    socket.emit('requestMatch', { userId: matchUserId, country, interests });
  }, [closePeerConnection, isConnected]);

  const sendMatchMessage = useCallback((content: string) => {
    const socket = socketRef.current;
    const activeRoom = roomRef.current;
    const trimmed = content.trim();
    if (!socket || !activeRoom || !trimmed) return;

    socket.emit('sendMatchMessage', {
      room: activeRoom,
      content: trimmed,
      senderName: 'Me',
    });

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        content: trimmed,
        senderName: 'Me',
        createdAt: now(),
      },
    ]);
  }, []);

  const leaveMatch = useCallback(() => {
    const socket = socketRef.current;
    if (socket && roomRef.current) {
      socket.emit('leaveMatch');
    }
    clearMatchState();
  }, [clearMatchState]);

  const nextMatch = useCallback(() => {
    const socket = socketRef.current;
    const lastRequest = lastRequestRef.current;
    if (!socket || !lastRequest) return;

    if (roomRef.current) {
      socket.emit('leaveMatch');
    }
    requestMatch(lastRequest.userId, lastRequest.country, lastRequest.interests);
  }, [requestMatch]);

  return {
    isConnected,
    isSearching,
    isMatched,
    partnerId,
    room,
    sharedInterests,
    messages,
    localStream,
    remoteStream,
    cameraStatus,
    cameraError,
    isCameraEnabled,
    isMicEnabled,
    startCamera,
    stopCamera,
    toggleCamera,
    toggleMic,
    sendMatchMessage,
    requestMatch,
    leaveMatch,
    nextMatch,
  };
};
