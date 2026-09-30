# Wallpaper SaaS — Implementation Plan

## Current architecture
The application uses Next.js App Router + TypeScript, MongoDB/Mongoose for application metadata, NextAuth credentials authentication, Sharp for image processing, Bunny Storage for source/variant assets, and Bunny CDN for delivery.

## Completed foundation
1. Authentication and roles
   - Credentials registration/login.
   - Roles: user, publisher, admin.
   - Active/suspended/banned account states.
   - Timed suspensions automatically expire back to active.
   - Protected APIs and pages require an active account.

2. Publisher media flow
   - JPEG, PNG, WebP and AVIF input validation.
   - Low-resolution sources are accepted and receive a quality warning instead of a hard rejection.
   - SHA-256 duplicate detection.
   - WebP device variants and gallery thumbnail.
   - Publisher chooses PC, Tablet and/or Mobile.
   - Selected devices are persisted in MongoDB and only selected device variants are stored.
   - Original source is retained separately.
   - Upload UI shows local preview and upload/processing progress.

3. Public discovery
   - Category filtering.
   - Search by title/category/tags.
   - Sorting by newest, title A–Z/Z–A, likes and downloads.
   - Responsive wallpaper cards with category, devices, likes, downloads and share.
   - Detail page with PC/Tablet/Mobile viewer.
   - Like, save, share and device-specific download actions.
   - Download progress with a direct-download fallback when CDN CORS prevents blob streaming.

4. Admin moderation
   - Live platform metrics.
   - User search plus role/status filters.
   - Assign user/publisher/admin roles.
   - Timed or permanent suspension.
   - Ban/unban controls.
   - Last-admin protection.
   - Admin user profiles with the publisher's posts.
   - Remove/archive posts from a user profile or the global wallpaper moderation page.
   - Restore moves a removed post to pending review.

## Recommended next steps
### Step 1 — Bunny integration
Verify the Storage Zone name, read/write Storage Zone password and correct regional Storage API hostname. Run npm run diagnose until Storage authentication, upload, CDN delivery and cleanup pass.

### Step 2 — Moderation workflow
Add explicit review actions for pending posts: publish, reject, request changes, reason, and moderation history. Keep moderation decisions server-side and auditable.

### Step 3 — Upload reliability
Move long-running image processing/upload work to a durable background job/queue when production traffic grows. The current synchronous route is suitable for the foundation but should not become the scaling bottleneck.

### Step 4 — Observability
Add structured audit records for admin role changes, suspensions, bans, post removals/restores and publisher uploads. Add request IDs to media operations and application errors.

### Step 5 — Production hardening
Add rate limiting, request-size protection, stricter MIME/content validation, image pixel/decompression limits, retry/backoff for Bunny operations, orphaned-asset cleanup, and transactional metadata state changes.

### Step 6 — Testing
Keep CI running typecheck, image regression, lint and build. Add route-level tests for authentication, publisher authorization, moderation actions, device persistence and public download authorization.

### Step 7 — Deployment
Set production environment variables in Vercel, configure MongoDB network access, connect the Bunny Storage Zone to its Pull Zone, set the production NEXTAUTH_URL, and run the same diagnostic checks against the production environment before opening publisher uploads.

## UI/UX responsive rules
- Desktop uses two-column workspaces where there is enough room.
- Tablet collapses workspaces to one column.
- Mobile uses single-column cards and controls.
- Long titles and emails wrap rather than overflow.
- Device selections remain visible as badges after upload.
- Progress bars communicate upload/download/processing state.
- Destructive admin actions remain server-authorized and are not client-trusted.