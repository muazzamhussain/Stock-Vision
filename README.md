<div align="center">
  <h1>📈 Stock Vision</h1>
  <p><strong>AI-powered stock market platform with real-time data, watchlists, price alerts, sentiment analysis, and automated email insights.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15.5-black?logo=next.js" />
    <img src="https://img.shields.io/badge/React-19-blue?logo=react" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
    <img src="https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss" />
    <img src="https://img.shields.io/badge/MongoDB-8-green?logo=mongodb" />
    <img src="https://img.shields.io/badge/Inngest-4-purple?logo=inngest" />
  </p>
</div>

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Available Scripts](#available-scripts)
8. [Project Structure](#project-structure)
9. [Author](#author)

---

## Introduction

Stock Vision is a full-stack financial platform built with **Next.js 15** and the App Router. It provides a real-time stock dashboard, a market screener, personalized watchlists, price alerts, and AI-generated sentiment analysis — backed by MongoDB and an event-driven background workflow system powered by **Inngest**.

---

## Features

- **Real-Time Stock Dashboard** — Live prices and charts via embedded TradingView widgets (candlestick, baseline, heatmap, top stories, and market overview widgets).
- **Market Screener** — Browse and filter stocks with the TradingView screener widget.
- **Powerful Search** — Command-palette style stock search (`SearchCommand`) for quickly finding and navigating to any symbol.
- **Watchlist Management** — Add/remove stocks from a personal watchlist backed by MongoDB, with a dedicated dashboard view.
- **Price Alerts** — Set "above" / "below" target-price alerts per symbol; view, edit, and delete them from the Alerts page.
- **AI Sentiment Analysis** — Per-symbol sentiment scoring (Bullish / Bearish / Neutral) with a summary and key factors, computed asynchronously via Inngest.
- **Stock Detail Pages** — Dynamic `/stocks/[symbol]` pages with fullscreen chart view, company profile, financials, and technical analysis widgets.
- **Secure Authentication** — Email/password auth via **Better Auth** with MongoDB-backed sessions and route protection middleware.
- **Email Preferences & Unsubscribe** — Users can manage notification preferences, with a dedicated unsubscribe flow and confirmation page.
- **Transactional & Digest Emails** — SMTP email delivery via Nodemailer, triggered through Inngest background jobs.
- **Dark-Themed, Responsive UI** — Built with Tailwind CSS 4, Radix UI primitives, and Shadcn-style components.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| UI Library | [React 19](https://react.dev/) |
| Authentication | [Better Auth](https://www.better-auth.com/) (MongoDB adapter) |
| Database | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) |
| Background Jobs | [Inngest](https://www.inngest.com/) (with Gemini AI integration) |
| Charts & Market Data | [TradingView Widgets](https://www.tradingview.com/widget/) |
| Email | [Nodemailer](https://nodemailer.com/) |
| UI Components | [Radix UI](https://www.radix-ui.com/) + [Shadcn-style components](https://ui.shadcn.com/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Forms | [React Hook Form](https://react-hook-form.com/) |
| Notifications | [Sonner](https://sonner.emilkowal.ski/) (toasts) |
| Icons | [Lucide React](https://lucide.dev/) |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        Client UI                          │
│  Search • Screener • Stock Pages • Watchlist • Alerts     │
└───────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                 Next.js Server Actions (lib/actions)          │
│  auth • user • watchlist • alert • chart • sentiment          │
│  • emailPreferences                                           │
└──────────┬────────────────────────────────┬───────────────────┘
           │                                │
   ┌───────▼────────┐              ┌────────▼─────────┐
   │  Better Auth    │              │     MongoDB       │
   │ (sessions/auth) │              │ (models/schemas)  │
   └─────────────────┘              └───────────────────┘
           │
┌───────────▼─────────────────────────────────────────────────┐
│                  Inngest Event Layer                          │
│   Sentiment Analysis Job  •  Email/Digest Workflows            │
│                     ↓ Gemini AI ↓                              │
│                  Nodemailer (SMTP)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** instance (Atlas or local)
- SMTP credentials for transactional email (e.g. Gmail app password)
- A Gemini API key (used by the Inngest AI functions)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/muazzamhussain/Stock-Vision.git
cd Stock-Vision

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env.local

# 4. Verify database connection
npm run test:db

# 5. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Better Auth
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000

# Google Gemini (used by Inngest AI functions, e.g. sentiment analysis)
GEMINI_API_KEY=your_gemini_api_key

# Nodemailer (SMTP email delivery)
NODEMAILER_EMAIL=your_smtp_email
NODEMAILER_PASSWORD=your_smtp_app_password

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production (Turbopack) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test:db` | Verify MongoDB connection |

---

## Project Structure

```
Stock-Vision/
├── app/
│   ├── (auth)/              # Sign-in and sign-up pages
│   ├── (root)/               # Main app layout and pages
│   │   ├── screener/          # Market screener page
│   │   ├── alerts/            # Price alerts dashboard
│   │   ├── watchlist/         # Watchlist dashboard
│   │   ├── unsubscribed/      # Email unsubscribe confirmation
│   │   └── stocks/[symbol]/   # Dynamic stock detail pages
│   └── api/
│       ├── inngest/           # Inngest webhook route
│       └── unsubscribe/       # Unsubscribe API route
├── components/
│   ├── Forms/                 # Form fields (input, select, country select)
│   ├── ui/                    # Radix/Shadcn-style UI primitives
│   ├── AlertsList.tsx          # Alert management UI
│   ├── SentimentCard.tsx       # AI sentiment display
│   ├── TradingviewWidget.tsx   # Generic TradingView widget wrapper
│   ├── TradingviewScreener.tsx # Screener widget
│   ├── TradingViewWatchlistWidget.tsx
│   ├── SearchCommand.tsx       # Command-palette stock search
│   └── ...
├── lib/
│   ├── actions/                # Server actions
│   │   ├── auth.actions.ts
│   │   ├── user.actions.ts
│   │   ├── watchlist.actions.ts
│   │   ├── alert.actions.ts
│   │   ├── chart.actions.ts
│   │   ├── sentiment.actions.ts
│   │   └── emailPreferences.actions.ts
│   ├── better-auth/             # Auth configuration
│   ├── inngest/                 # Background job client
│   ├── nodemailer/               # Email transport
│   ├── constants.ts              # App-wide constants (widget configs, nav items, symbols)
│   └── utils.ts                  # Utility helpers
├── database/
│   ├── models/                   # Mongoose schemas (watchlist, alert, sentiment, etc.)
│   └── mongoose.ts               # DB connection
├── hooks/                        # Custom React hooks (TradingView widget, debounce)
├── middleware/                   # Route protection middleware
├── scripts/                      # Utility scripts (test-db, test-email)
├── types/                        # Global TypeScript type declarations
└── public/                       # Static assets (logo, icons, screenshots)
```

---

## Author

<div align="center">
  Built by <a href="https://muazzam.page.gd">Muazzam Hussain</a><br />
  <a href="https://github.com/muazzamhussain">GitHub</a> •
  <a href="https://www.linkedin.com/in/muazzamhussain">LinkedIn</a> •
  <a href="https://www.behance.net/muazzam_hussain">Behance</a>
</div>