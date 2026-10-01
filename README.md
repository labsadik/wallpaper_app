# Wallpaper SaaS

Production-oriented wallpaper discovery and publishing platform built with Next.js, React, TypeScript, Tailwind CSS, MongoDB Atlas, NextAuth, Sharp, Bunny Storage/CDN and Vercel.

> Current release evidence: GitHub CI covers typecheck, core/image tests, lint, production build, production-server smoke testing and baseline load testing. A local stress run completed 100,000 requests against /api/health at 2,598 concurrent workers with 0 failures. This is a server-responsiveness baseline, not proof of one deployment supporting one million concurrent real users.

## Screenshots / UI reference

![Landing and gallery](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%204_52_12%20PM.png)

![Item detail](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%204_52_24%20PM.png)

![Profile](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%204_52_55%20PM.png)

![Publisher workspace](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%204_53_00%20PM.png)

![Upload flow](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_03_23%20PM.png)

![Account](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_02_31%20PM.png)

![Admin](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_03_10%20PM.png)

![Moderation](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_03_05%20PM.png)

![Item actions](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_02_01%20PM.png)

![Responsive reference](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_02_09%20PM.png)

## What the product does

Wallpaper SaaS has four main workflows:

- Discover: search, categories, sorting and visual wallpaper browsing.
- Publish: approved publishers upload an image, choose exactly one target device and receive server-side processing and optimization.
- Engage: users can like, save and download; public visitors can browse and share.
- Manage: admins manage users, roles, verification, suspensions, bans and wallpaper moderation.

The frontend follows a consistent Tailwind-first design system with responsive layouts, reusable controls, loading states, focus states and natural image proportions.

## Technology stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16.3.7 App Router |
| Language | TypeScript |
| UI | React 19.2 + Tailwind CSS 4 |
| Database | MongoDB Atlas |
| ODM | Mongoose 9 |
| Authentication | NextAuth 4 credentials |
| Validation | Zod |
| Password hashing | bcryptjs |
| Image processing | Sharp |
| Storage | Bunny Storage |
| CDN | Bunny CDN |
| Hosting | Vercel |
| Scheduling | Vercel Cron |
| CI | GitHub Actions |

The package requires Node.js >=20.9.0. CI currently verifies Node 22.

## Architecture

    Browser
       |
       v
    Next.js App Router
       |-- Server Components
       |-- API Route Handlers
       |-- NextAuth sessions
       |
       +--> MongoDB Atlas
       |
       +--> Sharp --> Bunny Storage --> Bunny CDN
       |
       +--> Vercel Cron

Public media:
Browser -> signed same-origin media URL -> HMAC/expiry verification -> server-created Bunny token URL -> Bunny CDN.

Publisher upload:
Browser -> authenticated upload API -> validation -> Sharp -> selected WebP variant -> Bunny Storage -> MongoDB metadata -> pending review -> auto/background publish.

Download:
Browser -> authenticated download API -> authorization/device check -> Bunny signed asset -> safe download response.

## Repository structure

    app/
      account/
      admin/
      api/
      items/
      login/
      profile/
      publisher/
      register/
      wallpapers/          legacy redirect routes
      layout.tsx
      globals.css
      page.tsx
      error.tsx
      global-error.tsx
      loading.tsx
      not-found.tsx
      robots.ts
      sitemap.ts

    components/
      ui.tsx
      page-shell.tsx
      header.tsx
      site-footer.tsx
      wallpaper-card.tsx
      wallpaper-viewer.tsx
      wallpaper-actions.tsx
      profile-*.tsx
      publisher-*.tsx
      admin-*.tsx
      skeleton/loading components

    lib/
      admin.ts
      auth.ts
      bunny.ts
      images.ts
      media.ts
      mongodb.ts
      rate-limit.ts
      wallpaper-devices.ts
      wallpaper-publish.ts

    models/
      User.ts
      Wallpaper.ts
      Follow.ts
      Like.ts
      Save.ts
      Download.ts

    scripts/
      diagnose.ts
      load-test.ts
      smoke-test.ts
      test-core.ts
      test-image-processing.ts
      test-publisher.ts
      make-admin.ts
      migrate-bunny-wallpaper-storage.ts
      migrate-user-profiles.ts

    docs/
      implementation-plan.md

    proxy.ts
    next.config.ts
    vercel.json
    package.json
    .env.example
    .github/workflows/ci.yml

