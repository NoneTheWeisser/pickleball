# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN npm ci

# Copy all source
COPY . .

# Build the React client
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json ./
COPY --from=build /app/client/package.json ./client/
COPY --from=build /app/server/package.json ./server/

RUN npm ci --omit=dev

COPY --from=build /app/server/src ./server/src
COPY --from=build /app/client/dist ./client/dist

EXPOSE 8080

CMD ["npm", "run", "start"]
