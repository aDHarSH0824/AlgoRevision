# Stage 1: Compile Next.js build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs ./
RUN npm ci
COPY app ./app
COPY public ./public

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 2: Light production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
