import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Layout } from '@/components/layout';
import { useAuth } from '@/context/auth-context';
import { AlertCircle, CalendarDays, CheckCircle, Plus, Users, X } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

const API_BASE = `${API_BASE_URL}/api/v1`;

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  interestTag: string | null;
  communityName: string | null;
  hostName: string;
  startsAt: string;
  rsvpCount: number;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Events() {
  const { token, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [rsvped, setRsvped] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [interestTag, setInterestTag] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/events?upcoming=true&limit=30`);
      if (!res.ok) throw new Error();
      setEvents(await res.json());
      setError(null);
    } catch {
      setError('Could not load events from the BridgeUp API.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !startsAt) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title,
          description: description || undefined,
          interestTag: interestTag || undefined,
          startsAt: new Date(startsAt).toISOString(),
        }),
      });
      if (!res.ok) throw new Error();
      setTitle('');
      setDescription('');
      setInterestTag('');
      setStartsAt('');
      setShowForm(false);
      await loadEvents();
    } catch {
      setError('Failed to create your event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRsvp = async (eventId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRsvped((prev) => ({ ...prev, [eventId]: data.rsvped }));
      setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, rsvpCount: data.count } : event)));
    } catch {
      setError('Failed to update your RSVP.');
    }
  };

  return (
    <Layout>
      <Head>
        <title>Events | BridgeUp</title>
      </Head>

      <div className="mx-auto w-full max-w-3xl py-4">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Events</h1>
              <p className="text-xs text-text-secondary">Workshops, sprints, and standups happening across BridgeUp.</p>
            </div>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover"
            >
              {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showForm ? 'Cancel' : 'Host an Event'}
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
              placeholder="Event title"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={interestTag}
                onChange={(e) => setInterestTag(e.target.value)}
                placeholder="Interest tag (optional, e.g. AI)"
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        )}

        {isLoading ? (
          <p className="text-sm text-text-secondary">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-text-muted">No upcoming events yet. Host the first one.</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="rounded-2xl border border-border bg-card/60 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-blue-300">{event.interestTag || event.communityName || 'General'}</span>
                    <h2 className="mt-1 text-lg font-bold text-text-primary">{event.title}</h2>
                    {event.description && <p className="mt-1 text-sm leading-6 text-text-secondary">{event.description}</p>}
                    <p className="mt-2 text-xs text-text-muted">
                      Hosted by {event.hostName} - {formatDate(event.startsAt)}
                    </p>
                  </div>

                  {isAuthenticated && (
                    <button
                      onClick={() => handleRsvp(event.id)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        rsvped[event.id]
                          ? 'border border-blue-400/30 bg-blue-500/10 text-blue-300'
                          : 'bg-primary text-white hover:bg-primary-hover'
                      }`}
                    >
                      {rsvped[event.id] ? <CheckCircle className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                      {rsvped[event.id] ? 'Going' : 'RSVP'}
                    </button>
                  )}
                </div>
                <p className="mt-3 text-xs text-text-muted">{event.rsvpCount} people going</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
