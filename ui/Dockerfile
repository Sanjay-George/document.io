# # TODO: Check https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:20-alpine AS base

# Stage1: Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY ui/package*.json ./
RUN npm ci


# Stage2: Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY ui/ .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# Stage3: Production image, copy all the files and run next
FROM base AS frontend
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]










# # --- Frontend Stage (Next.js) ---
# FROM node:20-alpine AS frontend-build

# # Set working directory for the frontend (Next.js)
# WORKDIR /app/ui

# # Copy frontend package.json and package-lock.json
# COPY ui/package*.json ./

# # Install dependencies for the frontend
# RUN npm install

# # Copy the frontend source code
# COPY ui/ .

# # Build the Next.js app for production
# RUN npm run build



# # Step 2: Server built assets with Next server
# FROM node:20-alpine AS frontend

# WORKDIR /app/ui

# COPY --from=frontend-build /app/ui/.next .next
# COPY --from=frontend-build /app/ui/package.json .

# EXPOSE 3000

# # RUN npm install next

# # ENTRYPOINT [ "npm",  "start" ]




# # # Step 2: NGINX for serving frontend (Next.js)
# # FROM nginx:stable AS frontend

# # # Copy built frontend files from the frontend-build stage
# # COPY --from=frontend-build /app/ui/.next /usr/share/nginx/html

# # # Copy nginx configuration
# # COPY nginx.conf /etc/nginx/nginx.conf

# # # Expose port 80 for Nginx
# # EXPOSE 80
