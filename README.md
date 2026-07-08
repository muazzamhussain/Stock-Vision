<div align="center">
  <h1>📈 Stock Vision</h1>
  <p><strong>AI-powered stock market platform with real-time data, watchlists, and automated insights.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15.5.2-black?logo=next.js" />
    <img src="https://img.shields.io/badge/React-19-blue?logo=react" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
    <img src="https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss" />
    <img src="https://img.shields.io/badge/MongoDB-6-green?logo=mongodb" />
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

---

## Introduction

Stock Vision is a full-stack, AI-powered financial platform built with **Next.js 15**. It provides real-time stock market tracking, personalized watchlists, and automated AI-generated insights — all delivered through an event-driven background workflow system powered by **Inngest** and **Google Gemini**.

---

## Features

- **Real-Time Stock Dashboard** — Track live prices with interactive charts powered by TradingView, including candlestick and line chart views.
- **Powerful Search** — Quickly find stocks using an intelligent command-palette search (`Ctrl+K`).
- **Watchlist Management** — Add and manage a personalized watchlist backed by MongoDB.
- **AI-Powered Daily Digests** — Automated cron jobs aggregate watchlist news and summarize it using Google Gemini, delivered to your inbox.
- **Personalized Welcome Emails** — AI-generated onboarding emails sent on sign-up via Inngest workflows.
- **Company Insights** — View PE ratio, EPS, revenue, analyst ratings, recent news, and sentiment scores.
- **Secure Authentication** — Email/password and social sign-on via Better Auth with session-based protection.
- **Transactional Email** — SMTP-based email delivery using Nodemailer.
- **Dark Mode** — Full dark/light theme support via `next-themes`.

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Framework | [Next.js](https://nextjs.org/) | 15.5.2 |
| Language | [TypeScript](https://www.typescriptlang.org/) | ^5 |
| Authentication | [Better Auth](https://www.better-auth.com/) | ^1.3.7 |
| Database | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | ^6 / ^8 |
| Background Jobs | [Inngest](https://www.inngest.com/) | ^4.11.0 |
| AI Engine | [Google Gemini](https://ai.google.dev/) | via API |
| Market Data | [Finnhub](https://finnhub.io/) | via API |
| Email | [Nodemailer](https://nodemailer.com/) | ^7.0.6 |
| UI Components | [Shadcn UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) | — |
| Styling | [Tailwind CSS](https://tailwindcss.com/) | ^4 |
| Charts | [TradingView Widget](https://www.tradingview.com/widget/) | — |
| Forms | [React Hook Form](https://react-hook-form.com/) | ^7 |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Client UI                       │
│   SearchCommand  →  /stocks/[symbol]  →  Watchlist  │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│              Next.js Server Layer                   │
│  finnhub.actions.ts  │  auth.actions.ts             │
│  watchlist.actions.ts │  user.actions.ts            │
└──────────┬─────────────────────────┬────────────────┘
           │                         │
    ┌──────▼──────┐         ┌────────▼────────┐
    │  Finnhub API│         │    MongoDB       │
    └─────────────┘         └─────────────────┘
           │
┌──────────▼──────────────────────────────────────────┐
│              Inngest Event Layer                     │
│  Welcome Email Workflow  │  Daily Digest Cron Job   │
│         ↓ Google Gemini AI ↓                        │
│              Nodemailer (SMTP)                      │
└─────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** instance (Atlas or local)
- API keys for **Finnhub**, **Google Gemini**, and **Inngest**

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

# Finnhub (https://finnhub.io/)
FINNHUB_API_KEY=your_finnhub_api_key

# Better Auth
BETTER_AUTH_SECRET=your_secret_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Nodemailer (Gmail SMTP)
NODEMAILER_EMAIL=your_gmail_address
NODEMAILER_PASSWORD=your_gmail_app_password

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test:db` | Verify MongoDB connection |

---

## Project Structure

```
Stock-Vision/
├── app/
│   ├── (auth)/          # Sign-in and sign-up pages
│   ├── (root)/          # Main app layout and stock pages
│   │   └── stocks/      # Dynamic stock detail pages
│   └── api/             # API routes (Better Auth, Inngest)
├── components/          # Reusable UI components (Header, Forms, etc.)
├── lib/
│   ├── actions/         # Server actions (auth, finnhub, watchlist, user)
│   ├── better-auth/     # Auth configuration
│   ├── inngest/         # Background job functions and AI prompts
│   ├── nodemailer/      # Email transport and templates
│   ├── constants.ts     # App-wide constants
│   └── utils.ts         # Utility helpers
├── database/            # Mongoose models and DB connection
├── hooks/               # Custom React hooks
├── middleware/          # Next.js middleware (route protection)
├── scripts/             # Utility scripts (e.g., test-db.mjs)
├── types/               # Global TypeScript type declarations
└── public/              # Static assets
```

---

<div align="center">
  Built with Next.js, Inngest, and Google Gemini.
  <a href="https://muazzam.page.gd">Muazzam Hussain</a>
</div>