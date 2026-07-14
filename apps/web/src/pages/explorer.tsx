import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout';
import { useAuth } from '@/context/auth-context';
import { TreeNode } from '@/components/tree-node';
import { useSocket } from '@/hooks/use-socket';
import { Compass, Users, Hash, Send, Plus, Minus, Info, MessageSquare, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface Channel {
  id: string;
  name: string;
  type: string;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  level: number;
  parentId?: string;
  children?: Community[];
  channels?: Channel[];
}

interface ChatMessage {
  id: string;
  content: string;
  senderName: string;
  createdAt: string;
}

export default function Explorer() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();

  const [tree, setTree] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reputationScore, setReputationScore] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage } = useSocket({
    channelId: selectedChannel?.id || null,
    userId: user?.id || null,
    onMessageReceived: (msg: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: msg.id || Math.random().toString(),
          content: msg.content,
          senderName: msg.senderName || 'Anonymous',
          createdAt: msg.createdAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch Community Tree
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchTree = async () => {
      try {
        setIsLoadingTree(true);
        const res = await fetch(`${API_BASE_URL}/api/v1/communities/tree`);
        if (!res.ok) throw new Error('Failed to load communities');
        const data = await res.json();
        setTree(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching tree:', err);
        setError('Could not connect to the BridgeUp API. Please try again shortly.');
        setTree([]);
      } finally {
        setIsLoadingTree(false);
      }
    };

    fetchTree();
    fetchJoinedList();
  }, [isAuthenticated]);

  // Fetch the current user's real profile (for reputation score, etc.)
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_BASE_URL}/api/v1/profiles/${user.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setReputationScore(data?.reputationScore ?? 0))
      .catch(() => setReputationScore(0));
  }, [user?.id]);

  // Fetch user's joined community list
  const fetchJoinedList = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/communities/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setJoinedCommunities(data.map((c: any) => c.id));
      }
    } catch (e) {
      console.warn('Could not fetch joined communities, using local state.');
    }
  };

  // Handle selection of a community node
  const handleSelectCommunity = async (comm: Community) => {
    const joined = joinedCommunities.includes(comm.id);
    setIsJoined(joined);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/communities/${comm.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSelectedCommunity(data);
      if (data.channels && data.channels.length > 0) {
        setSelectedChannel(data.channels[0]);
      } else {
        setSelectedChannel(null);
      }
    } catch (e) {
      setSelectedCommunity(comm);
      setSelectedChannel(null);
      setError('Could not load this community\'s channels. Please try again shortly.');
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Joining Community
  const handleJoin = async () => {
    if (!selectedCommunity || !token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/communities/${selectedCommunity.id}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error();

      setJoinedCommunities([...joinedCommunities, selectedCommunity.id]);
      setIsJoined(true);
    } catch (e) {
      setJoinedCommunities([...joinedCommunities, selectedCommunity.id]);
      setIsJoined(true);
    }
  };

  // Handle Leaving Community
  const handleLeave = async () => {
    if (!selectedCommunity || !token) return;

    try {
      await fetch(`${API_BASE_URL}/api/v1/communities/${selectedCommunity.id}/leave`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJoinedCommunities(joinedCommunities.filter((id) => id !== selectedCommunity.id));
      setIsJoined(false);
    } catch (e) {
      setJoinedCommunities(joinedCommunities.filter((id) => id !== selectedCommunity.id));
      setIsJoined(false);
    }
  };

  // Handle Sending Messages via real socket
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const content = messageInput.trim();
    if (!content || !selectedChannel) return;

    sendMessage(content);
    setMessageInput('');
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center min-h-[50vh]">
          <p className="text-text-secondary">Loading your profile session...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Directory Explorer | BridgeUp</title>
      </Head>

      {error && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm mb-6 max-w-7xl w-full mx-auto">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[75vh]">
        {/* Left Directory Tree Sidebar */}
        <div className="lg:col-span-1 bg-card/40 border border-border rounded-2xl p-4 flex flex-col max-h-[75vh] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
            <Compass className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-text-primary text-base">Community Trees</h2>
          </div>

          {isLoadingTree ? (
            <p className="text-text-secondary text-sm">Building directories...</p>
          ) : (
            <div className="space-y-1">
              {tree.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  selectedId={selectedCommunity?.id || null}
                  onSelect={handleSelectCommunity}
                />
              ))}
            </div>
          )}
        </div>

        {/* Middle Main Content/Chat Pane */}
        <div className="lg:col-span-2 bg-card/30 border border-border rounded-2xl flex flex-col max-h-[75vh] overflow-hidden">
          {selectedCommunity ? (
            <>
              {/* Community Header */}
              <div className="p-4 border-b border-border bg-card/60 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-text-primary text-lg">{selectedCommunity.name}</h2>
                  <p className="text-xs text-text-muted mt-0.5">{selectedCommunity.description}</p>
                </div>

                {isJoined ? (
                  <button
                    onClick={handleLeave}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                    Leave
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Join Hub
                  </button>
                )}
              </div>

              {/* Chat View */}
              {isJoined ? (
                <div className="flex-1 flex overflow-hidden">
                  {/* Channels Sidebar */}
                  <div className="w-1/3 border-r border-border bg-card/10 flex flex-col p-2 space-y-1">
                    <span className="text-xs font-bold text-text-muted uppercase px-2 py-1 tracking-wider">Channels</span>
                    {selectedCommunity.channels?.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => setSelectedChannel(ch)}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm text-left transition-colors font-medium ${
                          selectedChannel?.id === ch.id ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-card/20'
                        }`}
                      >
                        <Hash className="h-4 w-4 text-text-muted" />
                        <span className="truncate">{ch.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Messaging Panel */}
                  <div className="flex-1 flex flex-col overflow-hidden bg-background/20">
                    {selectedChannel ? (
                      <>
                        <div className="px-4 py-2 border-b border-border bg-card/20 flex items-center gap-1.5">
                          <Hash className="h-4 w-4 text-text-muted" />
                          <span className="font-bold text-sm text-text-primary">{selectedChannel.name}</span>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                          {messages.map((msg) => (
                            <div key={msg.id} className="flex flex-col text-sm">
                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-text-primary">{msg.senderName}</span>
                                <span className="text-[10px] text-text-muted">{msg.createdAt}</span>
                              </div>
                              <p className="text-text-secondary mt-1 leading-relaxed bg-card/25 p-2 rounded-xl border border-border/40 inline-block max-w-[90%]">
                                {msg.content}
                              </p>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Text Input Footer */}
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-card/40 flex items-center gap-2">
                          <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder={`Message #${selectedChannel.name}`}
                            className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                          />
                          <button
                            type="submit"
                            className="p-2 bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors shrink-0"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-text-muted text-sm gap-1">
                        <MessageSquare className="h-4 w-4" />
                        Select a channel to chat
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-secondary">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Info className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-text-primary text-base">You haven't joined this community</h3>
                  <p className="text-sm max-w-sm mt-1 text-text-muted">
                    Join this hub to unlock and read announcements, general chats, study groups, and mentorship programs.
                  </p>
                  <button
                    onClick={handleJoin}
                    className="mt-4 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary/20"
                  >
                    Join {selectedCommunity.name} Hub
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-text-secondary">
              <Compass className="h-12 w-12 text-text-muted animate-pulse mb-4" />
              <h3 className="font-bold text-text-primary text-base">Explore BridgeUp Directory</h3>
              <p className="text-sm max-w-xs mt-1 text-text-muted">
                Navigate the community directory sidebar to join national hubs, cities, universities, and specific majors.
              </p>
            </div>
          )}
        </div>

        {/* Right Info Panel */}
        <div className="lg:col-span-1 bg-card/40 border border-border rounded-2xl p-4 flex flex-col max-h-[75vh] overflow-y-auto">
          {/* User Bio Summary */}
          <div className="pb-4 border-b border-border text-center">
            <div className="h-14 w-14 rounded-full bg-primary mx-auto flex items-center justify-center font-bold text-white text-lg shadow-md mb-2">
              {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <h3 className="font-bold text-text-primary text-base">{user?.fullName || 'User Profile'}</h3>
            <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-semibold">
              Reputation: {reputationScore ?? '—'}
            </div>
          </div>

          {/* Joined Stats */}
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                My Hubs ({joinedCommunities.length})
              </h4>

              {joinedCommunities.length === 0 ? (
                <p className="text-xs text-text-muted italic">You haven't joined any communities yet.</p>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-[40vh] overflow-y-auto">
                  <div className="text-xs text-text-secondary space-y-1">
                    <p className="bg-card/60 p-2 rounded-lg border border-border/50 text-text-primary font-medium">Joined Hubs active.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
