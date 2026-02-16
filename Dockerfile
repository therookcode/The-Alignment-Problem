
# Stage 1: Build the Frontend
FROM node:18-alpine as build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Backend
FROM python:3.11-slim

WORKDIR /app

# Copy Backend Code
COPY backend/ ./backend/
COPY backend/requirements.txt ./backend/

# Install Python Dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy Built Frontend Assets from Stage 1
# We place them in a directory backend expects
COPY --from=build /app/frontend/dist ./frontend/dist

# Expose Port
EXPOSE 8080

# Environment Variable for Port (Cloud Run requirement usually)
ENV PORT=8080

# Run the Application
# We use 'backend.main:app' because we are in /app and backend is a subdir
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
