# Wallpaper SaaS

Production-oriented foundation for a wallpaper platform.

## Stack

- Next.js 16 + TypeScript
- Tailwind CSS
- MongoDB Atlas + Mongoose
- NextAuth.js
- Sharp
- Bunny Storage + Bunny CDN
- Vercel

## Roles

- user
- publisher
- admin

## Current foundation

- User registration and credentials login
- Role-aware account, publisher and admin routes
- MongoDB connection and core models
- Wallpaper metadata model
- Like/save/download models with unique like/save constraints
- Environment template
- Base responsive UI

## Local setup

1. Copy .env.example to .env.local.
2. Fill MongoDB and auth variables.
3. Run npm install.
4. Run npm run dev.
5. Open http://localhost:3000.

## Storage rule

MongoDB stores application metadata. Bunny Storage stores image assets. Bunny CDN serves optimized assets. Never expose Bunny management credentials or MongoDB credentials to the browser.

## Next implementation stage

- Bunny secure upload/download integration
- Sharp processing pipeline
- automatic quality + duplicate pipeline
- device variants
- publisher upload UI
- admin review
- like/save/share/download APIs
- public MongoDB-backed gallery
- SEO metadata + sitemap
- rate limiting, audit logging and observability
