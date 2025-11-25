# Momentum AI – Full Platform Overview

This document summarizes what the Momentum AI platform is, how it is organized, and the major features and services included in this repository.

## What Momentum AI Does
- AI-first content engine: ideation, drafting, repurposing, scheduling, and publishing across channels.
- Multimedia creation: image (DALL·E 3, Stability), video (RunwayML, Pika, MiniMax), and voice (ElevenLabs, Google TTS, OpenAI TTS).
- Strategy and optimization: trend analysis, performance prediction, SEO, and hashtag generation.
- Collaboration and monetization: workspaces/teams, roles, marketplace for templates/models/assets, referral program.
- Commerce and access: Stripe-powered subscriptions (Pro, Business, Business+ with multiple billing cycles) and marketplace checkouts.
- Analytics and health: usage metrics, platform analytics, configuration health, real-time status indicators.
- Experience: modern React UI (Tailwind, Framer Motion), voice commands, command palette, notifications, and rich landing page.

## Repository Layout (top level)
- `momentum-ai/` – Main web application (React/Vite frontend + Node/Express backend, tests, deployment configs).
- `Momentum_AI_LandingPage/` – Standalone marketing/landing site (Vite + Tailwind) with its own deploy config.
- `scripts/` – Utility scripts for deployment/automation.
- `src/firebase.js` – Legacy/simple Firebase helper outside the main app.
- Deployment docs/guides – Multiple `.md` files at root (e.g., `COMPLETE_*`, `VERCEL_*`) capture prior deployment runs and checklists.

## Frontend (momentum-ai/src)
- Framework: React 18 + Vite 7 + Tailwind + Framer Motion; shadcn/ui-derived component library duplicated for app and landing page.
- Core structure:
  - `components/` – Feature atoms (AI chat/forms, auth modals, checkout, onboarding, platform connection cards) and UI primitives (buttons, dialogs, tabs, tooltips, skeletons, loaders, animated cards, micro-interactions).
  - `pages/` – Routed feature screens:
    - AI tools: Neural Strategist, Neural Multiplier, Content Repurposing, Content Calendar, Image/Video/Voice Studios, Hashtag & Idea generators, Performance Predictor, SEO Optimizer, Smart Content Library.
    - Content ops: editor, publishing, schedules, history, scheduled posts.
    - Analytics: core and advanced analytics, platform analytics.
    - Growth: marketplace, referrals, monetization fast-track.
    - Team/workspace: management UI with role-based access; platform integrations (standard + premium).
    - General & landing: marketing landing experience with hero/FAQ/pricing/testimonials, dashboard, contact, pricing, auth, not-found.
  - `contexts/` – App state (AI service selection, auth, team management, collaboration cursor tracking, global search, notifications, theme).
  - `services/` – Business logic (AI fine-tuning, marketplace, referrals, image/video/voice generation orchestration).
  - `lib/` – Integration helpers (Gemini client, unified AI API, Firebase client, platform definitions, export utilities, server AI proxy, shared utils).
  - `config/` – Routes and Stripe config; `styles/tokens.css` for design tokens.
  - `animations/` + `utils/motionVariants.js` – Motion presets and reveal/shimmer components.
  - Testing: Jest setup (`setupTests.js`), mocks under `tests/__mocks__`, Playwright/Cypress configs, and page-level tests under `e2e/` and `cypress/`.

## Backend (momentum-ai/server)
- Stack: Node 18+, Express, Stripe, Firebase Admin, Winston logging, Helmet, CORS, rate limiting.
- Key endpoints (see `server/server.js` and `server/routes/*`):
  - Payments/subscriptions: `/api/create-checkout-session`, Stripe webhook `/api/webhook`, marketplace checkout.
  - AI proxy: `/api/ai/*` (generate, structured generate, stream, analyze-image, list models) with pre-middleware for auth/rate limits/quota checks.
  - Scheduling: `/api/scheduler/run` hook for content jobs.
  - Domain features via routers: `/api/teams` (roles, invites), `/api/multimedia` (image/video/voice jobs), `/api/platforms` (integration metadata), `/api/blog`, `/api/newsletter`, `/api/analytics`, `/api/referrals`.
  - Contact form: `/api/contact` with SMTP support and log fallback.
  - Health: `/api/health`.