## Main routes

Public:
- /
- /items
- /items/[slug]
- /profile/[username]
- /profile/[username]/followers
- /profile/[username]/following
- /login
- /register

Authenticated:
- /account
- /account/saves
- /account/downloads

Publisher:
- /publisher
- /publisher/upload

Admin:
- /admin
- /admin/users
- /admin/users/[id]
- /admin/wallpapers

Legacy public redirects:
- /wallpapers -> /items
- /wallpapers/[slug] -> /items/[slug]

API endpoints intentionally remain under /api.

## User features

- Credentials registration and login
- Role-aware sessions
- Public usernames and profiles
- Avatar upload/update
- Publisher verification badge
- Follow/unfollow and profile sharing
- Saved wallpaper collection
- Download history
- Like/unlike
- Share
- Device-specific downloads
- Responsive wallpaper feed
- Natural aspect-ratio image viewing

## Publisher features

- JPEG, PNG, WebP and AVIF input
- Local image preview
- Upload and processing progress
- Title and category
- Exactly one target device per post
- PC, Tablet and Mobile targets
- SHA-256 duplicate detection
- Quality warning for smaller sources
- WebP optimization
- Pending-review state
- Auto-publish countdown
- Private preview
- Publisher dashboard

## Admin features

- Platform metrics
- User search/filtering
- User/publisher/admin roles
- Timed or permanent suspension
- Ban/unban
- Publisher verification
- Last-admin protection
- User post inspection
- Publish/remove/restore moderation actions

## Image processing

Supported input:
- JPEG
- PNG
- WebP
- AVIF

Sharp performs image metadata analysis, EXIF-aware rotation, resize without enlargement and WebP encoding.

Maximum resize boxes:
- PC: 2560 x 2560
- Tablet: 2048 x 2048
- Mobile: 1600 x 1600

The current upload flow requires exactly one target device and stores only the selected optimized asset for that post. A source below 1920 x 1080 is accepted with a quality warning.

## Bunny Storage

