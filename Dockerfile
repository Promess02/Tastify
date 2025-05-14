# ---------- Backend Build Stage ----------
FROM node:16 AS backend

WORKDIR /app/backend

# Copy backend dependencies and source files
COPY backend/package*.json ./
COPY backend/ ./

# Install dependencies without building native modules
RUN npm install --ignore-scripts
RUN npm install -g concurrently@7.6.0

# ---------- Frontend Build Stage ----------
FROM node:16 AS frontend

WORKDIR /app/recipe-app

COPY recipe-app/package*.json ./
COPY recipe-app/ ./

RUN npm install && npx update-browserslist-db@latest

# ---------- Middleware Build Stage ----------
FROM node:16 AS middleware

WORKDIR /app/middleware

COPY middleware/package*.json ./
COPY middleware/ ./

RUN npm install 

# ---------- Final Image ----------
FROM node:16

WORKDIR /app

# Set environment variables
ENV PORT=4000
ENV BROWSER=none

# Copy built application files from all stages
COPY --from=backend /app/backend ./backend
COPY --from=frontend /app/recipe-app ./recipe-app
COPY --from=middleware /app/middleware ./middleware
COPY recipeApp.db recipeApp.db

# Reinstall backend dependencies in correct environment to fix native module issues
WORKDIR /app/backend
RUN npm install && npm rebuild sqlite3 bcrypt --build-from-source

# Reinstall middleware dependencies (if needed at runtime)
WORKDIR /app/middleware
RUN npm install

# Expose backend and frontend ports
EXPOSE 4000 3000

# Start backend and frontend using concurrently
WORKDIR /app
CMD ["sh", "-c", "export PORT=3000 && npx concurrently \"cd /app/backend && node server.js\" \"cd /app/recipe-app && npm start\""]