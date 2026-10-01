
# Wallpaper SaaS

A production-oriented wallpaper discovery and publishing SaaS built with **Next.js, React, TypeScript, Tailwind CSS, MongoDB Atlas, NextAuth, Sharp, Bunny Storage/CDN, Vercel and GitHub Actions**.

This repository contains the complete web application: public discovery, wallpaper detail pages, authentication, profiles, social actions, saved items, download history, publisher upload/processing, admin management, secure media delivery, automated publishing, migrations, diagnostics, smoke tests, load tests and CI.

> **Production status:** this is a deployable, production-oriented foundation with CI, security controls, integration diagnostics and deployment configuration already in the repository. It is not a claim of unlimited scale or a guarantee that every production dependency is configured for your environment. Remaining hardening work is documented below for high traffic and multi-region operation.

---

## Table of contents

1. What the application does
2. UI screenshots and visual reference
3. Main user journeys
4. Features
5. How the application is built
6. Technology stack
7. Architecture and request flow
8. Repository structure
9. Routes
10. API surface
11. Database model
12. Image processing pipeline
13. Authentication and authorization
14. Media storage and CDN
15. Local development setup
16. Environment variables
17. MongoDB Atlas setup
18. Bunny Storage and CDN setup
19. Create the first admin
20. Testing and verification
21. GitHub Actions CI
22. Vercel production deployment
23. Scheduled publishing
24. Migrations
25. Security baseline
26. Performance and scaling
27. Production-readiness checklist
28. Known limitations and next hardening steps
29. Troubleshooting
30. NPM command reference

---

## 1. What the application does

Wallpaper SaaS is a full-stack platform for publishing and discovering wallpapers.

There are three primary roles:

| Role | Purpose |
| --- | --- |
| **User** | Browse wallpapers, create an account, like, save and download |
| **Publisher** | Upload and manage wallpapers through Publisher Studio |
| **Admin** | Manage users, roles, verification and wallpaper moderation |

The current application supports:

- public wallpaper browsing
- search and category filtering
- sorting by newest, title, likes and downloads
- wallpaper detail pages
- PC, Tablet and Mobile target-device metadata
- login and registration
- public user profiles
- follower/following pages
- profile avatars
- verified publisher badges
- like/unlike
- save/unsave
- share counters
- authenticated downloads
- saved wallpaper collection
- download history
- publisher dashboard
- publisher upload and progress UI
- image validation and optimization with Sharp
- SHA-256 duplicate detection
- private publisher previews
- automatic publishing
- admin dashboard
- admin user management
- publisher verification
- suspension and ban controls
- wallpaper publish/remove/restore actions
- signed media delivery
- Bunny CDN signed asset delivery
- rate limiting
- security response headers
- SEO metadata, robots and sitemap
- production diagnostics
- smoke testing
- image-processing tests
- baseline load testing
- GitHub Actions CI
- Vercel Cron integration

---

## 2. UI screenshots and visual reference

These ImageKit references represent the current UI direction of the application.

### Landing / gallery

![Landing and gallery](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%204_52_12%20PM.png)

### Wallpaper detail

![Wallpaper detail](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%204_52_24%20PM.png)

### Public profile

![Public profile](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%204_52_55%20PM.png)

### Publisher Studio

![Publisher Studio](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%204_53_00%20PM.png)

### Publisher upload

![Publisher upload](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_03_23%20PM.png)

### Account

![Account](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_02_31%20PM.png)

### Admin console

![Admin console](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_03_10%20PM.png)

### Moderation UI

![Moderation](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_03_05%20PM.png)

### Wallpaper actions

![Wallpaper actions](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_02_01%20PM.png)

### Responsive reference

