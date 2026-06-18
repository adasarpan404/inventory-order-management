# Deployment Guide

## Submission Links

After completing deployment steps below, use these URLs for your assessment submission.

| Item | How to Obtain |
|------|---------------|
| GitHub Repository | https://github.com/adasarpan404/inventory-order-management |
| Docker Hub Image | `docker.io/<username>/inventory-backend:latest` |
| Frontend URL | Your Render/Vercel/Netlify static site URL |
| Backend API URL | Your Render/Railway/Fly.io web service URL |

## Option 1: Render (Recommended — Free Tier)

1. Fork or use the GitHub repo: https://github.com/adasarpan404/inventory-order-management
2. Sign up at [render.com](https://render.com) and connect your GitHub account
3. Create a **PostgreSQL** database (free tier)
4. Create a **Web Service** for the backend:
   - Runtime: Docker
   - Dockerfile Path: `backend/Dockerfile`
   - Docker Context: `backend`
   - Environment Variables:
     - `DATABASE_URL` → from Render PostgreSQL connection string
     - `CORS_ORIGINS` → your frontend URL (set after step 5)
5. Create a **Static Site** for the frontend:
   - Build Command: `cd frontend && npm ci && npm run build`
   - Publish Directory: `frontend/dist`
   - Environment Variable: `VITE_API_URL` → `https://<your-backend>.onrender.com/api`
6. Update backend `CORS_ORIGINS` with your frontend URL

Or use the included `render.yaml` blueprint for one-click deploy.

## Option 2: Docker Hub + Any Cloud Provider

```bash
# Build and push backend image
docker build -t <dockerhub-username>/inventory-backend:latest ./backend
docker login
docker push <dockerhub-username>/inventory-backend:latest
```

Set up GitHub Actions secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` for automatic pushes on every commit.

## Option 3: Local Docker Compose

```bash
cp .env.example .env
docker compose up --build -d
```

- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes (backend) | PostgreSQL connection string |
| `CORS_ORIGINS` | Yes (backend) | Comma-separated frontend URLs |
| `VITE_API_URL` | Yes (frontend build) | Backend API base URL with `/api` suffix |