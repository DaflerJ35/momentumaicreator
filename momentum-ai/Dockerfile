# Multi-stage build for Momentum AI

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copy frontend package files
COPY package*.json ./
RUN npm ci

# Copy frontend source
COPY . .

# Build frontend
RUN npm run build

# Stage 2: Setup backend
FROM node:18-alpine AS backend-setup
WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./
RUN npm ci --production

# Stage 3: Production image
FROM node:18-alpine
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built frontend from stage 1
COPY --from=frontend-builder --chown=nodejs:nodejs /app/dist ./dist

# Copy backend files from stage 2
COPY --from=backend-setup --chown=nodejs:nodejs /app/server/node_modules ./server/node_modules
COPY --chown=nodejs:nodejs server ./server

# Create logs directory
RUN mkdir -p server/logs && chown -R nodejs:nodejs server/logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "server/server.js"]