![Responsive reference](https://ik.imagekit.io/xvqovhmcyr/Wallpaper_app/Wallpaper%20SaaS%20-%20Google%20Chrome%2010_1_2026%205_02_09%20PM.png)

---

## 3. Main user journeys

### Visitor

1. Open the home page.
2. Browse the latest published wallpapers.
3. Open Discover at /items.
4. Search by title, category or tag.
5. Filter by category or change sorting.
6. Open a wallpaper at /items/[slug].
7. View the available device version.
8. Share the wallpaper page.
9. Register/login to unlock authenticated interactions and downloads.

### Registered user

1. Register with name, email and password.
2. The system creates a username automatically.
3. Login with credentials.
4. Like wallpapers.
5. Save wallpapers.
6. Follow public profiles.
7. Update the account avatar.
8. View saved wallpapers.
9. View download history.
10. Download a published wallpaper.

### Publisher

1. An admin grants the user the publisher role.
2. Open Publisher Studio.
3. Choose an image.
4. Enter the title and category.
5. Select exactly one target device: PC, Tablet or Mobile.
6. Upload the file.
7. The server validates and processes the image.
8. Duplicate detection runs using SHA-256.
9. The selected optimized WebP variant is stored in Bunny Storage.
10. Metadata is stored in MongoDB.
11. The item enters pending_review.
12. The current implementation assigns an automatic publish time roughly 20 seconds later.
13. Publisher/admin actions can publish or archive the item.

> **Important:** pending_review is currently an automatic short state, not a long-lived human approval queue. A future manual moderation workflow can replace this behavior.

### Admin

1. Login with an admin account.
2. Open the Admin Console.
3. View platform metrics.
4. Search/filter users.
5. Change user roles.
6. Verify/unverify publishers.
7. Suspend or unsuspend accounts.
8. Ban or unban accounts.
9. Inspect users and publisher posts.
10. Publish, remove or restore wallpaper records.

---

## 4. Features

### Discovery

- Responsive masonry-style wallpaper gallery
- Search across title, category and tags
- Category filters
- Newest
- Title A–Z and Z–A
- Most liked
- Most downloaded
- Natural image proportions
- Responsive image rendering
- Loading states
- Shareable item slugs

### Accounts

- Registration
- Credentials login
- JWT-based NextAuth session
- Public username
- Public profile
- Avatar upload
- Follow/unfollow
- Followers list
- Following list
- Saved wallpapers
- Download history
- Role-aware navigation

### Publisher Studio

- JPEG, PNG, WebP and AVIF input
- Configurable upload-size limit
- Local preview
- Upload progress
- Processing progress
- Title/category validation
- Exactly one target device per upload
- PC / Tablet / Mobile targets
- Quality status
- SHA-256 duplicate detection
- WebP optimization
- Private preview
- Automatic publishing
- Publisher dashboard
- Publisher archive/delete action

### Admin

- Platform overview metrics
- User search
- Role/status filters
- Role changes
- Publisher verification
- Timed suspension
- Permanent suspension
- Ban/unban
- Last-active-admin protection
- User inspection
- Wallpaper moderation
- Publish
- Remove/archive
- Restore to pending review
- Bulk publish-all action

### Security and platform controls

- Server-side authentication and authorization
- Password hashing with bcryptjs
- Zod validation
- Rate limiting
- HMAC application media signatures
- Short-lived Bunny CDN tokens
- Server-only Bunny credentials
- Upload size limits
- Allowed-image-format checks
- SHA-256 duplicate detection
- Security headers
- Production HSTS
- disabled powered-by header

### SEO

- Route metadata
- Canonical URLs
- Open Graph metadata
- Twitter cards
- metadataBase support
- robots.txt
- sitemap.xml
- canonical /items/[slug] URLs

---

## 5. How the application is built

The codebase is a single Next.js application with clear boundaries between UI, API handlers, database models, media utilities and deployment configuration.

### Frontend

- Next.js App Router
- React Server Components for server-rendered pages
- Client components where interaction is required
- TypeScript
- Tailwind CSS
- Reusable UI primitives
- Responsive layouts
- Accessible labels/focus states
- Loading and error boundaries

### Backend

The backend lives inside Next.js Route Handlers under /api.

The API layer handles:

- authentication
- registration
- profile updates
- follows
- publisher uploads
- publisher management
- wallpaper reads
- likes
- saves
- downloads
- shares
- admin actions
- media delivery
- health checks
- scheduled publishing

### Database

MongoDB Atlas stores:

- users
- wallpaper metadata
- source metadata
- device metadata
- follows
- likes
- saves
- downloads
- status information
- counters
- moderation/removal state

### Image processing

Sharp handles:

- metadata inspection
- EXIF-aware rotation
- resize
- no-enlargement protection
- WebP encoding

### Object storage and delivery

Bunny handles:

- wallpaper assets
- optimized WebP assets
- avatar assets
- CDN delivery
- short-lived signed asset URLs

### Hosting and automation

Vercel provides deployment and scheduled Cron execution.

GitHub Actions validates pull requests and pushes to main.

---

## 6. Technology stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16.3.7 |
| UI | React 19.2 |
| Language | TypeScript 5.9 |
| CSS | Tailwind CSS 4.3 |
| Database | MongoDB Atlas |
| ODM | Mongoose 9.10 |
| Authentication | NextAuth 4.24 |
| Validation | Zod 4 |
| Password hashing | bcryptjs 3 |
| Image processing | Sharp 0.35 |
| File storage | Bunny Storage |
| CDN | Bunny CDN |
| Hosting | Vercel |
| Scheduler | Vercel Cron |
| CI | GitHub Actions |
| Runtime | Node.js >= 20.9 |
| CI runtime | Node.js 22 |

The repository does not contain a package-lock.json, so local setup uses npm install.

---

## 7. Architecture and request flow

### High-level architecture

    Browser
      |
      v
    Next.js App Router
      |-- Server Components
      |-- Client Components
      |-- API Route Handlers
      |-- NextAuth sessions
      |
      +--> MongoDB Atlas
      |
      +--> Sharp --> Bunny Storage --> Bunny CDN
      |
      +--> Vercel Cron

    GitHub Actions
      |
      +--> typecheck
      +--> tests
      +--> lint
      +--> production build
      +--> smoke test
      +--> load baseline

### Public media flow

    Browser
      |
      v
    /api/media/<path>?e=<expiry>&s=<hmac>
      |
      +-- verify expiry
      +-- verify application HMAC
      +-- inspect public/private access
      |
      v
    Server creates Bunny signed URL
      |
      v
    Bunny CDN
      |
      v
    Image response

### Publisher upload flow

    Publisher
      |
      v
    POST /api/publisher/upload
      |
      +-- session + role check
      +-- rate limit
      +-- size validation
      +-- format validation
      +-- Sharp analysis
      +-- quality classification
      +-- SHA-256 duplicate check
      +-- create optimized variants
      |
      v
    Upload selected WebP to Bunny
      |
      v
    Create Wallpaper document in MongoDB
      |
      v
    pending_review + publishAt
      |
      v
    automatic publish / publisher action / admin action

### Download flow

    Authenticated user
      |
      v
    GET /api/wallpapers/:id/download?device=...
      |
      +-- session check
      +-- rate limit
      +-- ObjectId validation
      +-- published check
      +-- device availability check
      |
      v
    Bunny short-lived signed URL
      |
      v
    Stream attachment to user
      |
      +-- increment downloadCount
      +-- create Download history

---

## 8. Repository structure

    wallpaper_app/
    ├─ app/
    │  ├─ account/
    │  ├─ admin/
    │  ├─ api/
    │  ├─ items/
    │  ├─ login/
    │  ├─ profile/
    │  ├─ publisher/
    │  ├─ register/
    │  ├─ wallpapers/          # legacy redirects
    │  ├─ error.tsx
    │  ├─ global-error.tsx
    │  ├─ globals.css
    │  ├─ layout.tsx
    │  ├─ loading.tsx
    │  ├─ not-found.tsx
    │  ├─ page.tsx
    │  ├─ robots.ts
    │  └─ sitemap.ts
    │
    ├─ components/
    │  ├─ admin-*.tsx
    │  ├─ landing-*.tsx
    │  ├─ profile-*.tsx
    │  ├─ publisher-*.tsx
    │  ├─ page-shell.tsx
    │  ├─ ui.tsx
    │  ├─ verified-badge.tsx
    │  ├─ wallpaper-actions.tsx
    │  ├─ wallpaper-card.tsx
    │  └─ wallpaper-viewer.tsx
    │
    ├─ lib/
    │  ├─ admin.ts
    │  ├─ auth.ts
    │  ├─ bunny.ts
    │  ├─ images.ts
    │  ├─ media.ts
    │  ├─ mongodb.ts
    │  ├─ rate-limit.ts
    │  ├─ wallpaper-devices.ts
    │  └─ wallpaper-publish.ts
    │
    ├─ models/
    │  ├─ Download.ts
    │  ├─ Follow.ts
    │  ├─ Like.ts
    │  ├─ Save.ts
    │  ├─ User.ts
    │  └─ Wallpaper.ts
    │
    ├─ scripts/
    │  ├─ diagnose.ts
    │  ├─ load-test.ts
    │  ├─ make-admin.ts
    │  ├─ migrate-bunny-wallpaper-storage.ts
    │  ├─ migrate-user-profiles.ts
    │  ├─ smoke-test.ts
    │  ├─ test-core.ts
    │  ├─ test-image-processing.ts
    │  └─ test-publisher.ts
    │
    ├─ docs/implementation-plan.md
    ├─ .github/workflows/ci.yml
    ├─ .env.example
    ├─ next.config.ts
    ├─ package.json
    ├─ proxy.ts
    ├─ RELEASE_CHECKLIST.md
    ├─ tsconfig.json
    ├─ types/next-auth.d.ts
    └─ vercel.json

### Responsibility by directory

| Directory | Responsibility |
| --- | --- |
| app/ | Pages, layouts, APIs and application errors |
| components/ | Reusable UI and interactive client components |
| lib/ | Auth, DB, Bunny, media security, rate limiting and publishing |
| models/ | MongoDB/Mongoose schemas |
| scripts/ | Diagnostics, tests, migrations and admin utilities |
| docs/ | Implementation and hardening notes |
| .github/ | CI |

---

## 9. Routes

### Public

| Route | Purpose |
| --- | --- |
| / | Landing page + latest published wallpapers |
| /items | Searchable/filterable wallpaper gallery |
| /items/[slug] | Wallpaper detail |
| /profile/[username] | Public profile |
| /profile/[username]/followers | Followers |
| /profile/[username]/following | Following |
| /login | Login |
| /register | Registration |

### Authenticated

| Route | Purpose |
| --- | --- |
| /account | Account overview + avatar |
| /account/saves | Saved wallpapers |
| /account/downloads | Download history |

### Publisher

| Route | Purpose |
| --- | --- |
| /publisher | Publisher dashboard |
| /publisher/upload | Upload/processing workflow |

### Admin

| Route | Purpose |
| --- | --- |
| /admin | Platform dashboard |
| /admin/users | User list/search/filter |
| /admin/users/[id] | User management |
| /admin/wallpapers | Wallpaper moderation |

### Legacy compatibility

- /wallpapers -> /items
- /wallpapers/[slug] -> /items/[slug]

These redirects are defined in next.config.ts.

---

## 10. API surface

### Authentication

| Endpoint | Purpose |
| --- | --- |
| GET/POST /api/auth/[...nextauth] | NextAuth session endpoints |
| POST /api/auth/register | Create user account |

### Account/profile

| Endpoint | Purpose |
| --- | --- |
| POST /api/account/avatar | Upload/replace avatar |
| GET/POST /api/profile/[username]/follow | Follow status and follow/unfollow |

### Wallpapers

| Endpoint | Purpose |
| --- | --- |
| GET /api/wallpapers/[id] | Published wallpaper JSON + signed URLs |
| POST /api/wallpapers/[id]/like | Like/unlike |
| POST /api/wallpapers/[id]/save | Save/unsave |
| GET/POST /api/wallpapers/[id]/share | Read/increment share counter |
| GET /api/wallpapers/[id]/download | Authenticated device-specific download |

### Publisher

| Endpoint | Purpose |
| --- | --- |
| POST /api/publisher/upload | Validate, process, optimize and save wallpaper |
| POST /api/publisher/wallpapers/[id] | Publisher/admin publish |
| DELETE /api/publisher/wallpapers/[id] | Publisher/admin archive |

### Admin

| Endpoint | Purpose |
| --- | --- |
| GET /api/admin/users | Search/filter users |
| PATCH /api/admin/users/[id] | Role, verification, suspension and ban actions |
| PATCH /api/admin/wallpapers/[id] | Publish/remove/restore |
| POST /api/admin/wallpapers/publish-all | Bulk publish pending wallpapers |

### Platform

| Endpoint | Purpose |
| --- | --- |
| GET /api/health | Service health |
| GET /api/health?deep=1 | Health + MongoDB ping |
| GET /api/media/[...path] | Signed media delivery |
| GET /api/cron/publish | Scheduled publishing |

---

## 11. Database model

### User

Fields include:

- name
- username
- email
- passwordHash
- role
- status
- isVerified
- avatarKey
- suspension fields
- ban fields
- timestamps

Roles:

    user
    publisher
    admin

Statuses:

    active
    suspended
    banned

### Wallpaper

Fields include:

- title
- slug
- category
- tags
- devices
- publisherId
- status
- publishAt
- publishedAt
- qualityStatus
- duplicateStatus
- moderationReason
- removal metadata
- source metadata
- device variant metadata
- like/save/download/share counters
- timestamps

Wallpaper states:

    draft
    processing
    pending_review
    published
    rejected
    archived

### Activity/social models

- Follow
- Like
- Save
- Download

Unique indexes protect duplicate follow/like/save relationships.

---

## 12. Image processing pipeline

### Supported inputs

- JPEG
- PNG
- WebP
- AVIF

### Quality classification

The current code marks:

- pass: width >= 1920 and height >= 1080
- warning: smaller than that
- fail: schema value reserved, not currently produced by the upload route

Smaller sources are accepted and receive a warning.

### Device output limits

| Target | Maximum box |
| --- | --- |
| PC | 2560 × 2560 |
| Tablet | 2048 × 2048 |
| Mobile | 1600 × 1600 |

Sharp applies:

- EXIF-aware rotation
- fit inside
- no enlargement
- WebP encoding
- configurable WebP quality

### Storage behavior

The upload route generates device outputs in memory, but uploads only the selected target device.

Therefore:

- one upload = one selected device
- one stored optimized asset for that upload
- create separate posts for separate device targets

MongoDB stores source metadata including dimensions, source byte size, MIME type and SHA-256.

> The current upload route does **not** persist the original source file as a separate Bunny object.

### Duplicate detection

The original uploaded buffer is hashed with SHA-256. A matching source hash returns HTTP 409.

---

## 13. Authentication and authorization

### Registration

POST /api/auth/register:

- validates data with Zod
- normalizes email
- generates a unique username
- hashes the password with bcryptjs
- creates a user-role account
- rate-limits registration

### Login

NextAuth Credentials Provider:

- validates credentials
- checks status
- blocks banned users
- blocks active suspensions
- automatically expires timed suspensions
- places role/status/verification information in the session

### Route protection

proxy.ts protects:

- /account/*
- /publisher/*
- /admin/*

Server-side checks remain mandatory inside pages and APIs.

### Admin protection

The API prevents:

- demoting the last active admin
- suspending the last active admin
- banning the last active admin
- an admin suspending or banning their own account

---

## 14. Media storage and CDN

### Bunny Storage paths

Wallpapers:

    feature_wallpapers/pc/*.webp
    feature_wallpapers/tab/*.webp
    feature_wallpapers/mobile/*.webp

Avatars:

    avatars/*.webp

MongoDB stores the object key.

### Bunny signed URLs

The server generates short-lived Bunny CDN URLs using the Bunny token authentication key.

Bunny storage credentials remain server-side.

### Application media signature

Application URLs use:

    /api/media/<encoded-path>?e=<expiry>&s=<hmac>

The media endpoint:

1. verifies the HMAC signature
2. verifies expiration
3. checks wallpaper/avatar availability and access rules
4. creates a short-lived Bunny signed URL
5. streams the asset

This gives the application a server-controlled media boundary instead of exposing storage credentials to the browser.

---

## 15. Local development setup

### Requirements

- Node.js 20.9+
- npm
- MongoDB Atlas
- Bunny Storage + Pull Zone for real upload/media testing

### 1. Clone

    git clone https://github.com/WorkRCS/wallpaper_app.git
    cd wallpaper_app

### 2. Verify Node

    node -v
    npm -v

Windows PowerShell:

    where.exe node
    where.exe npm

### 3. Create .env.local

PowerShell:

    Copy-Item .env.example .env.local

macOS/Linux:

    cp .env.example .env.local

### 4. Generate secrets

    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Create separate values for:

- NEXTAUTH_SECRET
- MEDIA_SIGNING_SECRET
- CRON_SECRET

### 5. Configure environment

See Section 16.

### 6. Install

    npm install

### 7. Diagnose integrations

    npm run diagnose

### 8. Start development

    npm run dev

Open http://localhost:3000.

---

## 16. Environment variables

The repository template contains:

    NEXT_PUBLIC_APP_URL=http://localhost:3000
    NEXT_PUBLIC_APP_NAME=Wallpaper SaaS

    MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/?retryWrites=true&w=majority
    MONGODB_DB_NAME=wallpaper_saas

    NEXTAUTH_URL=http://localhost:3000
    MEDIA_SIGNING_SECRET=replace-with-a-long-random-secret-at-least-32-characters
    NEXTAUTH_SECRET=replace-with-a-long-random-secret-at-least-32-characters

    BUNNY_STORAGE_ZONE=
    BUNNY_STORAGE_PASSWORD=
    BUNNY_STORAGE_HOSTNAME=storage.bunnycdn.com

    BUNNY_CDN_HOSTNAME=
    BUNNY_PULL_ZONE_ID=
    BUNNY_CDN_TOKEN_KEY=

    MAX_UPLOAD_SIZE_MB=25
    IMAGE_QUALITY_WEBP=90
    IMAGE_QUALITY_AVIF=85

    CRON_SECRET=replace-with-a-long-random-secret-at-least-32-characters

    TEST_BASE_URL=http://localhost:3000

### Variable reference

| Variable | Required | Used for |
| --- | --- | --- |
| NEXT_PUBLIC_APP_URL | Yes | Canonical URLs, metadata and share URLs |
| NEXT_PUBLIC_APP_NAME | Yes | Branding |
| MONGODB_URI | Yes | MongoDB connection |
| MONGODB_DB_NAME | Yes | Database name |
| NEXTAUTH_URL | Yes | NextAuth base URL |
| NEXTAUTH_SECRET | Yes | NextAuth signing and fallback media secret |
| MEDIA_SIGNING_SECRET | Yes | Application media HMAC |
| BUNNY_STORAGE_ZONE | Yes | Bunny Storage Zone name |
| BUNNY_STORAGE_PASSWORD | Yes | Bunny Storage read/write credential |
| BUNNY_STORAGE_HOSTNAME | Yes | Bunny Storage API host |
| BUNNY_CDN_HOSTNAME | Yes | Bunny Pull Zone/CDN hostname |
| BUNNY_CDN_TOKEN_KEY | Yes | Bunny CDN token authentication key |
| BUNNY_PULL_ZONE_ID | Template only | Present in template; current runtime does not read it |
| MAX_UPLOAD_SIZE_MB | No | Upload limit; defaults to 25 MB |
| IMAGE_QUALITY_WEBP | No | WebP quality; defaults to 90 |
| IMAGE_QUALITY_AVIF | Template only | Current output pipeline writes WebP, so this value is not currently consumed |
| CRON_SECRET | Production | Secures scheduled publishing |
| TEST_BASE_URL | No | Base URL for tests |

Never commit .env.local or production secrets.

---

## 17. MongoDB Atlas setup

1. Create an Atlas project.
2. Create a cluster.
3. Create a database user.
4. Configure network access for local development and production.
5. Copy the SRV connection string.
6. Put it in MONGODB_URI.
7. Set MONGODB_DB_NAME=wallpaper_saas.
8. Run:

    npm run diagnose

MongoDB stores application metadata; Bunny stores image objects.

---

## 18. Bunny Storage and CDN setup

### Storage Zone

Create a Bunny Storage Zone.

Use the Storage Zone **name**, not the numeric ID:

    BUNNY_STORAGE_ZONE=my-storage-zone

The application intentionally rejects a numeric-only zone value.

### Storage credential

Use the Storage Zone **read/write Password** from Bunny FTP & API Access.

Do not use:

- a read-only password for uploads
- the Bunny account API key in place of the Storage Zone password

### Storage hostname

Default:

    BUNNY_STORAGE_HOSTNAME=storage.bunnycdn.com

Bunny regional storage hosts are also accepted by the runtime.

### Pull Zone

Create/connect the Pull Zone and set:

    BUNNY_CDN_HOSTNAME=your-pull-zone-host.b-cdn.net

Enable Bunny token authentication and set:

    BUNNY_CDN_TOKEN_KEY=...

Then run:

    npm run diagnose

The diagnostic checks:

1. Storage authentication
2. Storage upload
3. CDN delivery
4. Storage cleanup

---

## 19. Create the first admin

Registration creates a normal user.

Grant admin access:

    npm run make-admin -- you@example.com

Then login again and open:

    /admin

The utility sets the account to:

    role = admin
    status = active

---

## 20. Testing and verification

### Typecheck

    npm run typecheck

### Core/security tests

    npm run test:core

Covers media-signature generation/verification and rate-limit behavior.

### Image tests

    npm run test:image-processing

Covers source metadata and quality-status behavior.

### Standard test command

    npm test

### Lint

    npm run lint

### Production build

    npm run build

### Release gate

    npm run test:all

This runs:

    typecheck
    core + image tests
    lint
    build

GitHub Actions additionally runs the production-server smoke test and baseline load test.

### Smoke test

With the app running:

    npm run test:smoke

Optional public routes:

PowerShell:

    $env:TEST_BASE_URL="http://localhost:3000"
    $env:SMOKE_PUBLIC_ROUTES="1"
    npm run test:smoke

Optional deep database health:

    $env:TEST_BASE_URL="http://localhost:3000"
    $env:SMOKE_DEEP="1"
    $env:SMOKE_PUBLIC_ROUTES="1"
    npm run test:smoke

### Load baseline

Default:

    npm run test:load

Custom:

    $env:TEST_BASE_URL="http://localhost:3000"
    $env:LOAD_TEST_REQUESTS="100"
    $env:LOAD_TEST_CONCURRENCY="10"
    npm run test:load

The default target is /api/health.

This is a server-responsiveness baseline, not a complete simulation of gallery traffic, image downloads or publisher uploads.

### Publisher integration test

Set:

    TEST_PUBLISHER_EMAIL=publisher@example.com
    TEST_PUBLISHER_PASSWORD=your-password

Then:

    npm run test-publisher

This tests the authenticated publisher upload path and selected device/category metadata.

---

## 21. GitHub Actions CI

Workflow:

    .github/workflows/ci.yml

CI runs on:

- pushes to main
- pull requests

Current sequence:

    Checkout
      ↓
    Node 22
      ↓
    npm install
      ↓
    Typecheck
      ↓
    Core + image tests
      ↓
    ESLint
      ↓
    Production build
      ↓
    Start production server
      ↓
    Smoke test
      ↓
    Baseline load test
      ↓
    Cleanup

The CI load baseline uses 100 requests with 10 concurrent workers and targets /api/health.

---

## 22. Vercel production deployment

### 1. Import

Import WorkRCS/wallpaper_app into Vercel.

### 2. Environment variables

Add production values for:

    NEXT_PUBLIC_APP_URL=https://your-domain.example
    NEXT_PUBLIC_APP_NAME=Wallpaper SaaS

    MONGODB_URI=...
    MONGODB_DB_NAME=wallpaper_saas

    NEXTAUTH_URL=https://your-domain.example
    NEXTAUTH_SECRET=...
    MEDIA_SIGNING_SECRET=...

    BUNNY_STORAGE_ZONE=...
    BUNNY_STORAGE_PASSWORD=...
    BUNNY_STORAGE_HOSTNAME=...
    BUNNY_CDN_HOSTNAME=...
    BUNNY_CDN_TOKEN_KEY=...

    CRON_SECRET=...

### 3. Deploy

Use the normal Next.js Vercel deployment flow.

### 4. Verify

Check:

    /
    /items
    /login
    /register
    /api/health
    /robots.txt
    /sitemap.xml

Then run smoke tests against the deployed URL:

    $env:TEST_BASE_URL="https://your-domain.example"
    $env:SMOKE_PUBLIC_ROUTES="1"
    npm run test:smoke

### 5. Verify integrations

Run the diagnostics from an environment that can reach MongoDB Atlas and Bunny:

    npm run diagnose

Then run the publisher integration test with a controlled publisher account.

---

## 23. Scheduled publishing

vercel.json schedules:

    /api/cron/publish

with:

    * * * * *

The endpoint requires:

    Authorization: Bearer <CRON_SECRET>

The publish function:

1. assigns publishAt on upload
2. keeps the record in pending_review
3. checks due records during relevant application requests
4. runs from Vercel Cron
5. changes due records to published

The current automatic delay is about 20 seconds.

> The current workflow is intentionally automatic. A future manual moderation queue can replace the timer-based publishing behavior.

---

## 24. Migrations

### User profiles

    npm run migrate:user-profiles

Creates usernames for existing users that do not have one.

### Bunny wallpaper storage

    npm run migrate:bunny-wallpapers

Migrates known database-referenced wallpaper objects to:

    desktop -> feature_wallpapers/pc/
    tablet  -> feature_wallpapers/tab/
    mobile  -> feature_wallpapers/mobile/

Before production migrations:

- back up MongoDB
- verify Bunny credentials
- run against a copy/staging environment first
- review migrated/skipped/failed records
- verify resulting object keys
- verify application reads after migration

A successful migration script does not prove full data integrity.

---

## 25. Security baseline

### Authentication

- NextAuth Credentials Provider
- bcrypt password hashing
- JWT sessions
- active/suspended/banned state enforcement

### Authorization

Server-side checks are used for:

- publisher uploads
- admin APIs
- downloads
- private publisher previews
- profile actions
- publisher ownership

### Media

- application HMAC signatures
- expiration timestamps
- Bunny signed URLs
- server-only Bunny credentials

### Validation

- Zod for structured action payloads
- image format validation
- upload size validation
- ObjectId validation
- allowed-device validation
- bounded title/reason lengths

### Rate limits

Current in-memory limits protect operations such as:

- registration
- publisher upload
- download
- like
- save
- share
- avatar update

> **Scaling note:** the rate limiter is an in-memory Map per application instance. For multiple instances or multi-region operation, move this state to shared infrastructure such as Redis/KV.

### HTTP security headers

Configured in next.config.ts:

- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy
- X-DNS-Prefetch-Control: off
- production HSTS
- poweredByHeader: false

---

## 26. Performance and scaling

Current choices include:

- Next.js App Router
- server rendering for data-heavy pages
- client components only where interaction is required
- next/image
- responsive image sizes
- natural dimensions
- Mongoose lean reads
- bounded list queries
- parallel database queries
- indexed MongoDB fields
- optimized WebP assets
- Bunny CDN
- short-lived media tokens
- loading/skeleton states
- streamed downloads

### What can scale independently

The architecture separates:

    Web application
        ↓
    MongoDB metadata
        ↓
    Bunny object storage
        ↓
    Bunny CDN

This lets infrastructure components be upgraded independently as traffic grows.

### What is not proven

A health endpoint benchmark is not proof of support for one million concurrent real users.

Real capacity depends on:

- traffic shape
- database workload
- media bandwidth
- CDN cache hit rate
- upload volume
- Vercel limits
- external provider limits
- connection pools
- rate limiting
- query/index behavior

### Scaling path

#### Initial production

Focus on:

- correct Atlas configuration
- Bunny CDN configuration
- HTTPS domain
- monitoring
- backups
- integration testing

#### Higher traffic

Add:

- shared distributed rate limiting
- structured logs
- error monitoring
- request IDs
- MongoDB slow-query monitoring
- connection-pool tuning
- durable queue/background workers for uploads
- external-service retries/backoff

#### Very large traffic

Plan for:

- dedicated image-processing workers
- durable job queues
- shared rate limiting
- advanced search if regex search becomes a bottleneck
- counter aggregation/reconciliation
- CDN/cache tuning
- mixed-traffic load tests
- multi-region only when availability requirements justify it

---

## 27. Production-readiness checklist

### Application

- [ ] HTTPS domain configured
- [ ] NEXT_PUBLIC_APP_URL correct
- [ ] NEXTAUTH_URL correct
- [ ] strong secrets configured
- [ ] MongoDB Atlas reachable
- [ ] Bunny Storage reachable
- [ ] Bunny CDN reachable
- [ ] Bunny token authentication enabled
- [ ] CRON_SECRET configured
- [ ] supported Vercel Cron frequency confirmed
- [ ] npm run diagnose passes
- [ ] npm run test:all passes
- [ ] production smoke test passes
- [ ] publisher integration test passes

### Database/data

- [ ] MongoDB backups configured
- [ ] indexes reviewed
- [ ] migrations reviewed
- [ ] Bunny asset keys verified
- [ ] orphaned media reviewed
- [ ] counters checked
- [ ] admin account verified

### Security

- [ ] no secrets committed
- [ ] storage credentials server-only
- [ ] public/private media behavior tested
- [ ] rate limiting matches deployment topology
- [ ] monitoring/error reporting configured

### Operations

- [ ] rollback process understood
- [ ] restore process tested
- [ ] production-like publisher flow tested
- [ ] download flow tested for used device variants

---

## 28. Known limitations and next hardening steps

The main remaining engineering areas are documented in docs/implementation-plan.md.

### Distributed rate limiting

Current: in-memory per instance.

Next: shared Redis/KV.

### Durable upload processing

Current:

    browser
      ↓
    request
      ↓
    Sharp
      ↓
    Bunny upload
      ↓
    MongoDB

At higher traffic:

    browser
      ↓
    API
      ↓
    durable queue
      ↓
    worker
      ↓
    Sharp
      ↓
    Bunny
      ↓
    MongoDB

### Observability

Recommended:

- request IDs
- structured application logs
- error aggregation
- upload timing metrics
- Bunny operation metrics
- MongoDB slow-query monitoring
- alerts

### Moderation history

Current moderation state is stored, but the repository does not yet expose a complete immutable audit log for every moderation event.

A mature moderation system should record:

- actor
- action
- previous state
- new state
- reason
- timestamp

### Storage audit

Migration utilities operate on known database references. Periodic orphan-object audits are still recommended.

### Search

The current gallery search uses MongoDB regex queries across title/category/tags.

For much larger datasets, evaluate MongoDB Atlas Search or dedicated search infrastructure.

### Tests

The CI suite is useful for the current foundation. Higher-scale production hardening should add deeper route-level and integration coverage for:

- authorization permutations
- publisher ownership
- admin restrictions
- moderation state transitions
- private media
- device fallback
- download authorization
- external-service failure/retry behavior

---

## 29. Troubleshooting

### npm is not recognized

    node -v
    npm -v
    where.exe node
    where.exe npm

Restart PowerShell after changing Node.js PATH.

### metadataBase warning

Set:

    NEXT_PUBLIC_APP_URL=http://localhost:3000

Production:

    NEXT_PUBLIC_APP_URL=https://your-domain.example

### MongoDB connection failure

Check:

- MONGODB_URI
- MONGODB_DB_NAME
- Atlas network access
- database username/password
- cluster hostname
- URI encoding for special characters

Then:

    npm run diagnose

### Bunny 401

Check:

- Storage Zone name, not numeric ID
- Storage Zone read/write password
- correct storage hostname
- correct Pull Zone hostname
- correct CDN token key

Then:

    npm run diagnose

### Bunny object exists but the app cannot display it

Check:

1. MongoDB variant key
2. Bunny object path
3. CDN hostname
4. Bunny token key
5. media signing secret
6. URL expiration
7. wallpaper publication status

### Publisher upload returns 403

The logged-in account must have:

    role = publisher

or:

    role = admin

### Download returns 401

Downloads require an active authenticated session.

### Legacy wallpaper URLs

These are intentionally redirected:

    /wallpapers -> /items
    /wallpapers/[slug] -> /items/[slug]

---

## 30. NPM command reference

| Command | Purpose |
| --- | --- |
| npm install | Install dependencies |
| npm run dev | Start development |
| npm run build | Production build |
| npm run start | Start production server |
| npm run typecheck | TypeScript validation |
| npm test | Core + image tests |
| npm run test:core | Security/core tests |
| npm run test:image-processing | Sharp/image tests |
| npm run test:all | Typecheck + tests + lint + build |
| npm run lint | ESLint |
| npm run test:smoke | Route/security smoke tests |
| npm run test:load | Baseline load test |
| npm run test-publisher | Publisher integration test |
| npm run diagnose | MongoDB + Bunny diagnostics |
| npm run make-admin -- email@example.com | Grant admin role |
| npm run migrate:user-profiles | Backfill usernames |
| npm run migrate:bunny-wallpapers | Migrate known Bunny wallpaper objects |

---

## Final technical summary

### Frontend

    Next.js App Router
    React
    TypeScript
    Tailwind CSS
    Reusable components
    Responsive layouts
    SEO metadata

### Backend

    Next.js Route Handlers
    NextAuth
    Zod
    Server-side authorization
    Rate limiting

### Database

    MongoDB Atlas
    Mongoose
    Indexed user/wallpaper/social data

### Media

    Sharp
    WebP optimization
    Bunny Storage
    Bunny CDN
    Application HMAC URLs
    Bunny signed URLs

### Deployment

    Vercel
    Vercel Cron
    GitHub Actions
    Production smoke tests
    Baseline load tests

### Product

    Discover
    Search
    Profiles
    Follow
    Like
    Save
    Download
    Publisher Studio
    Image processing
    Automatic publishing
    Admin moderation
    Secure media
    SEO

---

## License

**Proprietary Commercial Source-Available License — All Rights Reserved**

This repository is **not open source**. The Software is published publicly for portfolio demonstration, viewing, and auditing purposes only.

Use, execution, copying, downloading, modification, merging, forking, distribution, sublicensing, resale, derivative works, reverse engineering, extraction of proprietary algorithms, and use of repository materials to train, fine-tune, or prompt AI/ML systems are prohibited unless expressly authorized in a prior, mutually executed written commercial license agreement.

No personal, academic, or commercial use is granted by publication of this repository.

Copyright (c) 2026 Sadik Laskar. All Rights Reserved.

For commercial licensing, enterprise acquisition, or written permission:

**Sadik Laskar**  
**Email:** emailme.sadik@gmail.com

See the full legal terms in the [LICENSE](LICENSE) file.

---

## Repository

GitHub: https://github.com/WorkRCS/wallpaper_app

This README is the practical A-to-Z guide for understanding, setting up, testing, deploying and operating the current Wallpaper SaaS codebase.
