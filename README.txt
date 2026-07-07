BRIDGEUP
========

BridgeUp is a global, interest-first social platform. Instead of organizing
people by country -> city -> university like a traditional directory, BridgeUp
leads with what you care about: interests, communities, discussions, events,
and a smart, Ome.tv-style live video match that pairs you with strangers who
actually share your interests instead of a pure random roll.

See PRODUCT_VISION.md and HOMEPAGE_CONCEPT.md for the full product direction.


WHAT'S REAL IN THIS BUILD
--------------------------

Every feature below is backed by a real NestJS API and a real SQLite database
via Prisma - nothing on the homepage or in these flows is hardcoded demo data.

- Accounts: email/password signup and login (JWT + bcrypt). See "A note on
  authentication" below - this layer is intentionally basic for now.

- Communities: a real, joinable community tree with persisted text channels
  and real-time chat (Socket.IO), plus a set of flat, interest-first
  communities (AI Builders, Cybersecurity Beginners, Startup Founders Circle,
  UI/UX Design Lab) alongside the legacy country/city/university hub.

- Live Match (the "advanced Ome.tv" feature): real 1:1 WebRTC video chat
  between two browsers, matched live through a Socket.IO signaling server.
  What makes it unique:
    * Smart matching - add interests to your profile and the matchmaker
      prefers a stranger who shares them over a purely random pairing,
      falling back to country/global matching when nobody overlaps.
    * A "You both like: X, Y" banner when a shared interest drove the match.
    * A real "Next" button to skip to a new stranger, the classic Ome.tv loop.

- Discussions: post a question or topic, reply, browse the real feed - no
  fake reply counts, no fake "active now" numbers.

- Events: host a real event with a start time, browse upcoming events, and a
  working RSVP toggle.

- Discover People: a real feed of recently joined profiles, with their real
  interests, headline, and country.

- Homepage: every stat and every card (trending interests, live activity,
  top communities, discussions, people, events) is fetched from the API. If
  the API is unreachable, sections show an honest empty/error state instead
  of injecting fake fallback content.

- Installable on mobile (PWA): a real web app manifest, a hand-written
  service worker (app shell caching only - it never caches API calls, so
  live data and auth always hit the network), and an install prompt that
  triggers the native "Add to Home Screen" flow on Android/Chrome/Edge, with
  manual instructions shown on iOS Safari (which doesn't support the
  install-prompt API).


A NOTE ON AUTHENTICATION
--------------------------

Per the current phase of this project, authentication is intentionally left
basic: email + password with bcrypt hashing and a signed JWT. There is no
email verification, password reset, OAuth, 2FA, or rate limiting yet. Treat
it as a working placeholder, not a production-hardened auth system.


TECH STACK
--------------------------

- apps/web    Next.js (Pages Router) + React + Tailwind CSS + Socket.IO client
- apps/api    NestJS + Prisma + SQLite (dev.db) + Socket.IO gateway + JWT auth
- packages/*  Shared TypeScript types and config across the monorepo

docker-compose.yml provisions Postgres and Redis for a future production
setup, but the current local dev environment runs entirely on SQLite via
Prisma - you do not need Docker to run this project locally.


GETTING STARTED
--------------------------

1. Install dependencies and set up the database:

     ./setup.sh

   (This runs `npm install`, builds the shared @bridgeup/types package, and
   runs `prisma db push` + `prisma db seed` against apps/api/prisma/dev.db.)

2. Start both apps in dev mode:

     npm run dev

   - Web:  http://localhost:3000
   - API:  http://localhost:3001/api/v1

3. Open http://localhost:3000, sign up for an account, add a few interests
   on your Profile page, then open two browser tabs/devices and try
   Live Match to see the smart-matching and Next button in action.

4. To try the installable PWA on a phone: open the site on your phone over
   the same network (use your machine's LAN IP instead of localhost), and
   use the "Install BridgeUp" banner or your browser's "Add to Home Screen".


PROJECT LAYOUT
--------------------------

apps/api/prisma/schema.prisma   Database schema (users, profiles, interests,
                                 communities, channels, messages, discussions,
                                 events, mentorship requests)
apps/api/prisma/seed.ts         Seeds skills, interests, starter communities,
                                 starter discussions/events
apps/api/src/chat/chat.gateway.ts   Socket.IO gateway: community chat,
                                     Live Match queue/signaling, presence stats
apps/web/src/pages/live-match.tsx   Live Match UI (camera, matching, chat)
apps/web/src/pages/index.tsx        Real-data homepage
apps/web/public/manifest.json       PWA manifest
apps/web/public/sw.js               PWA service worker
