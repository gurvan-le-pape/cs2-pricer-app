# CS2 Pricer — API

NestJS backend for the CS2 skin price prediction platform.

## Stack

| | |
|---|---|
| Framework | NestJS 11 (Express) |
| Language | TypeScript |
| Database | PostgreSQL (TypeORM) |
| Auth | Steam OpenID + JWT (Passport) |

## Bootstrap

Scaffolded with:
```bash
nest new api
```

## Architecture

```
Frontend (Next.js)
    │  JWT
    ▼
NestJS API
    ├── PostgreSQL        (users, skin prices, predictions)
    ├── Steam API         (inventory fetch)
    └── open.er-api.com  (CNY → EUR rate)
```

## Modules

### `auth`
Steam OpenID login via `passport-steam`. On successful authentication, the user is upserted in the database and a signed JWT is returned to the frontend. All protected routes use the JWT strategy.

### `users`
User entity and service. A user record is created or updated on every Steam login.

### `inventory`
Core domain module. Fetches the authenticated user's CS2 inventory from the Steam API, then enriches each skin with:
- Current market price — read from the database (populated by the ML service from Buff163)
- Fair value prediction — read from the database (produced by the ML model)
- Undervalue/overvalue ratio (`actual / predicted`)

**Entities:**
- `skin-listing.entity` — a skin in the user's inventory
- `skin-price.entity` — Buff163 market price record
- `skin-prediction.entity` — ML model prediction record

### `fx`
Fetches the live CNY/EUR exchange rate from `open.er-api.com/v6/latest/CNY` and exposes a conversion helper used by the inventory module when formatting prices for the frontend.

## Auth flow

```
User clicks "Sign in with Steam"
  → GET /api/auth/steam
  → Steam OpenID
  → GET /api/auth/steam/callback
  → Upsert user in DB, sign JWT
  → Redirect to frontend /auth/callback?token=...
  → Frontend stores token, uses as Authorization: Bearer <token>
```

## Environment variables

```env
DATABASE_URL=
JWT_SECRET=
STEAM_API_KEY=
FRONTEND_URL=http://localhost:3000
```

## Development

```bash
npm run dev        # watch mode, port 3001
npm run build      # compile to dist/
npm run start:prod # run compiled output
```

## Testing

```bash
npm test           # unit tests
npm run test:cov   # with coverage
npm run test:e2e   # end-to-end
```

## Related

- **`../frontend`** — Next.js UI
- **`../../ml`** — XGBoost price prediction model and data collector (populates the DB)
- **`../../`** — root repo: docker-compose, infrastructure
