import Head from 'next/head';
import Link from 'next/link';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout';
import { useAuth } from '@/context/auth-context';
import {
  ArrowUpRight,
  CalendarDays,
  Compass,
  Flame,
  Globe2,
  MessageSquare,
  Sparkles,
  Star,
  Users,
  Video,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

const API_BASE = `${API_BASE_URL}/api/v1`;

interface Stats {
  totalUsers: number;
  totalCommunities: number;
  onlineNow: number;
  searchingNow: number;
  activeMatches: number;
}

interface InterestRow {
  name: string;
  profileCount: number;
}

interface DiscussionRow {
  id: string;
  title: string;
  interestTag: string | null;
  communityName: string | null;
  authorName: string;
  replyCount: number;
  createdAt: string;
}

interface CommunityRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  memberCount: number;
}

interface DiscoverPersonRow {
  id: string;
  fullName: string;
  headline: string | null;
  profession: string | null;
  countryCode: string;
  interests: string[];
}

interface EventRow {
  id: string;
  title: string;
  interestTag: string | null;
  communityName: string | null;
  hostName: string;
  startsAt: string;
  rsvpCount: number;
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatEventTime(dateStr: string) {
  const date = new Date(dateStr);
  const diffMs = date.getTime() - Date.now();
  const hours = Math.round(diffMs / 3600000);
  if (hours <= 0) return 'Starting now';
  if (hours < 24) return `Starts in ${hours}h`;
  const days = Math.round(hours / 24);
  return `In ${days}d - ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
}

async function safeJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? '/explorer' : '/signup';

  const [stats, setStats] = useState<Stats | null>(null);
  const [interests, setInterests] = useState<InterestRow[] | null>(null);
  const [discussions, setDiscussions] = useState<DiscussionRow[] | null>(null);
  const [communities, setCommunities] = useState<CommunityRow[] | null>(null);
  const [people, setPeople] = useState<DiscoverPersonRow[] | null>(null);
  const [events, setEvents] = useState<EventRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      safeJson<Stats>(`${API_BASE}/stats/overview`),
      safeJson<InterestRow[]>(`${API_BASE}/interests`),
      safeJson<DiscussionRow[]>(`${API_BASE}/discussions?limit=4`),
      safeJson<CommunityRow[]>(`${API_BASE}/communities`),
      safeJson<DiscoverPersonRow[]>(`${API_BASE}/profiles/discover?limit=3`),
      safeJson<EventRow[]>(`${API_BASE}/events?upcoming=true&limit=3`),
    ]).then(([statsRes, interestsRes, discussionsRes, communitiesRes, peopleRes, eventsRes]) => {
      if (cancelled) return;
      setStats(statsRes);
      setInterests(interestsRes);
      setDiscussions(discussionsRes);
      setCommunities(communitiesRes);
      setPeople(peopleRes);
      setEvents(eventsRes);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const topInterests = (interests ?? []).slice(0, 4);
  const topCommunities = (communities ?? [])
    .slice()
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 3);

  return (
    <Layout>
      <Head>
        <title>BridgeUp | Find Your People By Interest</title>
      </Head>

      <div className="space-y-12 pb-10">
        <section className="grid min-h-[78vh] items-center gap-8 py-6 lg:grid-cols-[1fr_0.92fr]">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-blue-400/25 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-600">
              <Sparkles className="h-3.5 w-3.5" />
              {stats ? `${stats.onlineNow} people online right now` : 'Global communities are live now'}
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-normal text-text-primary sm:text-6xl">
              Find your people by interest, skill, and ambition.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
              Join global communities, live rooms, discussions, mentors, events, and collaborators around what you care about.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover"
              >
                <Compass className="h-4 w-4" />
                Explore Interests
              </Link>
              <Link
                href={isAuthenticated ? '/live-match' : '/login'}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-blue-400/40"
              >
                <Video className="h-4 w-4" />
                Join Live Match
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3 text-left">
              {[
                [stats ? stats.totalUsers.toLocaleString() : '-', 'people joined'],
                [stats ? stats.totalCommunities.toLocaleString() : '-', 'communities'],
                [stats ? stats.onlineNow.toLocaleString() : '-', 'online right now'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-border bg-card/45 p-4">
                  <p className="text-xl font-bold text-text-primary">{value}</p>
                  <p className="mt-1 text-xs text-text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-lg border border-border bg-card/60 p-4 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-blue-300" />
                <div>
                  <p className="text-sm font-bold text-text-primary">Live right now</p>
                  <p className="text-xs text-text-muted">Interest matched, not location locked</p>
                </div>
              </div>
              <span className="rounded-lg bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-600">Live</span>
            </div>

            <div className="grid gap-3">
              <div className="rounded-lg border border-border bg-background/70 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Video className="h-5 w-5 text-blue-300" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">Live Match video chat</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {stats ? `${stats.activeMatches} live conversations - ${stats.searchingNow} searching now` : 'Loading live activity...'}
                    </p>
                  </div>
                  <Link href="/live-match">
                    <ArrowUpRight className="h-4 w-4 text-text-muted" />
                  </Link>
                </div>
              </div>

              {topCommunities.map((community) => (
                <div key={community.id} className="rounded-lg border border-border bg-background/70 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-blue-300" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-text-primary">{community.name}</p>
                      <p className="mt-0.5 text-xs text-text-muted">{community.memberCount} members</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-text-muted" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(interests ?? []).slice(0, 6).map((interest) => (
                <Link
                  key={interest.name}
                  href={`/discussions?interest=${encodeURIComponent(interest.name)}`}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-primary hover:text-primary"
                >
                  {interest.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {topInterests.length === 0 && (
            <p className="col-span-full text-sm text-text-muted">No interests yet - be the first to add one from your profile.</p>
          )}
          {topInterests.map((interest) => (
            <Link
              key={interest.name}
              href={`/discussions?interest=${encodeURIComponent(interest.name)}`}
              className="rounded-lg border border-border bg-primary/5 p-5 text-blue-600 transition hover:bg-primary/10"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-primary">{interest.name}</h2>
                <Flame className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm text-text-secondary">{interest.profileCount} people interested</p>
            </Link>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-lg border border-border bg-card/45 p-5">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-bold text-text-primary">Popular Discussions</h2>
            </div>
            <div className="space-y-3">
              {discussions && discussions.length === 0 && (
                <p className="text-sm text-text-muted">
                  No discussions yet.{' '}
                  <Link href="/discussions" className="text-primary hover:underline">
                    Start the first one
                  </Link>
                  .
                </p>
              )}
              {(discussions ?? []).map((discussion) => (
                <Link
                  key={discussion.id}
                  href="/discussions"
                  className="block rounded-lg border border-border bg-background/70 p-4 transition hover:border-primary/40"
                >
                  <p className="font-semibold text-text-primary">{discussion.title}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {discussion.interestTag || discussion.communityName || 'General'} - {discussion.replyCount} replies - {timeAgo(discussion.createdAt)}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/45 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-300" />
              <h2 className="text-lg font-bold text-text-primary">Top Communities</h2>
            </div>
            <div className="space-y-3">
              {communities && communities.length === 0 && <p className="text-sm text-text-muted">No communities yet.</p>}
              {(communities ?? []).slice(0, 4).map((community) => (
                <Link
                  key={community.id}
                  href="/explorer"
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/70 p-4 transition hover:border-primary/40"
                >
                  <div>
                    <p className="font-semibold text-text-primary">{community.name}</p>
                    <p className="mt-1 text-xs text-text-muted">{community.memberCount} members</p>
                  </div>
                  <Star className="h-4 w-4 text-blue-500" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card/45 p-5">
            <h2 className="mb-4 text-lg font-bold text-text-primary">People You May Like</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {people && people.length === 0 && <p className="col-span-full text-sm text-text-muted">No profiles yet - be the first to join.</p>}
              {(people ?? []).map((person) => (
                <div key={person.id} className="rounded-lg border border-border bg-background/70 p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                    {person.fullName ? person.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <p className="font-semibold text-text-primary">{person.fullName}</p>
                  <p className="mt-1 text-xs text-text-muted">{person.headline || person.profession || person.countryCode}</p>
                  {person.interests.length > 0 && (
                    <p className="mt-1 text-xs text-blue-300">{person.interests.slice(0, 2).join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/45 p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-bold text-text-primary">Events Happening Soon</h2>
            </div>
            <div className="space-y-3">
              {events && events.length === 0 && (
                <p className="text-sm text-text-muted">
                  No upcoming events yet.{' '}
                  <Link href="/events" className="text-primary hover:underline">
                    Host one
                  </Link>
                  .
                </p>
              )}
              {(events ?? []).map((event) => (
                <Link
                  key={event.id}
                  href="/events"
                  className="block rounded-lg border border-border bg-background/70 p-4 transition hover:border-primary/40"
                >
                  <p className="font-semibold text-text-primary">{event.title}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {event.interestTag || event.communityName || 'General'} - {formatEventTime(event.startsAt)} - {event.rsvpCount} going
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
