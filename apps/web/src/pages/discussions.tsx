import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Layout } from '@/components/layout';
import { useAuth } from '@/context/auth-context';
import { AlertCircle, MessageSquare, Plus, Send, X } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api/v1';

interface Reply {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

interface Discussion {
  id: string;
  title: string;
  body: string;
  interestTag: string | null;
  communityName: string | null;
  authorName: string;
  replyCount: number;
  createdAt: string;
  replies?: Reply[];
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Discussions() {
  const { token, isAuthenticated } = useAuth();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [interestTag, setInterestTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDiscussions = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/discussions?limit=30`);
      if (!res.ok) throw new Error();
      setDiscussions(await res.json());
      setError(null);
    } catch {
      setError('Could not load discussions from the BridgeUp API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiscussions();
  }, []);

  const toggleExpand = async (discussion: Discussion) => {
    if (expandedId === discussion.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(discussion.id);
    if (!discussion.replies) {
      try {
        const res = await fetch(`${API_BASE}/discussions/${discussion.id}`);
        if (!res.ok) return;
        const data = await res.json();
        setDiscussions((prev) => prev.map((d) => (d.id === discussion.id ? { ...d, replies: data.replies } : d)));
      } catch {
        // ignore
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, body, interestTag: interestTag || undefined }),
      });
      if (!res.ok) throw new Error();
      setTitle('');
      setBody('');
      setInterestTag('');
      setShowForm(false);
      await loadDiscussions();
    } catch {
      setError('Failed to post your discussion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (discussionId: string) => {
    const content = (replyDrafts[discussionId] || '').trim();
    if (!content || !token) return;
    try {
      const res = await fetch(`${API_BASE}/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error();
      const reply = await res.json();
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === discussionId
            ? {
                ...d,
                replyCount: d.replyCount + 1,
                replies: [...(d.replies || []), { id: reply.id, content, authorName: 'You', createdAt: reply.createdAt }],
              }
            : d
        )
      );
      setReplyDrafts((prev) => ({ ...prev, [discussionId]: '' }));
    } catch {
      setError('Failed to post your reply.');
    }
  };

  return (
    <Layout>
      <Head>
        <title>Discussions | BridgeUp</title>
      </Head>

      <div className="mx-auto w-full max-w-3xl py-4">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Discussions</h1>
              <p className="text-xs text-text-secondary">Ask, answer, and debate with the BridgeUp community.</p>
            </div>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover"
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? 'Cancel' : 'New Discussion'}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="mb-6 space-y-3 rounded-2xl border border-border bg-card p-5">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Discussion title"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="text"
              value={interestTag}
              onChange={(e) => setInterestTag(e.target.value)}
              placeholder="Interest tag (optional, e.g. AI)"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              {isSubmitting ? 'Posting...' : 'Post Discussion'}
            </button>
          </form>
        )}

        {isLoading ? (
          <p className="text-sm text-text-secondary">Loading discussions...</p>
        ) : discussions.length === 0 ? (
          <p className="text-sm text-text-muted">No discussions yet. Be the first to start one.</p>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <div key={discussion.id} className="rounded-2xl border border-border bg-card/60 p-5">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="font-semibold text-blue-500">{discussion.interestTag || discussion.communityName || 'General'}</span>
                  <span>-</span>
                  <span>{discussion.authorName}</span>
                  <span>-</span>
                  <span>{timeAgo(discussion.createdAt)}</span>
                </div>
                <h2 className="mt-2 text-lg font-bold text-text-primary">{discussion.title}</h2>
                <p className="mt-1 text-sm leading-6 text-text-secondary">{discussion.body}</p>

                <button
                  onClick={() => toggleExpand(discussion)}
                  className="mt-3 text-xs font-semibold text-primary hover:underline"
                >
                  {expandedId === discussion.id ? 'Hide replies' : `View replies (${discussion.replyCount})`}
                </button>

                {expandedId === discussion.id && (
                  <div className="mt-3 space-y-3 border-t border-border pt-3">
                    {(discussion.replies || []).map((reply) => (
                      <div key={reply.id} className="rounded-xl border border-border/50 bg-background/50 p-3 text-sm">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-text-primary">{reply.authorName}</span>
                          <span className="text-[10px] text-text-muted">{timeAgo(reply.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-text-secondary">{reply.content}</p>
                      </div>
                    ))}
                    {(discussion.replies || []).length === 0 && (
                      <p className="text-xs text-text-muted">No replies yet.</p>
                    )}

                    {isAuthenticated && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={replyDrafts[discussion.id] || ''}
                          onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [discussion.id]: e.target.value }))}
                          placeholder="Write a reply..."
                          className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          onClick={() => handleReply(discussion.id)}
                          className="shrink-0 rounded-xl bg-primary p-2 text-white transition hover:bg-primary-hover"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
