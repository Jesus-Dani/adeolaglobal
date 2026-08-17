# ADEOLA Global — E-Commerce Platform

Custom e-commerce platform for ADEOLA Global Ltd, a Nigerian multi-category retail
business (hair/skincare, crochet, home-care, handmade goods, gifting, digital
products).

Full product and technical specs live in [`docs/`](docs/):

- [`docs/PRD.md`](docs/PRD.md) — product scope, phased build plan
- [`docs/TRD.md`](docs/TRD.md) — technical architecture, data model, payments, security
- [`docs/UI-Design-Brief.md`](docs/UI-Design-Brief.md) — typography, color, component rules
- `docs/visual-mockup.png` — homepage composition reference
- `docs/website-reference-layout-inspo.jpg` — structural/layout reference only (a
  different business's screenshot; its colors/branding are **not** used — see
  the design brief for the authoritative palette)

## Stack

Next.js (App Router, TypeScript) · Tailwind CSS + shadcn/ui · Supabase (Postgres,
Auth, Storage) · Paystack · Vercel · Sentry.

See `docs/TRD.md` §2 for the full stack table.

## Build status

Following the six-phase plan in `docs/PRD.md` §5. Current phase: **Phase 1 —
Foundation**.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real keys — see docs/TRD.md §6
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint     # ESLint
npm test         # Vitest
npm run build    # production build
```

## Brand assets

Raw/source brand assets (logo, product photography) live in [`assets/`](assets/).
Web-optimized derivatives used by the app live in `public/`. Where a real asset
isn't available yet, a clearly-labeled placeholder is used instead — see the
"Pending Inputs" table in `docs/PRD.md` §6 for what's still needed from ADEOLA
Global.
