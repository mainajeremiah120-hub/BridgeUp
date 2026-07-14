import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api';

interface UseSocketProps {
  channelId: string | null;
  userId: string | null;
  onMessageReceived: (message: any) => void;
}

export const useSocket = ({ channelId, userId, onMessageReceived }: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!channelId || !userId) return;

    // Connect to NestJS API Socket Server
    const socket = io(API_BASE_URL, {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected to backend server.');

      // Join the channel room
      socket.emit('joinChannel', channelId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected from backend server.');
    });

    // Listen for new messages
    socket.on('messageReceived', (message: any) => {
      onMessageReceived(message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [channelId, userId]);

  // Method to emit sendMessage
  const sendMessage = (content: string) => {
    if (socketRef.current && isConnected && channelId && userId) {
      socketRef.current.emit('sendMessage', {
        channelId,
        senderId: userId,
        content,
      });
    } else {
      console.warn('Socket not connected. Message not sent.');
    }
  };

  return { isConnected, sendMessage };
};
