FROM node:20-alpine AS base

# Stage 1: Install dependencies
FROM base as builder
# RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy all backend source files
COPY *.ts ./
COPY tsconfig.json ./
COPY libs ./libs
COPY swagger ./swagger

# Build TS
RUN npm run build



# Stage 2: Final image
FROM base as backend
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY package*.json ./

# Copy .env file and update
COPY .env ./
RUN sed -i 's/MONGO_HOST=localhost/MONGO_HOST=mongo/' .env

RUN npm ci --production

USER nodejs
EXPOSE 5000

CMD [ "node", "dist/server.js" ]


