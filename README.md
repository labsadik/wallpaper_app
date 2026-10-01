# Wallpaper SaaS

Production-oriented wallpaper discovery and publishing platform built with Next.js, React, TypeScript, Tailwind CSS, MongoDB Atlas, NextAuth, Sharp, Bunny Storage/CDN and Vercel.

> Release note: CI covers typecheck, core/image tests, lint, production build, production-server smoke testing and baseline load testing. A local stress run also completed 100,000 requests against /api/health at 2,598 concurrent workers with 0 failures. This is a server-responsiveness baseline, not proof of one deployment supporting one million concurrent real users.

## Screenshots / UI reference

![Landing and gallery](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%204_52_12%20PM.png)
![Item/detail](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%204_52_24%20PM.png)
![Profile](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%204_52_55%20PM.png)
![Publisher workspace](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%204_53_00%20PM.png)
![Upload flow](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_03_23%20PM.png)
![Account](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_02_31%20PM.png)
![Admin](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_03_10%20PM.png)
![Moderation](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_03_05%20PM.png)
![Item actions](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_02_01%20PM.png)
![Responsive reference](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_02_09%20PM.png)

## What the product does

Wallpaper SaaS is a visual-first platform with four workflows:

- Discover: browse a responsive wallpaper feed, search title/category/tags, filter categories and sort by newest, title, likes or downloads.
- Publish: approved publishers upload an image, choose exactly one target device and let the server validate, analyze, resize and optimize it.
- Engage: users can like, save, share and download published wallpapers. Public browsing and sharing work without login.
- Manage: admins manage users, roles, publisher verification, suspensions, bans and wallpaper moderation.

The UI uses shared Tailwind patterns for controls, cards, typography, spacing, responsive layouts, focus states and feedback. Images keep natural proportions instead of being forced into a single crop.

## Technology

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16.3.7 App Router |
| Language | TypeScript |
| UI | React 19.2 + Tailwind CSS 4 |
| Database | MongoDB Atlas |
| ODM | Mongoose 9 |
| Auth | NextAuth 4 credentials |
| Validation | Zod |
| Password hashing | bcryptjs |
| Image processing | Sharp |
| Storage | Bunny Storage |
| CDN | Bunny CDN |
| Hosting | Vercel |
| Automation | Vercel Cron |
| CI | GitHub Actions |

Node.js requirement: >=20.9.0. CI uses Node 22.

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

Public media flow:
Browser -> signed same-origin /api/media URL -> HMAC and expiry validation -> server-created Bunny token URL -> CDN.

Publisher flow:
Browser -> authenticated upload route -> validation -> Sharp -> selected WebP device asset -> Bunny Storage -> MongoDB metadata -> pending review -> automatic/background publish.

Download flow:
Browser -> authenticated download route -> user/device authorization -> Bunny signed asset -> safe download response.

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
      error.tsx
      global-error.tsx
      loading.tsx
      not-found.tsx
      layout.tsx
      page.tsx
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
      make-admin.ts
      load-test.ts
      smoke-test.ts
      test-core.ts
      test-image-processing.ts
      test-publisher.ts
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

## Routes

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

Legacy public routes:
- /wallpapers -> /items
- /wallpapers/[slug] -> /items/[slug]

API routes intentionally keep the /api namespace.

## Main features

### Accounts
- Credentials registration/login
- Session-aware roles
- Public username
- Avatar upload/update
- Account status
- Saved wallpaper history
- Download history
- Public profile link

### Social profiles
- Public profiles for members and publishers
- Publisher verification badge
- Follower/following counts
- Wallpaper count
- Total download count
- Follow/unfollow
- Share profile
- Followers and following pages

### Wallpaper discovery
- Search title/category/tags
- Category filters
- Newest
- Title A-Z
- Title Z-A
- Most liked
- Most downloaded
- Responsive visual masonry/feed
- Natural aspect ratios
- Item detail page
- PC, Tablet and Mobile viewer

### Interactions
- Like/unlike
- Save/unsave
- Share
- Device-specific download
- Download progress
- Public browse/share without login

### Publisher
- Image picker and preview
- Upload progress
- Processing progress
- Exactly one device per upload
- PC, Tablet, Mobile targets
- Quality warning for smaller sources
- SHA-256 duplicate detection
- Pending review state
- Automatic publishing
- Private preview
- Publisher dashboard

