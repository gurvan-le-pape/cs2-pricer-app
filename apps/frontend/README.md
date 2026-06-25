# CS2 Pricer — Frontend

Next.js frontend for the CS2 skin price prediction platform.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (radix-nova) |
| Theme | next-themes (light/dark/system) |
| Language | TypeScript |

## Setup

Bootstrapped with:
```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir no --import-alias "@/*"
```

shadcn initialized with:
```bash
npx shadcn@latest init        # style: radix-nova, base color: neutral
npx shadcn@latest add button card badge select separator
npm install next-themes
```

## Pages

### `/` — Home
Landing page with Steam login button. Redirects to NestJS Steam OpenID auth.

### `/auth/callback` — Auth callback
Receives JWT token from NestJS after Steam login, stores it in localStorage, redirects to `/inventory`.

### `/inventory` — Inventory
Fetches the user's CS2 inventory from the NestJS API, enriched with:
- Current market price (Buff163, converted CNY→EUR)
- Fair value prediction (ML model)
- Undervalue/overvalue % vs model prediction

Supports sorting by price and valuation, and filtering to discontinued-collection skins only.

## Auth flow

User clicks "Sign in with Steam"

→ Redirects to NestJS /api/auth/steam

→ Steam OpenID → NestJS /api/auth/steam/callback

→ NestJS issues JWT, redirects to /auth/callback?token=...

→ Frontend stores token in localStorage

→ All API calls use Authorization: Bearer <token>

## Environment variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Development

```bash
npm run dev   # starts on port 3000
```