- Support files: `middleware/` (security, auth helpers), `services/` (Stripe, AI, multimedia), `utils/` (logger, error handling), tests under `__tests__/`.

## Landing Site (Momentum_AI_LandingPage)
- Vite + Tailwind Typescript marketing site with its own component set, Tailwind tokens, and `vercel.json`.
- Purpose: standalone public marketing/SEO surface; product UI lives in `momentum-ai/src/pages/landing/*` for in-app marketing routes.

## Environment & Configuration
- Frontend `.env` (in `momentum-ai/`): Firebase config, `VITE_GEMINI_API_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_APP_URL`.
- Backend `.env` (in `momentum-ai/server/`): `PORT`, `FRONTEND_URL`, Stripe secret + webhook secret + price IDs (monthly/6-month/annual), SMTP settings for contact form, `NODE_ENV`.
- Deployment configs: `vercel.json` (root), `momentum-ai/vercel.json`, Dockerfile + docker-compose, Netlify config, and multiple guides (`DEPLOY*.md`, `VERCEL_*.md`, `DOMAIN_SETUP.md`, `ENV_SETUP_GUIDE.md`, etc.).

## Running Locally (summary)
1) `cd momentum-ai && npm install` (or `pnpm install`), then `npm run dev` for the frontend.  
2) `cd momentum-ai/server && npm install && npm run dev` for the backend.  
3) Copy `.env.example` files for both frontend and backend and fill Firebase, Stripe, Gemini, and SMTP values.  
4) Visit `http://localhost:5173` (frontend) and ensure backend at `http://localhost:3001` is reachable.

## Testing
- Frontend: `npm run test` (Jest), `npm run test:e2e` (Playwright) or Cypress specs under `cypress/e2e`.
- Backend: `npm test` from `momentum-ai/server`.
- Additional helpers: `jest.config.js`, `playwright.config.js`, `cypress.config.js`, `TESTING.md` (in `momentum-ai/`) for deeper guidance.

## Deployment Notes
- Optimized for Vercel (frontend) with server deployable to Vercel functions or standalone Node/PM2; Dockerfile available for containerized runs.
- Stripe webhooks must be reachable (`/api/webhook`) and configured per environment; update `FRONTEND_URL`/`PORT` accordingly.
- Domain and environment setup guides live alongside deployment markdown files; refer to `VERCEL_ENV_VARIABLES.md`, `CUSTOM_DOMAIN_SETUP.md`, `DOMAIN_SETUP.md`, and `VITE_API_URL_GUIDE.md` for platform-specific instructions.

## Additional Documentation Library
- Operational docs such as `COMPLETE_CODE_AND_DEPLOYMENT.md`, `FINAL_DEPLOYMENT_SUMMARY.md`, `PLATFORM_INTEGRATION_COMPLETE.md`, `SECURITY_GUIDE.md`, `SECURITY_FIXES.md`, `QUICK_DEPLOY.md`, and `PRODUCTION_READY.md` capture past deployment runs, fixes, and checklists.
- Provider-specific guides: `AI_PROVIDER_CONFIG.md`, `MULTIMEDIA_PROVIDERS_GUIDE.md`, `FIREBASE_DATABASE_URL_GUIDE.md`, `WHERE_TO_GET_ENV_VALUES.md`, and `QUICK_START_MONETIZATION.md`.

## Quick Characterization
- Category: AI-powered content SaaS with multi-modal generation, scheduling, analytics, and monetization.
- Frontend: React/Vite/Tailwind + shadcn/ui components, voice/command palette, animated UX.
- Backend: Express + Stripe + Firebase Admin, AI proxy endpoints, team/referral/marketplace services.
- Deploy: Vercel-first, Docker-friendly, Stripe integrated, Firebase-backed auth/data.