### Admin
- Platform metrics
- User search/filtering
- Role changes
- Timed/permanent suspensions
- Ban/unban
- Publisher verification
- Last-admin protection
- User post inspection
- Publish/remove/restore wallpaper moderation

## Image processing

Accepted input:
- JPEG
- PNG
- WebP
- AVIF

Sharp performs metadata analysis, EXIF-aware rotation, resize without enlargement and optimized WebP output.

Target resize boxes:
- PC: 2560 x 2560
- Tablet: 2048 x 2048
- Mobile: 1600 x 1600

The current publisher flow requires exactly one target device per post. Only the selected optimized asset is stored for that post.

Sources below 1920 x 1080 are accepted with a quality warning.

## Storage

Wallpaper assets:

    feature_wallpapers/pc/*.webp
    feature_wallpapers/tab/*.webp
    feature_wallpapers/mobile/*.webp

Profile avatars use the avatars/ namespace.

MongoDB stores metadata and object keys. Bunny management credentials stay server-side.

The current storage flow does not require separate thumbnail/original objects.

## Security

Current protections include:
- Server-side authentication and authorization
- Role checks
- Active/suspended/banned account handling
- Password hashing
- HMAC-signed application media URLs
- Short-lived Bunny CDN token URLs
- Server-only Bunny credentials
- Input validation
- Upload-size protection
- Image format validation
- SHA-256 duplicate detection
- Rate limiting
- Security response headers
- Production HSTS
- poweredByHeader disabled
- Protected downloads and publisher/admin actions

Important scaling limitation: the current rate limiter is dependency-free and per application instance. Multi-instance or multi-region deployments should move rate limiting to a shared Redis/Vercel KV-style store.

## Local setup

### 1. Verify Node.js

    node -v
    npm -v
    where.exe node
    where.exe npm

The project requires Node >=20.9.0. Node 22 is the CI-verified runtime.

### 2. Clone

    git clone https://github.com/WorkRCS/wallpaper_app.git
    cd wallpaper_app

### 3. Create environment file

PowerShell:

    Copy-Item .env.example .env.local

### 4. Configure .env.local

    NEXT_PUBLIC_APP_URL=http://localhost:3000
    NEXT_PUBLIC_APP_NAME=Wallpaper SaaS

    MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
    MONGODB_DB_NAME=wallpaper_saas

    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=<long-random-secret>
    MEDIA_SIGNING_SECRET=<long-random-secret>

    BUNNY_STORAGE_ZONE=<storage-zone-name>
    BUNNY_STORAGE_PASSWORD=<storage-write-password>
    BUNNY_STORAGE_HOSTNAME=storage.bunnycdn.com

    BUNNY_CDN_HOSTNAME=<pull-zone-hostname>
    BUNNY_PULL_ZONE_ID=<pull-zone-id>
    BUNNY_CDN_TOKEN_KEY=<pull-zone-token-key>

    MAX_UPLOAD_SIZE_MB=25
    IMAGE_QUALITY_WEBP=90
    IMAGE_QUALITY_AVIF=85

    CRON_SECRET=<long-random-secret>
    TEST_BASE_URL=http://localhost:3000

Never commit .env.local or production secrets.

### 5. Install

This repository currently has no lockfile, so use:

    npm install

### 6. Diagnose

    npm run diagnose

### 7. Run

    npm run dev

Open http://localhost:3000.

## Production build locally

    npm run build
    npm run start

Set production NEXT_PUBLIC_APP_URL to the real HTTPS domain. The root layout now uses it as metadataBase.

## Testing

Full release gate:

    npm run test:all

Individual:

    npm run typecheck
    npm test
    npm run lint
    npm run build

Smoke test with production server running:

    $env:TEST_BASE_URL="http://localhost:3000"
    npm run test:smoke

Public route smoke:

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

The load script targets one endpoint, with /api/health as the default, so it is not a substitute for realistic mixed-traffic testing.

Publisher integration test:

    $env:TEST_PUBLISHER_EMAIL="publisher@example.com"
    $env:TEST_PUBLISHER_PASSWORD="your-password"
    npm run test-publisher

## CI

GitHub Actions runs for pull requests and pushes to main.

Pipeline:
1. Checkout
2. Node 22 setup
3. npm install
4. typecheck
5. core/image tests
6. lint
7. production build
8. production server startup
9. smoke test
10. baseline load test
11. cleanup

## Vercel production setup

1. Import this repository into Vercel.
2. Use the normal Next.js framework detection.
3. Use npm install as the install command.
4. Add every production variable from .env.example.
5. Set NEXT_PUBLIC_APP_URL and NEXTAUTH_URL to the HTTPS domain.
6. Configure MongoDB Atlas network/database access.
7. Configure Bunny Storage and Pull Zone.
8. Enable Bunny token authentication.
9. Set CRON_SECRET.
10. Confirm the Vercel plan supports the configured cron frequency.
11. Deploy.
12. Verify /api/health, diagnostics and production smoke checks.

## Existing data and migrations

Available:

    npm run migrate:bunny-wallpapers
    npm run migrate:user-profiles

The Bunny migration handles known DB-referenced legacy wallpaper storage objects. It does not prove every unknown/orphan Bunny object has been removed.

Before launch, review:
- Wallpaper variant keys and missing assets
- Publisher references
- Historical usernames/profile fields
- Like/save/download/share counter consistency
- Pending/rejected/archived states
- Orphaned Bunny objects

A successful migration is not the same as a full data-integrity audit.

## SEO

Included:
- Route metadata
- Canonical URLs
- Open Graph metadata
- Twitter cards
- robots
- sitemap
- metadataBase
- Canonical public item routes under /items/[slug]

## Performance

Current choices:
- Next.js App Router/server rendering
- Responsive next/image
- Bounded list queries
- MongoDB indexes on common fields
- Lean MongoDB reads
- Promise.all for independent queries
- Optimized WebP assets
- Bunny CDN
- Short-lived media tokens
- Skeleton loading states
- Secure downloads
- Security headers

## Scaling

The current architecture is designed as a production foundation that can scale through infrastructure upgrades, but code changes are still expected at very large traffic.

Important next-scale work:
- Shared Redis/KV rate limiting
- MongoDB Atlas query/index/pool monitoring
- Atlas Search when regex search becomes a bottleneck
- Durable background jobs/workers for high upload volume
- Counter reconciliation/aggregation
- Bunny bandwidth/cache planning
- Centralized logs, request IDs, error aggregation and alerting
- Mixed real-user load tests across pages, DB APIs, downloads and media

A health-endpoint benchmark alone cannot prove one million-user capacity.

## Troubleshooting

### npm is not recognized

    node -v
    npm -v
    where.exe node
    where.exe npm

Restart PowerShell after changing the Node.js PATH.

### Hydration warning around next/image

The application previously passed draggable={false} into next/image. That caused a server/client attribute mismatch in profile image markup. The UI now uses CSS for image drag protection and does not pass that unstable attribute to next/image.

### MetadataBase warning

Set:

    NEXT_PUBLIC_APP_URL=http://localhost:3000

locally, and the real HTTPS domain in production.

### Bunny 401

Check that:
- BUNNY_STORAGE_ZONE is the Storage Zone name, not its numeric ID
- BUNNY_STORAGE_PASSWORD is the Storage API write password
- the storage hostname is correct
- the Pull Zone hostname is correct
- the CDN token key is correct

### Image exists in Bunny but does not render

Check the MongoDB variant key, Bunny object path, CDN hostname, CDN token key, media signing secret and media URL expiry.

## Production checklist

Before opening public publisher uploads:
- [ ] MongoDB Atlas configured
- [ ] Atlas indexes/slow queries reviewed
- [ ] HTTPS domain configured
- [ ] NEXT_PUBLIC_APP_URL correct
- [ ] NEXTAUTH_URL correct
- [ ] Strong auth/media/cron secrets set
- [ ] Bunny Storage configured
- [ ] Bunny Pull Zone configured
- [ ] Bunny token auth enabled
- [ ] Cron frequency supported
- [ ] Existing data migrations reviewed
- [ ] Orphaned media reviewed
- [ ] Publisher integration test completed
- [ ] Production smoke test passed
- [ ] Monitoring/error reporting configured
- [ ] Shared rate limiting planned before multi-region scale

## Commands

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
Testing: TypeScript, ESLint, integration scripts and GitHub Actions
Security: server authorization, signed media, validation, rate limiting and security headers

This repository is structured as a production-oriented application foundation with clear boundaries between frontend, authentication/API, data, image processing, storage, automation and deployment.
