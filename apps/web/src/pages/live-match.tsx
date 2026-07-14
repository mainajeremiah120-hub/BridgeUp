import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout';
import { useAuth } from '@/context/auth-context';
import { useMatchSocket } from '@/hooks/use-match-socket';
import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle,
  Loader2,
  Mic,
  MicOff,
  MonitorUp,
  Send,
  Sparkles,
  SkipForward,
  Users,
  Video,
  X,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

export default function LiveMatch() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [country, setCountry] = useState('Global');
  const [messageInput, setMessageInput] = useState('');
  const [myInterests, setMyInterests] = useState<string[]>([]);

  const {
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
    toggleCamera,
    toggleMic,
    sendMatchMessage,
    requestMatch,
    leaveMatch,
    nextMatch,
  } = useMatchSocket(user?.id || null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (!user?.id || !token) return;
    fetch(`${API_BASE_URL}/api/v1/profiles/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.interests) setMyInterests(data.interests);
      })
      .catch(() => {});
  }, [user?.id, token]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFindMatch = async () => {
    const cameraReady = await startCamera();
    if (cameraReady) {
      requestMatch(user?.id || '', country, myInterests);
    }
  };

  const handleSendMatchMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMatchMessage(messageInput);
    setMessageInput('');
  };

  const resetSearch = () => {
    leaveMatch();
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <p className="text-text-secondary">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Live Match | BridgeUp</title>
      </Head>

      <div className="w-full py-4">
        <div className="mb-6 flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Live Match</h1>
              <p className="text-xs text-text-secondary">Video chat with someone matched by region and curiosity.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusPill active={isConnected} activeText="Socket connected" inactiveText="Socket offline" />
            <StatusPill active={cameraStatus === 'ready'} activeText="Camera ready" inactiveText="Camera off" />
          </div>
        </div>

        {cameraError && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        <div className="mb-4 flex items-start gap-2 rounded-xl border border-border bg-card/40 px-4 py-3 text-sm">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
          {myInterests.length > 0 ? (
            <span className="text-text-secondary">
              Smart matching using your interests:{' '}
              {myInterests.map((interest) => (
                <span key={interest} className="mr-1.5 inline-block rounded-full border border-blue-400/20 bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-300">
                  {interest}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-text-secondary">
              Add interests on your{' '}
              <a href="/profile" className="font-semibold text-primary hover:underline">
                profile
              </a>{' '}
              so BridgeUp can match you with someone who cares about the same things.
            </span>
          )}
        </div>

        {isMatched && sharedInterests.length > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>You both like: {sharedInterests.join(', ')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative min-h-[360px] bg-black md:min-h-[560px]">
              {isMatched && remoteStream ? (
                <video ref={remoteVideoRef} autoPlay playsInline className="h-full min-h-[360px] w-full object-cover md:min-h-[560px]" />
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center md:min-h-[560px]">
                  {isSearching ? (
                    <>
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-300" />
                      </div>
                      <h2 className="text-xl font-bold text-text-primary">Searching for a camera match...</h2>
                      <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
                        Your camera is ready. We are looking for someone in {country} who is available now.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-xl font-bold text-text-primary">Ready to meet someone live?</h2>
                      <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
                        Turn on your camera and BridgeUp will connect you for a 1:1 video conversation.
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="absolute bottom-4 right-4 w-36 overflow-hidden rounded-xl border border-border bg-background shadow-2xl sm:w-48">
                {localStream ? (
                  <video ref={localVideoRef} autoPlay playsInline muted className="aspect-video w-full bg-black object-cover" />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-background text-text-muted">
                    <CameraOff className="h-6 w-6" />
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                  <span>You</span>
                  <span>{cameraStatus}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-border bg-card/80 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="w-full max-w-xs">
                <label className="mb-1.5 block text-sm font-medium text-text-secondary">Region</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={isSearching || isMatched}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                >
                  <option value="Global">Global (anywhere)</option>
                  <option value="KE">Kenya</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="DE">Germany</option>
                  <option value="ZA">South Africa</option>
                  <option value="NG">Nigeria</option>
                  <option value="IN">India</option>
                  <option value="BR">Brazil</option>
                  <option value="CA">Canada</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={localStream ? toggleCamera : startCamera}
                  disabled={cameraStatus === 'starting'}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-text-primary transition hover:border-primary disabled:opacity-60"
                  title={isCameraEnabled ? 'Turn camera off' : 'Turn camera on'}
                >
                  {cameraStatus === 'starting' ? <Loader2 className="h-5 w-5 animate-spin" /> : isCameraEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
                </button>

                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={!localStream}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-text-primary transition hover:border-primary disabled:opacity-60"
                  title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
                >
                  {isMicEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>

                {!isMatched ? (
                  <button
                    type="button"
                    onClick={isSearching ? resetSearch : handleFindMatch}
                    disabled={!isConnected || cameraStatus === 'starting'}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-60"
                  >
                    {isSearching ? <X className="h-4 w-4" /> : <MonitorUp className="h-4 w-4" />}
                    {isSearching ? 'Cancel Search' : 'Find Camera Match'}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={nextMatch}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover"
                      title="Skip to a new stranger"
                    >
                      <SkipForward className="h-4 w-4" />
                      Next
                    </button>
                    <button
                      type="button"
                      onClick={leaveMatch}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                    >
                      <X className="h-4 w-4" />
                      Leave
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          <aside className="flex min-h-[540px] flex-col rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-2">
                {isMatched ? <CheckCircle className="h-5 w-5 text-blue-300" /> : <Video className="h-5 w-5 text-primary" />}
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-text-primary">{isMatched ? 'Matched' : 'Match chat'}</h2>
                  <p className="truncate text-xs text-text-muted">{isMatched ? `Partner: ${partnerId || 'Connected'} - Room: ${room}` : 'Messages appear after matching'}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-background/20 p-4">
              {messages.length === 0 ? (
                <p className="rounded-xl border border-border/60 bg-background/50 p-3 text-sm leading-6 text-text-muted">
                  Start a camera match to open the conversation.
                </p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col text-sm">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-text-primary">{msg.senderName}</span>
                      <span className="text-[10px] text-text-muted">{msg.createdAt}</span>
                    </div>
                    <p className="mt-1 inline-block max-w-[95%] rounded-xl border border-border/50 bg-card/35 p-3 leading-relaxed text-text-secondary">
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMatchMessage} className="flex items-center gap-2 border-t border-border bg-card/70 p-3">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                disabled={!isMatched}
                className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-primary p-2.5 text-white transition hover:bg-primary-hover disabled:opacity-50"
                disabled={!isMatched || !messageInput.trim()}
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </aside>
        </div>
      </div>
    </Layout>
  );
}

function StatusPill({ active, activeText, inactiveText }: { active: boolean; activeText: string; inactiveText: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${active ? 'border-blue-400/20 bg-blue-500/10 text-blue-300' : 'border-border bg-card text-text-muted'}`}>
      <span className={`h-2 w-2 rounded-full ${active ? 'bg-blue-300' : 'bg-text-muted'}`} />
      {active ? activeText : inactiveText}
    </span>
  );
}
