# ---- Stage 1: Build Angular frontend ----
FROM node:20-alpine AS frontend-build

WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npx ng build --configuration production

# ---- Stage 2: Production runtime ----
FROM node:20-alpine

WORKDIR /app

# Install build tools for better-sqlite3 native bindings
RUN apk add --no-cache python3 make g++

# Install backend dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# Remove build tools after native compilation
RUN apk del python3 make g++

# Copy backend source
COPY backend/src/ ./src/

# Copy built Angular app into public/
COPY --from=frontend-build /build/dist/frontend/browser/ ./public/

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

CMD ["node", "src/index.js"]
