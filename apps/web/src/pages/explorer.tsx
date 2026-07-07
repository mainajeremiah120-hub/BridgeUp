import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout';
import { useAuth } from '@/context/auth-context';
import { TreeNode } from '@/components/tree-node';
import { useSocket } from '@/hooks/use-socket';
import { Compass, Users, Hash, Send, Plus, Minus, Info, MessageSquare, AlertCircle } from 'lucide-react';

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
        const res = await fetch('http://localhost:3001/api/v1/communities/tree');
        if (!res.ok) throw new Error('Failed to load communities');
        const data = await res.json();
        setTree(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching tree:', err);
        setError('Could not connect to the BridgeUp API. Displaying offline demo data.');
        setTree([
          {
            id: '1',
            name: 'Kenya',
            slug: 'kenya',
            description: 'Kenya national community hub',
            level: 0,
            children: [
              {
                id: '2',
                name: 'Nairobi',
                slug: 'nairobi',
                description: 'Nairobi city community hub',
                level: 1,
                parentId: '1',
                children: [
                  {
                    id: '3',
                    name: 'Multimedia University',
                    slug: 'multimedia-university',
                    description: 'Multimedia University of Kenya student hub',
                    level: 2,
                    parentId: '2',
                    children: [
                      {
                        id: '4',
                        name: 'Software Engineering',
                        slug: 'software-engineering',
                        description: 'Software Engineering department community',
                        level: 3,
                        parentId: '3',
                        children: [
                          {
                            id: '5',
                            name: 'Cybersecurity',
                            slug: 'cybersecurity',
                            description: 'Cybersecurity interest and study group',
                            level: 4,
                            parentId: '4',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ]);
      } finally {
        setIsLoadingTree(false);
      }
    };

    fetchTree();
    fetchJoinedList();
  }, [isAuthenticated]);

  // Fetch user's joined community list
  const fetchJoinedList = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:3001/api/v1/communities/my', {
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
      const res = await fetch(`http://localhost:3001/api/v1/communities/${comm.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSelectedCommunity(data);
      if (data.channels && data.channels.length > 0) {
        setSelectedChannel(data.channels[0]);
      } else {
        setSelectedChannel(null);
      }
    } catch (e) {
      const mockChannels = [
        { id: `${comm.id}-gen`, name: 'general', type: 'text' },
        { id: `${comm.id}-ann`, name: 'announcements', type: 'text' },
        { id: `${comm.id}-study`, name: 'study-group', type: 'text' },
      ];
      const hydratedComm = { ...comm, channels: mockChannels };
      setSelectedCommunity(hydratedComm);
      setSelectedChannel(mockChannels[0]);
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
      const res = await fetch(`http://localhost:3001/api/v1/communities/${selectedCommunity.id}/join`, {
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
      await fetch(`http://localhost:3001/api/v1/communities/${selectedCommunity.id}/leave`, {
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
            <h2 className="font-bold text-white text-base">Community Trees</h2>
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
                  <h2 className="font-bold text-white text-lg">{selectedCommunity.name}</h2>
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
                          selectedChannel?.id === ch.id ? 'bg-border text-white' : 'text-text-secondary hover:text-white hover:bg-card/20'
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
                          <span className="font-bold text-sm text-white">{selectedChannel.name}</span>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                          {messages.map((msg) => (
                            <div key={msg.id} className="flex flex-col text-sm">
                              <div className="flex items-baseline gap-2">
                                <span className="font-bold text-white">{msg.senderName}</span>
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
                            className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
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
                  <h3 className="font-bold text-white text-base">You haven't joined this community</h3>
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
              <h3 className="font-bold text-white text-base">Explore BridgeUp Directory</h3>
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
            <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-500 to-teal-400 mx-auto flex items-center justify-center font-bold text-white text-lg shadow-md mb-2">
              {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <h3 className="font-bold text-white text-base">{user?.fullName || 'User Profile'}</h3>
            <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500/10 text-teal-400 rounded-full text-[10px] font-semibold">
              Reputation: 10
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
                    <p className="bg-card/60 p-2 rounded-lg border border-border/50 text-white font-medium">Joined Hubs active.</p>
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
