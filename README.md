# CS2 Skin Pricer — App

> Next.js frontend + NestJS API for the CS2 Skin Pricer.

## Repository structure

```
.
└── apps/
    ├── frontend/    # Next.js — Steam login, inventory analysis
    └── api/         # NestJS — REST API, Steam OpenID auth
```

## Related repositories

- **`ml`** — Python ML service: data collection, feature engineering, model training. Populates the database with skin prices and fair value predictions consumed by the API.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 / TypeScript |
| API | NestJS 11 / TypeScript |
| Database | PostgreSQL |
| Auth | Steam OpenID |
| Mono-repo tooling | Turborepo |
| Styling | Tailwind CSS v4 + shadcn/ui |

## Pages

- **Home** (`/`) — Steam login
- **Auth callback** (`/auth/callback`) — receives JWT from the API after Steam login
- **Inventory** (`/inventory`) — authenticated view of the user's skins with market price and fair value prediction

## Initial scaffold

```bash
npx create-turbo@latest app
cd app

# rename default web app to frontend
mv apps/web apps/frontend

# remove docs app (Turborepo demo, not needed)
rm -rf apps/docs

# create NestJS API
cd apps
npx @nestjs/cli new api --package-manager npm
cd ..

npm install
```

After scaffolding, two manual changes are required:

**1. Change NestJS port to 3001** in `apps/api/src/main.ts`:
```typescript
await app.listen(3001);
```

**2. Add `dev` script to `apps/api/package.json`** so Turborepo picks it up:
```json
"dev": "nest start --watch"
```

## Development

```bash
npm install
npm run dev
```

Starts `frontend` on port 3000 and `api` on port 3001 in parallel via Turborepo.

Postgres should be running via Docker from the root `cs2-pricer` repo:

```bash
cd ../../  # cs2-pricer root
docker compose up postgres
```

## Status

Early stage. Auth and inventory page in progress.

---

*Built as a portfolio project. Not affiliated with Valve.*
