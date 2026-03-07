# STAGE 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package.json for workspace management if needed
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install

# Copy source and build
COPY backend/ ./backend/
RUN cd backend && npm run build

# STAGE 2: Production
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY backend/package*.json ./
RUN npm install --only=production

# Copy built assets from builder
COPY --from=builder /app/backend/dist ./dist

# Create logs directory
RUN mkdir -p logs && chown node:node logs

USER node

ENV NODE_ENV=production

EXPOSE 4000
EXPOSE 4001

CMD ["node", "dist/server.js"]