Wallpaper paths:

    feature_wallpapers/pc/*.webp
    feature_wallpapers/tab/*.webp
    feature_wallpapers/mobile/*.webp

Avatar paths use the avatars namespace.

MongoDB stores metadata and object keys. Bunny storage/API secrets remain server-side.

## Secure media

Application media URLs use:

    /api/media/<encoded-key>?e=<expiry>&s=<signature>

The media route verifies HMAC and expiration, applies public/private access rules and creates the Bunny CDN token URL server-side.

## Authentication and authorization

Protected pages and API actions use server-side session and role checks. UI visibility is not treated as security.

Roles:
- user
- publisher
- admin

Account states:
- active
- suspended
- banned

## UI/UX system

The UI uses a consistent design system rather than isolated page styles:

- Tailwind utilities for application surfaces
- shared Button/Input/Select/Card/Badge primitives
- consistent control heights
- consistent spacing and borders
- responsive layouts
- mobile-first wrapping
- keyboard-visible focus rings
- skeleton/loading states
- clear success/error/status feedback
- accessible labels
- natural image proportions

Image drag protection is CSS-based. The application avoids passing the unstable draggable attribute through next/image.

## Local setup

### 1. Verify Node and npm

    node -v
    npm -v
    where.exe node
    where.exe npm

The project requires Node.js >=20.9.0. Node 22 is the CI-verified runtime.

### 2. Clone

    git clone https://github.com/WorkRCS/wallpaper_app.git
    cd wallpaper_app

### 3. Create environment file

PowerShell:

    Copy-Item .env.example .env.local

### 4. Configure environment

Core:

    NEXT_PUBLIC_APP_URL=http://localhost:3000
    NEXT_PUBLIC_APP_NAME=Wallpaper SaaS

MongoDB:

    MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
    MONGODB_DB_NAME=wallpaper_saas

Auth/media:

    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=<long-random-secret>
    MEDIA_SIGNING_SECRET=<long-random-secret>

Bunny Storage:

    BUNNY_STORAGE_ZONE=<storage-zone-name>
    BUNNY_STORAGE_PASSWORD=<storage-write-password>
    BUNNY_STORAGE_HOSTNAME=storage.bunnycdn.com

Bunny CDN:

    BUNNY_CDN_HOSTNAME=<pull-zone-hostname>
    BUNNY_PULL_ZONE_ID=<pull-zone-id>
    BUNNY_CDN_TOKEN_KEY=<pull-zone-token-key>

Image processing:

    MAX_UPLOAD_SIZE_MB=25
    IMAGE_QUALITY_WEBP=90
    IMAGE_QUALITY_AVIF=85

Cron:

    CRON_SECRET=<long-random-secret>

Testing:

    TEST_BASE_URL=http://localhost:3000

Never commit .env.local or production secrets.

### 5. Install dependencies

The repository currently has no package-lock.json, so use:

    npm install

### 6. Diagnose integrations

    npm run diagnose

### 7. Start development

    npm run dev

Open http://localhost:3000.

## Production build locally

    npm run build
    npm run start

Set NEXT_PUBLIC_APP_URL to the real HTTPS domain for production.

## Testing

Full release gate:

    npm run test:all

Individual checks:

    npm run typecheck
    npm test
    npm run lint
    npm run build

Production smoke:

    $env:TEST_BASE_URL="http://localhost:3000"
    npm run test:smoke

Public-route smoke:

    $env:TEST_BASE_URL="http://localhost:3000"
    $env:SMOKE_PUBLIC_ROUTES="1"
    npm run test:smoke

DB-backed smoke:

    $env:TEST_BASE_URL="http://localhost:3000"
    $env:SMOKE_DEEP="1"
    $env:SMOKE_PUBLIC_ROUTES="1"
    npm run test:smoke

Load baseline:

    $env:TEST_BASE_URL="http://localhost:3000"
    $env:LOAD_TEST_REQUESTS="100"
    $env:LOAD_TEST_CONCURRENCY="10"
    npm run test:load

High-volume health baseline:

    $env:TEST_BASE_URL="http://localhost:3000"
    $env:LOAD_TEST_REQUESTS="100000"
    $env:LOAD_TEST_CONCURRENCY="2598"
    npm run test:load

The load script targets one endpoint and defaults to /api/health, so it does not simulate full real-user traffic.

Publisher integration test:

    $env:TEST_PUBLISHER_EMAIL="publisher@example.com"
    $env:TEST_PUBLISHER_PASSWORD="your-password"
    npm run test-publisher

## GitHub Actions

CI runs on pull requests and pushes to main.

Pipeline:
1. Checkout
2. Node 22 setup
3. Dependency install
4. Typecheck
5. Core/image tests
6. Lint
7. Production build
8. Production server startup
9. Smoke test
10. Baseline load test
11. Cleanup

## Vercel production setup

1. Import the repository into Vercel.
2. Use the standard Next.js framework detection.
3. Use npm install as the install command.
4. Add every production variable from .env.example.
5. Set NEXT_PUBLIC_APP_URL and NEXTAUTH_URL to the HTTPS production domain.
6. Configure MongoDB Atlas network/database access.
7. Configure Bunny Storage and Pull Zone.
8. Enable Bunny token authentication.
9. Set CRON_SECRET.
10. Confirm the Vercel plan supports the configured cron frequency.
11. Deploy.
12. Verify /api/health, diagnose and production smoke tests.

## Scheduled publishing

New uploads receive a publish time 20 seconds after processing. The application also checks due records during normal requests.

The production endpoint:

    /api/cron/publish

is protected with:

    Authorization: Bearer <CRON_SECRET>

The included vercel.json schedules the endpoint every minute. The chosen Vercel plan must support that frequency.

## Existing data and migrations

Available:

    npm run migrate:bunny-wallpapers
    npm run migrate:user-profiles

The Bunny migration handles known DB-referenced legacy wallpaper objects. It does not prove every orphaned Bunny object has been removed.

Before public launch, review:
- wallpaper variant keys and missing assets
- publisher references
- historical usernames
- like/save/download/share counter consistency
- pending/rejected/archived states
- orphaned Bunny objects

A successful migration is not the same thing as a full data-integrity audit.

## Security baseline

Implemented:
- server-side authentication and authorization
- password hashing
- role/status enforcement
- signed media URLs
- short-lived Bunny tokens
- server-only storage/CDN credentials
- upload size and format validation
- SHA-256 duplicate detection
- rate limiting
- security response headers
- production HSTS
- disabled powered-by header

### Rate-limit scaling note

The current rate limiter is per application instance. Multi-instance or multi-region deployments should use shared Redis/Vercel KV-style state.

## SEO

Included:
- route metadata
- canonical URLs
- Open Graph metadata
- Twitter cards
- robots
- sitemap
- metadataBase
- canonical /items/[slug] URLs

Set:

    NEXT_PUBLIC_APP_URL=https://your-domain.example

## Performance strategy

Current choices include:
- Next.js App Router/server rendering
- next/image with responsive sizes
- bounded database queries
- Mongoose lean reads
- parallel database queries
- MongoDB indexes on common fields
- optimized WebP storage
- Bunny CDN
- short-lived media tokens
- skeleton loading states
- secure download flow

## Scaling guidance

The project is a production foundation, but a health-endpoint benchmark cannot prove one million-user capacity.

At very large scale, plan for:
- shared Redis/KV rate limiting
- MongoDB Atlas tier/index/query/pool monitoring
- Atlas Search when regex search becomes a bottleneck
- durable queues/workers for high upload volume
- counter reconciliation/aggregation
- Bunny cache/bandwidth planning
- centralized logs, request IDs, error aggregation and alerting
- mixed-traffic load tests across pages, APIs, downloads and media

## Troubleshooting

### npm is not recognized

    node -v
    npm -v
    where.exe node
    where.exe npm

Restart PowerShell after changing Node.js PATH.

### next/image hydration warning

The reported mismatch was the server/client difference for draggable="false" on a profile next/image element. The repository now removes that prop from application next/image usage and uses CSS for drag protection.

### metadataBase warning

Set:

    NEXT_PUBLIC_APP_URL=http://localhost:3000

locally and the real HTTPS domain in production.

### Bunny 401

Check:
- Storage Zone name, not numeric ID
- Storage API write password
- correct storage hostname
- correct Pull Zone hostname
- correct CDN token key

### Image exists in Bunny but is not visible

Check the MongoDB variant key, object path, CDN hostname, token key, media signing secret and URL expiration.

## Production checklist

Before opening publisher uploads:

- [ ] MongoDB Atlas configured
- [ ] MongoDB indexes/slow queries reviewed
- [ ] HTTPS domain configured
- [ ] NEXT_PUBLIC_APP_URL correct
- [ ] NEXTAUTH_URL correct
- [ ] strong auth/media/cron secrets set
- [ ] Bunny Storage configured
- [ ] Bunny Pull Zone configured
- [ ] Bunny token authentication enabled
- [ ] cron frequency supported
- [ ] migrations reviewed
- [ ] orphaned media reviewed
- [ ] publisher integration test completed
- [ ] production smoke test passed
- [ ] monitoring/error reporting configured
- [ ] shared rate limiting planned before multi-region scale

## Commands reference

    npm install
    npm run dev
    npm run build
    npm run start
    npm run typecheck
    npm test
    npm run lint
    npm run test:all
    npm run test:smoke
    npm run test:load
    npm run test-publisher
    npm run diagnose
    npm run make-admin
    npm run migrate:bunny-wallpapers
    npm run migrate:user-profiles

## Production summary

Frontend: Next.js App Router + React + Tailwind CSS
Backend: Next.js Route Handlers + NextAuth + Mongoose
Database: MongoDB Atlas
Image processing: Sharp
Storage: Bunny Storage
CDN: Bunny CDN
Hosting: Vercel
Automation: Vercel Cron
CI: GitHub Actions
Security: server authorization, signed media, validation, rate limiting and security headers

The codebase is organized so the UI, API/auth, database, media processing, storage and deployment layers have clear boundaries and can be upgraded independently as traffic grows.
