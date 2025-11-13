# 🚀 Momentum AI

## Accelerate Your Content Strategy with AI

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.5-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**The all-in-one platform for AI-powered content creation, scheduling, and analytics.**

[🎯 Features](#features) • [🚀 Quick Start](#quick-start) • [📖 Documentation](#documentation) • [🛠️ Tech Stack](#tech-stack) • [🌐 Deploy](#deployment)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [License](#license)

---

## 🌟 Overview

**Momentum AI** is a cutting-edge SaaS platform that empowers content creators, marketers, and businesses to supercharge their content strategy using advanced AI technology. Built with modern web technologies and powered by Google's Gemini AI, Momentum AI provides an intuitive, powerful suite of tools for content generation, management, and analytics.

### Why Momentum AI?

- 🎯 **AI-First Approach**: Leverage state-of-the-art AI models for intelligent content generation
- 📊 **Data-Driven Insights**: Make informed decisions with comprehensive analytics
- 🎨 **Beautiful UX**: Modern, responsive design that works seamlessly across all devices
- 🔒 **Enterprise-Grade Security**: Built with security best practices from the ground up
- 💳 **Flexible Pricing**: Subscription tiers that scale with your needs
- ⚡ **Lightning Fast**: Optimized performance with Vite and modern React patterns

---

## ✨ Features

### 🤖 AI-Powered Tools

#### Neural Strategist ✅

Advanced AI-powered content strategy and ideation tool that helps you plan and optimize your content calendar.

#### Neural Multiplier ✅

Transform one piece of content into multiple formats - blog posts, social media content, emails, and more.

#### Trend Analyzer ✅

Discover and analyze trending topics in your niche with AI-powered insights.

#### Hashtag Generator ✅

Generate high-performing, niche-specific hashtags to maximize your reach.

#### Content Calendar ✅

Intelligent content planning and scheduling with AI-powered recommendations.

#### Idea Generator ✅

Never run out of content ideas with unlimited AI-generated suggestions.

#### Image Studio ✅

AI-powered image generation and editing with multiple style options and providers (DALL-E 3, Stability AI).

#### Video Studio ✅

Generate AI videos from text prompts or animate static images with professional quality (RunwayML, Pika, MiniMax).

#### Voice Studio ✅

Create professional voice overs with AI text-to-speech and voice cloning capabilities (ElevenLabs, Google TTS, OpenAI TTS).

#### Creator Hub ✅

Personalized AI writing assistant trained on your unique style.

### 🔐 Authentication & User Management

- **Secure Authentication**: Firebase Auth with Google Sign-In
- **User Profiles**: Customizable user profiles with avatar support
- **Password Management**: Secure password reset and update functionality
- **Account Settings**: Complete account management including deletion

### 💳 Subscription & Payments

- **Stripe Integration**: Secure payment processing with Stripe Checkout
- **Multiple Plans**: Pro, Business, and Business+ tiers
- **Flexible Billing**: Monthly, 6-month, and annual billing options
- **Webhook Support**: Automatic subscription status updates
- **Usage Tracking**: Monitor API usage and billing cycles

### 📊 Content Management

- **Content Editor**: Rich text editing with AI assistance
- **History Tracking**: Keep track of all your generated content
- **Schedule Management**: Plan and schedule content distribution
- **Export Options**: Export content in multiple formats (PDF, DOCX, JSON)
- **Templates**: Pre-built templates for common content types

### 📈 Analytics Dashboard

- **Real-time Metrics**: Track performance in real-time
- **Visual Analytics**: Beautiful charts and graphs with Recharts
- **Usage Statistics**: Monitor AI API usage and costs
- **Team Analytics**: Track team performance and collaboration

### 🔒 Security Features

- **Rate Limiting**: Protect against abuse with intelligent rate limiting
- **CORS Protection**: Secure cross-origin resource sharing
- **CSP Headers**: Content Security Policy implementation
- **Input Validation**: XSS protection and input sanitization
- **Helmet Security**: Express Helmet for additional security headers
- **Audit Logging**: Comprehensive logging with Winston

### 🎨 User Experience

- **Modern UI**: Built with Tailwind CSS and Headless UI
- **Smooth Animations**: Framer Motion for delightful interactions
- **Responsive Design**: Mobile-first approach that works everywhere
- **Dark Mode**: Beautiful dark theme optimized for extended use
- **Toast Notifications**: Real-time feedback with React Hot Toast
- **Voice Commands**: Voice-powered navigation and commands

### 🌐 Progressive Web App (Currently Disabled)

⚠️ **Note**: PWA features are currently disabled. To enable:

1. Uncomment the `VitePWA` plugin in `vite.config.js`
2. Add required PWA icon assets to `public/` directory (see `PWA_SETUP.md`)
3. Follow the setup guide in `PWA_SETUP.md`

- **Offline Support**: Work without an internet connection *(when enabled)*
- **Install Prompts**: Native app-like experience *(when enabled)*
- **Service Workers**: Fast loading and caching strategies *(when enabled)*

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://reactjs.org/) | 18.2 | UI Framework |
| [Vite](https://vitejs.dev/) | 7.1 | Build Tool & Dev Server |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4 | Utility-First CSS |
| [Framer Motion](https://www.framer.com/motion/) | 10.16 | Animation Library |
| [React Router](https://reactrouter.com/) | 6.20 | Client-side Routing |
| [Headless UI](https://headlessui.com/) | 2.2 | Accessible UI Components |
| [Lucide Icons](https://lucide.dev/) | 0.552 | Beautiful Icons |
| [React Hot Toast](https://react-hot-toast.com/) | 2.6 | Notifications |
| [Recharts](https://recharts.org/) | 2.10 | Data Visualization |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| [Node.js](https://nodejs.org/) | 18+ | Runtime Environment |
| [Express](https://expressjs.com/) | Latest | Web Framework |
| [Firebase Auth](https://firebase.google.com/docs/auth) | 12.5 | Authentication |
| [Firebase Realtime DB](https://firebase.google.com/docs/database) | 12.5 | Real-time Database |
| [Stripe](https://stripe.com/) | Latest | Payment Processing |
| [Winston](https://github.com/winstonjs/winston) | Latest | Logging |

### Multimedia Services

| Service | Purpose |
|---------|---------|
| DALL-E 3 / Stability AI | Image Generation |
| RunwayML / Pika / MiniMax | Video Generation |
| ElevenLabs / Google TTS / OpenAI TTS | Voice Generation |

### AI & Services

| Service | Purpose |
|---------|---------|
| [Google Gemini AI](https://ai.google.dev/) | Content Generation & AI Features |
| [Firebase Cloud](https://firebase.google.com/) | Authentication & Database |
| [Stripe API](https://stripe.com/docs/api) | Payments & Subscriptions |

### Development & Testing

| Tool | Purpose |
|------|---------|
| [Jest](https://jestjs.io/) | Unit Testing |
| [Playwright](https://playwright.dev/) | E2E Testing |
| [Testing Library](https://testing-library.com/) | React Component Testing |
| [ESLint](https://eslint.org/) | Code Linting |
| [Prettier](https://prettier.io/) | Code Formatting |

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** (package manager)
- **Git** (version control)
- **Firebase Account** (for authentication and database)
- **Stripe Account** (for payment processing)
- **Google Cloud Account** (for Gemini AI API)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/momentum-ai.git
   cd momentum-ai
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Install backend dependencies**

   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env
   ```

   Create a `.env` file in the `server/` directory:

   ```bash
   cp server/.env.example server/.env
   ```

   See the [Environment Variables](#-environment-variables) section for detailed configuration.

5. **Configure Firebase**

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Google Sign-In)
   - Create a Realtime Database
   - Add your Firebase config to `.env`

6. **Configure Stripe**

   - Create a Stripe account at [Stripe Dashboard](https://dashboard.stripe.com/)
   - Create products and prices for each plan
   - Add price IDs to `server/.env`
   - Set up webhook endpoint

7. **Get Gemini API Key**

   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create an API key
   - Add to `.env` as `VITE_GEMINI_API_KEY`

8. **Start the development servers**

   In one terminal (frontend):

   ```bash
   npm run dev
   ```

   In another terminal (backend):

   ```bash
   cd server
   npm run dev
   ```

9. **Open your browser**

   Navigate to `http://localhost:5173` (or the port Vite assigns)

## 🎉 You're Ready to Go!

---

## 📁 Project Structure

```text
momentum-ai/
├── 📂 src/                          # Frontend source code
│   ├── 📂 components/               # Reusable React components
│   │   ├── 📂 ai/                  # AI-specific components
│   │   │   ├── BrainstormForm.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── ModelSettings.jsx
│   │   │   ├── TrainingDataForm.jsx
│   │   │   └── TrainingDataList.jsx
│   │   ├── 📂 auth/                # Authentication components
│   │   │   ├── AuthModal.jsx
│   │   │   └── UserMenu.jsx
│   │   ├── 📂 checkout/            # Payment & checkout components
│   │   │   ├── CheckoutForm.jsx
│   │   │   └── PlanUpgradeModal.jsx
│   │   ├── 📂 ui/                  # Base UI components (shadcn/ui)
│   │   │   ├── badge.jsx
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── input.jsx
│   │   │   ├── label.jsx
│   │   │   ├── select.jsx
│   │   │   ├── switch.jsx
│   │   │   ├── tabs.jsx
│   │   │   └── textarea.jsx
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── VoiceCommand.jsx
│   ├── 📂 config/                   # App configuration
│   │   ├── routes.jsx              # Route definitions
│   │   └── stripe.js               # Stripe configuration
│   ├── 📂 contexts/                 # React Context providers
│   │   ├── AIContext.jsx           # AI service state
│   │   ├── AuthContext.jsx         # Authentication state
│   │   └── TeamContext.tsx         # Team management state
│   ├── 📂 hooks/                    # Custom React hooks
│   │   └── useAIService.js
│   ├── 📂 lib/                      # Utility libraries
│   │   ├── exportUtils.js          # Export functionality
│   │   ├── firebase.js             # Firebase configuration
│   │   └── gemini.js               # Gemini AI integration
│   ├── 📂 pages/                    # Page components (routes)
│   │   ├── 📂 account/
│   │   │   ├── Billing.jsx
│   │   │   └── Settings.jsx
│   │   ├── 📂 ai-tools/
│   │   │   ├── AIContentTransform.jsx
│   │   │   ├── AIToolsHub.jsx
│   │   │   ├── CreatorHub.jsx
│   │   │   ├── NeuralMultiplier.jsx
│   │   │   ├── NeuralStrategist.jsx
│   │   │   └── VideoStudio.jsx
│   │   ├── 📂 analytics/
│   │   │   └── Analytics.jsx
│   │   ├── 📂 auth/
│   │   │   ├── SignIn.jsx
│   │   │   └── SignUp.jsx
│   │   ├── 📂 content/
│   │   │   ├── ContentEditor.jsx
│   │   │   ├── History.jsx
│   │   │   └── Schedule.jsx
│   │   ├── 📂 content-suite/
│   │   │   ├── History.jsx
│   │   │   ├── Schedule.jsx
│   │   │   └── Templates.jsx
│   │   ├── 📂 dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── 📂 general/
│   │   │   ├── Contact.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── 📂 pricing/
│   │   │   └── Pricing.jsx
│   │   └── NotFound.jsx
│   ├── 📂 services/                 # Business logic services
│   │   ├── aiFineTuning.ts
│   │   ├── marketplaceService.ts
│   │   └── referralService.ts
│   ├── 📂 tests/                    # Test utilities
│   │   ├── 📂 __mocks__/
│   │   └── setup.js
│   ├── App.jsx                      # Root component
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Global styles
├── 📂 server/                       # Backend Node.js server
│   ├── 📂 __tests__/                # Backend tests
│   │   ├── checkout.test.js
│   │   └── server.test.js
│   ├── 📂 middleware/               # Express middleware
│   │   └── security.js
│   ├── 📂 utils/                    # Utility functions
│   │   └── logger.js
│   ├── package.json
│   ├── server.js                    # Express server
│   └── .env                         # Backend environment variables
├── 📂 public/                       # Static assets
│   ├── robots.txt
│   └── sitemap.xml
├── 📂 e2e/                          # End-to-end tests
│   └── pricing.spec.js
├── 📂 cypress/                      # Cypress E2E tests
│   ├── 📂 e2e/
│   │   └── pricing-checkout.cy.js
│   └── 📂 support/
│       ├── commands.js
│       └── e2e.js
├── 📄 .env                          # Frontend environment variables
├── 📄 .gitignore                    # Git ignore rules
├── 📄 Dockerfile                    # Docker configuration
├── 📄 docker-compose.yml            # Docker Compose configuration
├── 📄 package.json                  # Frontend dependencies
├── 📄 vite.config.js                # Vite configuration
├── 📄 tailwind.config.js            # Tailwind CSS configuration
├── 📄 playwright.config.js          # Playwright configuration
├── 📄 jest.config.js                # Jest configuration
├── 📄 vercel.json                   # Vercel deployment config
├── 📄 netlify.toml                  # Netlify deployment config
├── 📄 TESTING.md                    # Testing documentation
├── 📄 SECURITY.md                   # Security policies
├── 📄 SECURITY_ALERT.md             # Security incident handling
└── 📄 README.md                     # You are here!
```

---

## 💻 Development

### Running Locally

**Frontend Development Server:**

   ```bash
   npm run dev
   ```

   This will start the Vite dev server at `http://localhost:5173` with:
- ⚡ Hot Module Replacement (HMR)
- 🔍 Source maps for debugging
- 🚀 Optimized asset loading

**Backend Development Server:**

   ```bash
   cd server
   npm run dev
   ```

   This will start the Express server at `http://localhost:3001` with:
- 🔄 Auto-restart on file changes (nodemon)
- 📝 Detailed logging
- 🐛 Debug mode enabled

### Available Scripts

#### Frontend

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm run test          # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate test coverage report
npm run test:e2e      # Run E2E tests with Playwright
npm run test:e2e:ui   # Run E2E tests with Playwright UI
```

#### Backend

```bash
npm run dev           # Start development server (nodemon)
npm start             # Start production server
npm test              # Run backend tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Code Style

This project uses:
- **ESLint** for JavaScript/TypeScript linting
- **Prettier** for code formatting
- **Tailwind CSS** for styling

### Git Workflow

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes and commit: `git commit -m 'Add amazing feature'`
3. Push to the branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

---

## 🧪 Testing

Momentum AI has comprehensive test coverage across unit, integration, and end-to-end tests.

### Unit Tests (Jest)

**Frontend Tests:**
```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

**Backend Tests:**
```bash
cd server
npm test                  # Run all tests
npm run test:coverage     # With coverage
```

### E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/pricing.spec.js
```

### Test Coverage

Current coverage targets:
- **Unit Tests**: > 50% coverage
- **Integration Tests**: Critical API endpoints
- **E2E Tests**: Happy paths for key user flows

See [TESTING.md](./TESTING.md) for detailed testing documentation.

### CI/CD Pipeline

Automated testing runs on every push and PR via GitHub Actions:
- ✅ Frontend unit tests (Node 18.x & 20.x)
- ✅ Backend unit tests (Node 18.x & 20.x)
- ✅ E2E tests with Playwright
- ✅ Build verification
- ✅ Security audits
- ✅ Secret scanning
- ✅ Coverage reporting

---

## 🌐 Deployment

### Option 1: Vercel (Recommended)

**Perfect for full-stack applications**

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `cd momentum-ai && pnpm install --frozen-lockfile && pnpm run build`
   - **Output Directory**: `momentum-ai/dist`
   - **Root Directory**: Leave empty (project is at repo root)
   - **Package Manager**: pnpm (version 10.15.1)

4. **Add Environment Variables**
   **⚠️ IMPORTANT:** Vercel does NOT read local `.env` files. All variables must be set in Vercel Dashboard.
   
   Add all variables from `.env` and `server/.env`:
   - `VITE_FIREBASE_*` (all Firebase config)
   - `VITE_GOOGLE_GENERATIVE_AI_API_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `VITE_APP_URL` (production domain)
   - `VITE_USE_SERVER_AI=true` (if using server AI)
   - `VITE_API_URL` (production domain, if using server AI)
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - All Stripe price IDs
   - `NODE_ENV=production` (NOT `development`)
   - `FRONTEND_URL` (production domain, no localhost)
   - `API_URL` (production domain, no localhost)
   - `TOKEN_ENCRYPTION_KEY` (64-character hex)
   - `OAUTH_STATE_SECRET` (64-character hex)
   - All platform OAuth credentials (if using platform integrations)

5. **Deploy!**

   The root `vercel.json` configuration handles:
   - ✅ SPA routing (API routes first, then SPA fallback)
   - ✅ API routes (`/api/*` via `momentum-ai/api/server.js`)
   - ✅ Static asset optimization
   - ✅ Security headers
   - ✅ CDN cache headers for HTML (prevents stale content)
   - ✅ Function configuration (60s timeout, 1536MB memory)

   **⚠️ Important: Single Vercel Configuration**

   - The project uses a **single `vercel.json` at the repository root**
   - The Vercel project should be linked at the repository root
   - Build command uses pnpm: `cd momentum-ai && pnpm install --frozen-lockfile && pnpm run build`
   - API handler is `momentum-ai/api/server.js` (single entry point)

   **⚠️ Important: CSP Configuration**

   If `VITE_API_URL` points to a different origin in production (e.g., `https://api.example.com`), you must add it to the `connect-src` directive in `vercel.json`. Update the CSP header to include your production API domain:

   ```json
   "connect-src 'self' ... https://api.example.com ..."
   ```

   Replace `https://api.example.com` with your actual API domain. This ensures the frontend can make requests to your API server.

6. **Set up Stripe Webhook**
   - Copy your Vercel deployment URL
   - In Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/webhook`
   - Select events: `checkout.session.completed`
   - Copy webhook secret to environment variables

### Option 2: Netlify

**Great for static sites with serverless functions**

1. **Push to GitHub**

2. **Import to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"

3. **Configure Build**
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Functions Directory**: `server`

4. **Add Environment Variables**
   Add all variables from `.env` and `server/.env`

5. **Deploy**

   The `netlify.toml` configuration handles:
   - ✅ Redirects for SPA routing
   - ✅ Security headers
   - ✅ Netlify Functions for API routes

   **⚠️ Important: CSP Configuration**

   If `VITE_API_URL` points to a different origin in production (e.g., `https://api.example.com`), you must add it to the `connect-src` directive in `netlify.toml`. Update the CSP header to include your production API domain:

   ```toml
   connect-src 'self' ... https://api.example.com ...
   ```

   Replace `https://api.example.com` with your actual API domain. This ensures the frontend can make requests to your API server.

### Option 3: Docker

**For containerized deployments**

1. **Build the Docker image**

   ```bash
   docker build -t momentum-ai .
   ```

2. **Run the container**

   ```bash
   docker run -p 3001:3001 \
     -e NODE_ENV=production \
     -e STRIPE_SECRET_KEY=your_key \
     -e STRIPE_WEBHOOK_SECRET=your_secret \
     -e FRONTEND_URL=https://yourdomain.com \
     momentum-ai
   ```

3. **Or use Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Option 4: Traditional VPS

**For maximum control**

1. **Set up your server** (Ubuntu/Debian)

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install nginx
   sudo apt install -y nginx
   ```

2. **Clone and build**
   ```bash
   git clone https://github.com/yourusername/momentum-ai.git
   cd momentum-ai
   npm install && npm run build
   cd server && npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   # Edit files with your credentials
   ```

4. **Set up PM2 for process management**
   ```bash
   npm install -g pm2
   cd server
   pm2 start server.js --name momentum-ai
   pm2 save
   pm2 startup
   ```

5. **Configure nginx as reverse proxy**

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## 🔐 Environment Variables

### Frontend (`.env`)

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# AI Service
VITE_GEMINI_API_KEY=your_gemini_api_key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx

# App Configuration
VITE_APP_URL=http://localhost:5173
```

### Backend (`server/.env`)

```bash
# Environment
NODE_ENV=development

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:5173

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_webhook_secret_here

# Stripe Price IDs (Monthly)
STRIPE_MONTHLY_PRO_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_MONTHLY_BUSINESS_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_MONTHLY_BUSINESS_PLUS_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx

# Stripe Price IDs (6 Month)
STRIPE_6MONTH_PRO_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_6MONTH_BUSINESS_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_6MONTH_BUSINESS_PLUS_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx

# Stripe Price IDs (Yearly)
STRIPE_YEARLY_PRO_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_YEARLY_BUSINESS_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_YEARLY_BUSINESS_PLUS_PRICE_ID=price_xxxxxxxxxxxxxxxxxxxxxxxx

# Contact Form Email Configuration
# See "Contact Form Email" section below for detailed setup instructions
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Momentum AI Contact Form
SMTP_FROM_EMAIL=noreply@momentumaicreator.com
CONTACT_EMAIL=your-contact@example.com
```

### Getting API Keys

#### Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Go to Project Settings → General
4. Scroll to "Your apps" → Web apps
5. Copy the config values

#### Gemini AI

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select your Google Cloud project
4. Copy the API key

#### Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers → API keys
3. Copy your Publishable key and Secret key
4. For webhooks:
   - Go to Developers → Webhooks
   - Add endpoint
   - Copy the signing secret

### Contact Form Email

The contact form (`/api/contact`) supports email delivery via SMTP. **If SMTP is not configured, form submissions will be logged only** (no emails sent).

#### Required Environment Variables

Add these to `server/.env`:

```bash
# SMTP Configuration (required for email delivery)
SMTP_HOST=smtp.gmail.com          # Your SMTP server hostname
SMTP_PORT=587                      # SMTP port (587 for TLS, 465 for SSL)
SMTP_SECURE=false                  # true for port 465, false for other ports
SMTP_USER=your-email@gmail.com     # SMTP username/email
SMTP_PASS=your-app-password        # SMTP password or app-specific password

# Email sender details
SMTP_FROM_NAME=Momentum AI Contact Form
SMTP_FROM_EMAIL=noreply@momentumaicreator.com

# Contact form recipient
CONTACT_EMAIL=your-contact@example.com
```

#### Common SMTP Providers

**Gmail:**
- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- Use an [App Password](https://support.google.com/accounts/answer/185833) (not your regular password)

**SendGrid:**
- `SMTP_HOST=smtp.sendgrid.net`
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- `SMTP_USER=apikey`
- `SMTP_PASS=your_sendgrid_api_key`

**AWS SES:**
- `SMTP_HOST=email-smtp.us-east-1.amazonaws.com` (use your region)
- `SMTP_PORT=587`
- `SMTP_SECURE=false`
- Use AWS SMTP credentials (not API keys)

**Local Development:**
- Without SMTP configured, form submissions are logged to server logs only
- Check `server/logs/combined.log` for contact form submissions
- See `server/server.js` lines 365-463 for the contact form implementation

#### Testing Contact Form

1. Ensure SMTP variables are set in `server/.env`
2. Restart the server: `cd server && npm run dev`
3. Submit a test form from the contact page
4. Check server logs for confirmation: `server/logs/combined.log`
5. Verify email delivery (check spam folder if needed)

---

## 📚 API Documentation

### Authentication Endpoints

All authenticated routes require a valid Firebase ID token in the `Authorization` header:

```text
Authorization: Bearer <firebase_id_token>
```

### Payment Endpoints

#### Create Checkout Session

**POST** `/api/create-checkout-session`

Creates a Stripe Checkout session for subscription purchase.

**Request Body:**
```json
{
  "plan": "pro",           // "pro" | "business" | "businessPlus"
  "billingCycle": "monthly" // "monthly" | "6months" | "12months"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

#### Stripe Webhook

**POST** `/api/webhook`

Handles Stripe webhook events for subscription updates.

**Headers:**

```text
stripe-signature: <stripe_signature>
```

**Events Handled:**
- `checkout.session.completed`: Update user subscription status

### Health Check

**GET** `/api/health`

Returns server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-04T12:00:00.000Z"
}
```

---

## 🤝 Contributing

We love contributions! Here's how you can help make Momentum AI even better:

### Ways to Contribute

- 🐛 **Report Bugs**: Open an issue with detailed reproduction steps
- 💡 **Suggest Features**: Share your ideas for new features
- 📖 **Improve Documentation**: Help make our docs clearer
- 🔧 **Submit PRs**: Fix bugs or implement new features
- ⭐ **Star the Repo**: Show your support!

### Contribution Guidelines

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/momentum-ai.git
   cd momentum-ai
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Commit your changes**

   ```bash
   git commit -m 'Add some amazing feature'
   ```

   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Use a clear, descriptive title
   - Reference any related issues
   - Describe your changes in detail
   - Add screenshots/videos if applicable

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

### Development Setup

See the [Quick Start](#-quick-start) section for detailed setup instructions.

### Questions?

- 💬 Open a [Discussion](https://github.com/yourusername/momentum-ai/discussions)
- 🐛 Report an [Issue](https://github.com/yourusername/momentum-ai/issues)
- 📧 Email: [your.email@example.com](mailto:your.email@example.com)

---

## 🔧 Troubleshooting

### Common Issues

#### Firebase Authentication Not Working

**Problem**: Users can't sign in or sign up.

**Solutions**:
1. Verify all Firebase environment variables are correctly set
2. Check Firebase Console → Authentication → Sign-in method
3. Ensure Google Sign-In is enabled
4. Check browser console for detailed error messages
5. Verify Firebase project billing is enabled (required for Auth)

#### Stripe Checkout Fails

**Problem**: Redirect to Stripe Checkout fails or errors.

**Solutions**:
1. Verify Stripe publishable key is correct
2. Check that all price IDs exist in your Stripe Dashboard
3. Ensure `FRONTEND_URL` matches your actual frontend URL
4. Check server logs for detailed error messages
5. Test with Stripe CLI: `stripe listen --forward-to localhost:3001/api/webhook`

#### Stripe Webhook Not Firing

**Problem**: Subscriptions don't update after payment.

**Solutions**:
1. Verify webhook endpoint is correct in Stripe Dashboard
2. Check webhook signing secret matches `STRIPE_WEBHOOK_SECRET`
3. Ensure webhook endpoint is publicly accessible (use ngrok for local testing)
4. Check Stripe Dashboard → Webhooks → Event attempts
5. Verify `checkout.session.completed` event is selected

#### Gemini AI API Errors

**Problem**: AI content generation fails.

**Solutions**:
1. Verify `VITE_GEMINI_API_KEY` is valid and active
2. Check Google Cloud Console for API quotas
3. Ensure Gemini API is enabled in your Google Cloud project
4. Check for rate limiting (free tier has limits)
5. Verify API key has correct permissions

#### Build Fails

**Problem**: `npm run build` fails with errors.

**Solutions**:
1. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Ensure Node.js version is 18 or higher: `node --version`
4. Check for TypeScript errors if using TS
5. Verify all dependencies are installed

#### Development Server Not Starting

**Problem**: `npm run dev` fails or doesn't start.

**Solutions**:
1. Check if port 5173 is already in use
2. Kill existing processes: `npx kill-port 5173`
3. Clear npm cache: `npm cache clean --force`
4. Reinstall dependencies: `rm -rf node_modules && npm install`
5. Check `.env` file for syntax errors

#### CORS Errors in Production

**Problem**: API requests fail with CORS errors.

**Solutions**:
1. Verify `FRONTEND_URL` in `server/.env` matches your actual frontend URL
2. Check CORS configuration in `server/server.js`
3. Ensure no trailing slashes in URLs
4. Verify deployment platform allows CORS headers
5. Check browser console for specific CORS error details

#### Hot Reload Not Working

**Problem**: Changes don't reflect in browser.

**Solutions**:
1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check Vite server is running
3. Clear browser cache
4. Restart dev server
5. Check for syntax errors in your code

### Getting Help

If you're still stuck:

1. **Check the Docs**
   - [TESTING.md](./TESTING.md) - Testing documentation
   - [SECURITY.md](./SECURITY.md) - Security policies
   - [SECURITY_ALERT.md](./SECURITY_ALERT.md) - Security incidents

2. **Search Issues**
   - Check [existing issues](https://github.com/yourusername/momentum-ai/issues)
   - Someone might have already solved your problem

3. **Open an Issue**
   - Provide detailed description
   - Include error messages
   - Share relevant code snippets
   - List steps to reproduce

4. **Join the Community**

   - [Discord Server](https://discord.gg) (coming soon)
   - [GitHub Discussions](https://github.com/yourusername/momentum-ai/discussions)

---

## 🗺️ Roadmap

### Current Version (v1.0.0)

- ✅ Core authentication with Firebase
- ✅ Stripe subscription management
- ✅ Neural Strategist AI tool
- ✅ Neural Multiplier - Transform content across formats
- ✅ Trend Analyzer - Real-time trend analysis
- ✅ Hashtag Generator - AI-powered hashtag suggestions
- ✅ Content Calendar - Visual planning and scheduling
- ✅ Idea Generator - Unlimited content ideas
- ✅ AI Image Generation - Create visual content (DALL-E 3, Stability AI)
- ✅ AI Video Generation - Generate videos from text (RunwayML, Pika, MiniMax)
- ✅ AI Voice Over - Text-to-speech generation (ElevenLabs, Google TTS, OpenAI)
- ✅ Team Collaboration - Multi-user workspaces with role-based access
- ✅ Marketplace - Browse and purchase AI models, templates, and assets
- ✅ Referral Program - Gamified referral system with rewards
- ✅ Content editor and history
- ✅ Analytics dashboard
- ✅ Responsive design
- ✅ Comprehensive testing suite

### 🚀 Growth & Collaboration Features

#### Marketplace ✅

Browse and purchase AI models, templates, plugins, and datasets from the community.

#### Referral Program ✅

Earn rewards by inviting friends. Gamified system with badges and tier progression.

#### Team Collaboration ✅

Work with your team on content creation with role-based access control (Admin, Editor, Viewer).

### Upcoming Features

#### Q1 2026

- [ ] **Mobile App** - iOS and Android applications
- [ ] **Advanced Analytics** - Deeper insights and metrics
- [ ] **MR/XR Support** - Spatial computing features for Quest 3/Vision Pro

#### Q2 2026

- [ ] **API Access** - Public API for developers
- [ ] **Webhooks** - Real-time event notifications
- [ ] **Custom AI Models** - Fine-tune models for your brand
- [ ] **Integration Hub** - Connect with popular platforms
  - [ ] Twitter/X
  - [ ] LinkedIn
  - [ ] Instagram
  - [ ] Facebook
  - [ ] TikTok
- [ ] **White Label** - Rebrand for agencies
- [ ] **Advanced Permissions** - Granular access control

#### Q3 2026

- [ ] **NFT Marketplace** - Blockchain-based asset trading
- [ ] **Multi-language Support** - Global reach
- [ ] **Advanced SEO Tools** - Optimize content for search
- [ ] **A/B Testing** - Test content variations

#### Long-term Vision

- [ ] **AI Agent System** - Autonomous content creation
- [ ] **Blockchain Integration** - Content verification and ownership
- [ ] **AR/VR Content** - Immersive content creation
- [ ] **Advanced Personalization** - AI-driven user experiences
- [ ] **Enterprise Features** - SSO, compliance, advanced security

### Want to Influence the Roadmap?

- 🗳️ Vote on features in [Discussions](https://github.com/yourusername/momentum-ai/discussions)
- 💡 Suggest new features by [opening an issue](https://github.com/yourusername/momentum-ai/issues/new)
- 🤝 Contribute to development

---

## 📊 Project Stats

![GitHub repo size](https://img.shields.io/github/repo-size/yourusername/momentum-ai)
![GitHub stars](https://img.shields.io/github/stars/yourusername/momentum-ai?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/momentum-ai?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/momentum-ai)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/momentum-ai)
![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/momentum-ai)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What This Means

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

**Attribution required** - Please give appropriate credit.

---

## 🙏 Acknowledgments

### Technologies & Services

- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Firebase](https://firebase.google.com/) - Backend-as-a-Service
- [Stripe](https://stripe.com/) - Payment processing
- [Google Gemini](https://ai.google.dev/) - AI and machine learning
- [Vercel](https://vercel.com/) - Deployment platform

### Inspiration

Built with ❤️ by developers who believe in:
- 🚀 Empowering creators with AI
- 🎨 Beautiful, accessible design
- 🔒 Security and privacy
- 🌍 Open source collaboration

---

## 📞 Contact & Support

### Get in Touch

- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/momentum-ai/discussions)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/momentum-ai/issues)
- 📧 **Email**: [support@momentumai.com](mailto:support@momentumai.com)
- 🌐 **Website**: [momentumai.com](https://momentumai.com)
- 🐦 **Twitter**: [@MomentumAI](https://twitter.com/MomentumAI)
- 💼 **LinkedIn**: [Momentum AI](https://linkedin.com/company/momentum-ai)

### Support the Project

If Momentum AI helps you create amazing content, consider:

- ⭐ **Star the repository** to show your support
- 🐦 **Share on social media** to spread the word
- 🤝 **Contribute** to make it better
- 💖 **Sponsor** the project (coming soon)

---

## Built with 💚 by the Momentum AI Team

**Making AI-powered content creation accessible to everyone**

[⬆ Back to Top](#momentum-ai)

---

© 2025 Momentum AI. All rights reserved.
