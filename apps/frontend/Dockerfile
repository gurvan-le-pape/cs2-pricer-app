FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/ ./packages/
RUN npm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=apps/frontend

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/frontend/package.json ./package.json
EXPOSE 3000
CMD ["npm", "run", "start"]