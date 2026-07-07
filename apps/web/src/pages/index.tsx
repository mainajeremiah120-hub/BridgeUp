import Head from 'next/head';
import Link from 'next/link';
import type React from 'react';
import { Layout } from '@/components/layout';
import { useAuth } from '@/context/auth-context';
import {
  ArrowUpRight,
  CalendarDays,
  Compass,
  Flame,
  Globe2,
  MessageSquare,
  Mic2,
  Sparkles,
  Star,
  Users,
  Video,
} from 'lucide-react';

const trendingInterests = [
  { name: 'AI', people: '18.4k', discussions: 312, rooms: 9, accent: 'text-blue-300 border-blue-400/30 bg-blue-500/10' },
  { name: 'Cybersecurity', people: '12.8k', discussions: 184, rooms: 6, accent: 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10' },
  { name: 'Startups', people: '9.7k', discussions: 126, rooms: 4, accent: 'text-amber-300 border-amber-400/30 bg-amber-500/10' },
  { name: 'Design', people: '7.9k', discussions: 98, rooms: 5, accent: 'text-rose-300 border-rose-400/30 bg-rose-500/10' },
];

const liveRooms = [
  { title: 'AI Builders Room', meta: '42 listening - 8 speaking', icon: Mic2 },
  { title: 'English Practice', meta: '19 online - beginner friendly', icon: MessageSquare },
  { title: 'Startup Pitch Feedback', meta: '11 founders - live now', icon: Video },
];

const discussions = [
  { title: 'What should I learn after Python?', meta: 'Programming - 128 replies - active now' },
  { title: 'Best beginner cybersecurity labs?', meta: 'Cybersecurity - 76 replies - 14 viewing' },
  { title: 'Is AI replacing junior designers?', meta: 'AI + Design - 210 replies' },
];

const communities = [
  { name: 'AI Builders', meta: '48.2k members - 1.3k online' },
  { name: 'Cybersecurity Beginners', meta: '22.8k members - 840 online' },
  { name: 'French-English Exchange', meta: '16.4k members - 390 online' },
];

const people = [
  { name: 'Amina', role: 'UX designer learning AI', initials: 'AM', accent: 'bg-rose-500' },
  { name: 'Noah', role: 'Mentors in Python', initials: 'NO', accent: 'bg-blue-500' },
  { name: 'Priya', role: 'Building a startup', initials: 'PR', accent: 'bg-emerald-500' },
];

const events = [
  { title: 'Portfolio Review Night', time: 'Today - Design Lab' },
  { title: 'Beginner CTF Sprint', time: 'Tomorrow - Cybersecurity' },
  { title: 'Global Founder Standup', time: 'Friday - Startups' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? '/explorer' : '/signup';

  return (
    <Layout>
      <Head>
        <title>BridgeUp | Find Your People By Interest</title>
      </Head>

      <div className="space-y-12 pb-10">
        <section className="grid min-h-[78vh] items-center gap-8 py-6 lg:grid-cols-[1fr_0.92fr]">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Global communities are live now
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-normal text-white sm:text-6xl">
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
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-white transition hover:border-teal-400/40"
              >
                <Video className="h-4 w-4" />
                Join Live Rooms
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3 text-left">
              {[
                ['58k+', 'active learners'],
                ['740+', 'live rooms weekly'],
                ['120+', 'countries represented'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-border bg-card/45 p-4">
                  <p className="text-xl font-bold text-white">{value}</p>
                  <p className="mt-1 text-xs text-text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-lg border border-border bg-card/60 p-4 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-teal-300" />
                <div>
                  <p className="text-sm font-bold text-white">Live global activity</p>
                  <p className="text-xs text-text-muted">Interest matched, not location locked</p>
                </div>
              </div>
              <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">Live</span>
            </div>

            <div className="grid gap-3">
              {liveRooms.map((room) => {
                const Icon = room.icon;
                return (
                  <div key={room.title} className="rounded-lg border border-border bg-background/70 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-blue-300" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{room.title}</p>
                        <p className="mt-0.5 text-xs text-text-muted">{room.meta}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-text-muted" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {['Programming', 'Fitness', 'Business', 'Psychology', 'Music', 'Languages'].map((tag) => (
                <span key={tag} className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-text-secondary">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {trendingInterests.map((interest) => (
            <article key={interest.name} className={`rounded-lg border p-5 ${interest.accent}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{interest.name}</h2>
                <Flame className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm text-text-secondary">{interest.people} people</p>
              <p className="mt-1 text-sm text-text-muted">{interest.discussions} discussions today</p>
              <p className="mt-1 text-sm text-text-muted">{interest.rooms} live rooms</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-lg border border-border bg-card/45 p-5">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-amber-300" />
              <h2 className="text-lg font-bold text-white">Popular Discussions</h2>
            </div>
            <div className="space-y-3">
              {discussions.map((discussion) => (
                <div key={discussion.title} className="rounded-lg border border-border bg-background/70 p-4">
                  <p className="font-semibold text-white">{discussion.title}</p>
                  <p className="mt-1 text-xs text-text-muted">{discussion.meta}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/45 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-300" />
              <h2 className="text-lg font-bold text-white">Top Communities</h2>
            </div>
            <div className="space-y-3">
              {communities.map((community) => (
                <div key={community.name} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/70 p-4">
                  <div>
                    <p className="font-semibold text-white">{community.name}</p>
                    <p className="mt-1 text-xs text-text-muted">{community.meta}</p>
                  </div>
                  <Star className="h-4 w-4 text-amber-300" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card/45 p-5">
            <h2 className="mb-4 text-lg font-bold text-white">People You May Like</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {people.map((person) => (
                <div key={person.name} className="rounded-lg border border-border bg-background/70 p-4">
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${person.accent} text-sm font-bold text-white`}>
                    {person.initials}
                  </div>
                  <p className="font-semibold text-white">{person.name}</p>
                  <p className="mt-1 text-xs text-text-muted">{person.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/45 p-5">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-rose-300" />
              <h2 className="text-lg font-bold text-white">Events Happening Now</h2>
            </div>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.title} className="rounded-lg border border-border bg-background/70 p-4">
                  <p className="font-semibold text-white">{event.title}</p>
                  <p className="mt-1 text-xs text-text-muted">{event.time}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
