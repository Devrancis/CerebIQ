<div align="center">

<br />

<!-- Logo / Wordmark -->
<h1>
  <img src="https://img.shields.io/badge/🧠-CerebIQ-0A0A0A?style=for-the-badge&labelColor=0A0A0A&color=00E5CC" alt="CerebIQ" height="48"/>
</h1>

**A high-fidelity cognitive training platform engineered for depth, not distraction.**  
*Built for software engineers, analysts, and academics who demand more than trivia.*

<br />

[![Next.js](https://img.shields.io/badge/Next.js_14-App_Router-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Neon](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Upstash](https://img.shields.io/badge/Upstash-Redis-00C98B?style=flat-square)](https://upstash.com/)

<br />

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![GitHub Stars](https://img.shields.io/github/stars/Devrancis/CerebIQ?style=flat-square&logo=github)](https://github.com/Devrancis/CerebIQ/stargazers)
[![Last Commit](https://img.shields.io/github/last-commit/Devrancis/CerebIQ?style=flat-square)](https://github.com/Devrancis/CerebIQ/commits/main)

<br />

[**Live Demo**](https://cerebiq.vercel.app) · [**Documentation**](https://github.com/Devrancis/CerebIQ/wiki) · [**Report a Bug**](https://github.com/Devrancis/CerebIQ/issues/new?template=bug_report.md) · [**Request a Feature**](https://github.com/Devrancis/CerebIQ/issues/new?template=feature_request.md)

<br />

</div>

---

## Table of Contents

- [Overview](#overview)
- [Core Architecture](#core-architecture)
  - [The Focus Vault — Anti-Cheat Engine](#1-the-focus-vault--anti-cheat-engine)
  - [Dynamic Elo Rating System](#2-dynamic-elo-rating-system)
  - [Socratic Observer AI](#3-the-socratic-observer-ai)
  - [Academic Dim Design System](#4-academic-dim-design-system)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**CerebIQ** is not a trivia game.

It is a rigorous *Deep Work* environment engineered to stress-test the cognitive abilities that matter in high-performance technical and academic careers — sequential logic, spatial reasoning, abstract mathematics, and pattern recognition under time pressure.

The platform is built on three core principles:

| Principle | Implementation |
|-----------|---------------|
| **Integrity** | A server-side anti-cheat engine makes timer manipulation via browser DevTools structurally impossible |
| **Precision** | All scoring and Elo calculations are performed exclusively on the backend — no client-side exploits |
| **Depth** | An LLM-powered Socratic Tutor provides mechanical nudges, never answers — preserving the cognitive reward |

Daily synchronized puzzles ensure a level playing field across a global leaderboard, and a tamper-proof PvE Elo rating system gives every session meaningful stakes.

---

## Core Architecture

### 1. The Focus Vault — Anti-Cheat Engine

Puzzle content is never exposed to the client until a verified session begins. All puzzles are locked behind a `backdrop-blur` until the user initiates a session.

**Session lifecycle:**

1. User clicks **Begin** — a POST request triggers a server-side handshake
2. A `startedAt` timestamp is written directly to the Postgres database
3. The frontend timer is a read-only visual client, deriving display time exclusively from:

```ts
Math.floor((serverEndTime - Date.now()) / 1000)
```

Because the authoritative timestamp lives in the database rather than the browser, there is no client-side state to manipulate. Any attempt to tamper with the timer results in an invalid submission on the server.

---

### 2. Dynamic Elo Rating System

All scoring logic is executed exclusively on the backend. No calculation can be replicated or reverse-engineered from the client.

**Point calculation breakdown:**

| Component | Logic |
|-----------|-------|
| **Base Value** | Determined by puzzle difficulty tier (Easy `100` → Brain-Melt `800`) |
| **Time Multiplier** | Submissions completed faster than the puzzle's *Par Time* receive an Elo bonus multiplier |
| **Socratic Penalty** | Each AI hint permanently reduces the Elo payout for that session (0 hints = `1.0×` · 1 hint = `0.7×` · 2 hints = `0.4×`) |
| **Streak Bonus** | Consecutive daily completions compound a streak multiplier applied to the base value |

Final score = `Base Value × Time Multiplier × Socratic Multiplier × Streak Multiplier`

Leaderboard rankings are cached in **Upstash Redis** to serve high-concurrency reads without incurring repeated database queries.

---

### 3. The Socratic Observer AI

CerebIQ does not expose a generic chatbot. The **Socratic Observer** is a purpose-built LLM agent that is deeply coupled to live puzzle state.

**How it works:**

- When a user requests a hint, the backend API serializes their *exact current interactive state* — including partial answers, drag-and-drop positions, and elapsed time
- This state is injected into a tightly constrained system prompt
- The model is strictly engineered to return *mechanical nudges* — observations about the problem structure that redirect reasoning without revealing the solution

> *"The Socratic Observer never answers. It only asks better questions."*

This is implemented via the **Vercel AI SDK**, with streaming responses rendered progressively in the UI using React Suspense boundaries.

---

### 4. Academic Dim Design System

The UI is built on a custom **"Academic Dim"** design system, developed specifically to support long-session cognitive work.

**Design rationale:**

- **Eliminates visual halation** — pure-black (`#000000`) dark modes create a bloom effect around bright text on OLED displays. Academic Dim uses a calibrated dark base (`#0F0F12`) that retains contrast without eye fatigue
- **Typographic hierarchy** — font sizing, weight, and spacing are tuned to guide attention through complex puzzle layouts without visual noise
- **Motion discipline** — animations are used exclusively to communicate state changes, never for decoration

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 14](https://nextjs.org/) — App Router, React Server Components, Server Actions |
| **Language** | [TypeScript 5.0](https://www.typescriptlang.org/) — strict mode throughout |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) + custom `Academic Dim` design tokens |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Drag & Drop** | [dnd-kit](https://dndkit.com/) |
| **Database** | [Neon](https://neon.tech/) — Serverless Postgres |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Caching** | [Upstash Redis](https://upstash.com/) — leaderboards & rate-limiting |
| **AI Integration** | [Vercel AI SDK](https://sdk.vercel.ai/) / [LangChain](https://www.langchain.com/) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed and configured:

- **Node.js** `v18.0.0` or higher — [Download](https://nodejs.org/)
- **npm** `v9+` or **pnpm** `v8+` (recommended)
- A [**Neon**](https://neon.tech/) account with a provisioned database
- An [**Upstash**](https://upstash.com/) account with a Redis instance
- An API key from [**OpenAI**](https://platform.openai.com/) or [**Anthropic**](https://console.anthropic.com/)

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Devrancis/CerebIQ.git
cd CerebIQ
```

**2. Install dependencies**

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

---

### Environment Variables

Copy the example environment file and populate it with your credentials:

```bash
cp .env.example .env.local
```

```env
# .env.local

# ─── Database ──────────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host/cerebiq?sslmode=require"

# ─── Caching & Leaderboards ────────────────────────────────────────────
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"

# ─── AI Provider (choose one) ──────────────────────────────────────────
OPENAI_API_KEY="sk-..."
# ANTHROPIC_API_KEY="sk-ant-..."

# ─── Application ───────────────────────────────────────────────────────
NEXTAUTH_SECRET="your_nextauth_secret_min_32_chars"
NEXTAUTH_URL="http://localhost:3000"
```

> ⚠️ **Never commit `.env.local` to version control.** It is already listed in `.gitignore`.

---

### Database Setup

Run Prisma migrations to initialize the database schema:

```bash
# Generate the Prisma client
pnpm prisma generate

# Apply migrations to your Neon database
pnpm prisma migrate deploy

# (Optional) Seed the database with sample puzzles
pnpm prisma db seed
```

---

### Running Locally

```bash
# Start the development server
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

```bash
# Additional commands

pnpm build          # Production build
pnpm start          # Start production server
pnpm lint           # ESLint
pnpm type-check     # TypeScript type checking
pnpm test           # Run test suite
```

---

## Project Structure

```
CerebIQ/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Authentication routes
│   ├── (dashboard)/            # Authenticated user dashboard
│   ├── api/                    # API Route Handlers
│   │   ├── puzzles/            # Puzzle fetch & submission endpoints
│   │   ├── session/            # Server-side session handshake
│   │   ├── elo/                # Scoring calculation logic
│   │   └── ai/                 # Socratic Observer AI stream
│   └── layout.tsx              # Root layout
│
├── components/
│   ├── ui/                     # Primitive UI components (Academic Dim system)
│   ├── puzzle/                 # Puzzle-type specific renderers
│   ├── leaderboard/            # Leaderboard & Elo display components
│   └── socratic/               # AI hint interface components
│
├── lib/
│   ├── db/                     # Prisma client & query helpers
│   ├── redis/                  # Upstash Redis client & cache logic
│   ├── elo/                    # Elo calculation engine
│   └── ai/                     # LLM prompt templates & AI SDK config
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration history
│   └── seed.ts                 # Puzzle seed data
│
├── public/                     # Static assets
├── styles/                     # Global CSS & Tailwind config
├── types/                      # Shared TypeScript type definitions
├── .env.example                # Environment variable template
└── next.config.ts              # Next.js configuration
```

---

## Roadmap

The following features are planned or actively in development:

- [ ] **Multiplayer Gauntlet Mode** — Synchronous PvP puzzle racing with live Elo wagering
- [ ] **Puzzle Forge** — Community-authored puzzle submission and peer review pipeline
- [ ] **Cognitive Profile** — Longitudinal performance analytics with domain-specific strength/weakness mapping
- [ ] **Mobile App** — React Native port with offline puzzle caching
- [ ] **Institutional Licences** — Team leaderboards and analytics dashboards for organizations
- [ ] **Expanded Puzzle Types** — Proof-writing, code tracing, and formal logic domains

See the [open issues](https://github.com/Devrancis/CerebIQ/issues) for a full list of proposed features and known issues.

---

## Contributing

Contributions are what make this project better. Any contribution you make is genuinely appreciated.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please review the [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting.

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

<br />

Built with precision by [**@Devrancis**](https://github.com/Devrancis)

<br />

*If CerebIQ has been useful to you, consider leaving a ⭐ — it helps more people find the project.*

</div>