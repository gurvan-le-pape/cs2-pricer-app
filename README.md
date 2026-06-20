# CS2 Skin Pricer — App

> Next.js frontend + NestJS API for the CS2 Skin Pricer.

## Repository structure

```
.
├── apps/
│   ├── frontend/    # Next.js — market explorer, inventory analysis, Steam login
│   └── api/         # NestJS — REST API, Steam OpenID auth, ML service calls
└── packages/
    ├── types/       # shared TypeScript types between frontend and API
    ├── ui/          # shared UI components
    ├── eslint-config/
    └── typescript-config/
```

## Related repositories

- **`ml`** — Python ML service: data collection, feature engineering, model training, FastAPI prediction endpoints

The only link between the two repos at runtime is HTTP — NestJS calls the FastAPI prediction endpoint.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js / TypeScript |
| API | NestJS / TypeScript |
| Database | PostgreSQL |
| Cache | Redis |
| Auth | Steam OpenID |
| Mono-repo tooling | Turborepo |
| Styling | Tailwind CSS v4 + shadcn/ui |

## Pages

- **Market explorer** (`/`) — browse all skins with predicted vs actual price and over/undervalued score, no login required
- **Skin detail** (`/skins/[id]`) — breakdown of why the model priced a skin the way it did
- **Inventory** (`/inventory`) — sign in with Steam, see your skins ranked by opportunity

## Initial scaffold

How this repo was created:

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

# install all dependencies
npm install
```

After scaffolding, four manual changes are required:

**1. Change NestJS port to 3001** in `apps/api/src/main.ts`:
```typescript
await app.listen(3001);
```

**2. Add `dev` script to `apps/api/package.json`** so Turborepo picks it up:
```json
"dev": "nest start --watch"
```

**3. Set up Tailwind CSS v4** in `apps/frontend`:
```bash
cd apps/frontend
npm install tailwindcss@latest @tailwindcss/postcss postcss
```

Create `apps/frontend/postcss.config.mjs`:
```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

Add to the top of `apps/frontend/app/globals.css`:
```css
@import "tailwindcss";
```

Add to `apps/frontend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "ignoreDeprecations": "6.0",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**4. Set up shadcn/ui** in `apps/frontend`:
```bash
cd apps/frontend
npx shadcn@latest init
# Select: Radix → Nova → confirm
```

## Development

```bash
npm install
npm run dev
```

This starts both `frontend` (Next.js) on port 3000 and `api` (NestJS) on port 3001 in parallel via Turborepo.

Postgres and Redis should be running via Docker from the root `cs2-pricer` repo:

```bash
cd ../../  # cs2-pricer root
docker compose up postgres redis
```

The API expects the ML service (`ml`) to be running locally on port `8000`.

## Status

Early stage. Scaffold in place. Auth and core pages in progress.

---

*Built as a portfolio project. Not affiliated with Valve.*