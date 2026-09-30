# Wallpaper SaaS

Production-ready wallpaper platform built with Next.js, MongoDB, Bunny Storage/CDN and Vercel.

## Stack

- Next.js 16 App Router + TypeScript
- React 19
- MongoDB Atlas + Mongoose
- NextAuth credentials authentication
- Sharp image processing
- Bunny Storage + Bunny CDN
- Vercel

## Product routes

- \`/\` — landing page and latest visual collection
- \`/items\` — searchable Pinterest-style wallpaper feed
- \`/items/[slug]\` — public wallpaper detail page
- \`/profile/[username]\` — public publisher/member profile
- \`/publisher\` — publisher workspace
- \`/admin\` — administration
- \`/account\` — account, saved items and download history

Legacy public wallpaper URLs under \`/wallpapers/*\` permanently redirect to \`/items/*\`.

## Media architecture

MongoDB stores metadata only. Bunny Storage holds optimized WebP assets. Public media is delivered through short-lived application-signed URLs and server-side Bunny token URLs; Bunny management credentials never go to the browser.

Each upload selects exactly one target device:

- PC → \`feature_wallpapers/pc/*.webp\`
- Tablet → \`feature_wallpapers/tab/*.webp\`
- Mobile → \`feature_wallpapers/mobile/*.webp\`

There is no thumbnail/original storage requirement in the current flow.

## Local setup

1. Copy \`.env.example\` to \`.env.local\`.
2. Fill MongoDB, NextAuth and Bunny values.
3. Install dependencies with \`npm ci\`.
4. Run \`npm run diagnose\` to validate integrations.
5. Run \`npm run dev\`.
6. Open \`http://localhost:3000\`.

## Verification and release tests

Static/core checks:

\`\`\`bash
npm run typecheck
npm test
npm run lint
npm run build
\`\`\`

Or run the static release gate in one command:

\`\`\`bash
npm run test:all
\`\`\`

Production-server smoke test:

\`\`\`bash
npm run build
npm run start
TEST_BASE_URL=http://localhost:3000 npm run test:smoke
\`\`\`

For a DB-backed smoke check:

\`\`\`text
SMOKE_DEEP=1 SMOKE_PUBLIC_ROUTES=1 TEST_BASE_URL=http://localhost:3000 npm run test:smoke
\`\`\`

Baseline load test:

\`\`\`text
TEST_BASE_URL=http://localhost:3000 LOAD_TEST_REQUESTS=100 LOAD_TEST_CONCURRENCY=10 npm run test:load
\`\`\`

Publisher integration test:

\`\`\`text
TEST_PUBLISHER_EMAIL=publisher@example.com TEST_PUBLISHER_PASSWORD='your-password' npm run test-publisher
\`\`\`

The CI pipeline runs typecheck, core/image tests, lint, production build, production-server smoke tests and a 100-request/10-concurrency baseline load test.

## Scheduled publishing

New uploads receive a publish time 20 seconds after processing. The app also checks due uploads during normal requests, and `/api/cron/publish` runs every minute in production so publishing does not depend on a user opening a page. Configure `CRON_SECRET` in Vercel. Vercel plans have different Cron frequency limits; the included once-per-minute schedule requires a plan that supports that interval.

## Security baseline

The application disables the framework-powered-by header and adds standard browser security headers in production. Public/authenticated write endpoints use a dependency-free per-instance rate limiter in addition to validation and authentication.

The rate limiter is intentionally lightweight. For multi-region/global enforcement, back it with a shared store such as Redis/Vercel KV before treating the in-process limiter as the only abuse-control layer.

## Environment

Use \`.env.example\` as the source of variable names. Never commit \`.env.local\`, MongoDB credentials, Bunny API keys or NextAuth secrets.

## Database/storage maintenance

Existing migration scripts remain available:

\`\`\`bash
npm run migrate:bunny-wallpapers
npm run migrate:user-profiles
\`\`\`
