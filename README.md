# Inventory & Order Management System

A full-stack application for managing products, customers, orders, and inventory tracking.

## Tech Stack

- **Backend:** FastAPI (Python 3.12)
- **Frontend:** React + Vite
- **Database:** PostgreSQL 16
- **Containerization:** Docker & Docker Compose

## Features

- Product management with unique SKU enforcement
- Customer management with unique email enforcement
- Order creation with inventory validation
- Automatic stock reduction when orders are placed
- Inventory tracking dashboard with low-stock alerts
- RESTful API with OpenAPI documentation

## Business Rules

| Rule | Implementation |
|------|----------------|
| Unique product SKUs | Database unique constraint + API validation |
| Unique customer emails | Database unique constraint + API validation |
| Inventory validation | Orders rejected when stock is insufficient |
| Stock reduction | Product stock decremented atomically on order creation |

## Quick Start (Docker Compose)

```bash
# Clone the repository
git clone <your-repo-url>
cd etharaAIProject

# Copy environment file
cp .env.example .env

# Start all services
docker compose up --build -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Start PostgreSQL (via Docker Compose db service or local install)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# Open http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| GET | `/api/customers` | List all customers |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/{id}` | Update customer |
| DELETE | `/api/customers/{id}` | Delete customer |
| GET | `/api/orders` | List all orders |
| POST | `/api/orders` | Create order (validates stock) |
| GET | `/api/orders/inventory/summary` | Inventory tracking summary |
| GET | `/health` | Health check |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173` |
| `VITE_API_URL` | Backend API URL for frontend | `http://localhost:8000/api` |
| `POSTGRES_USER` | Database user | `inventory` |
| `POSTGRES_PASSWORD` | Database password | `inventory` |
| `POSTGRES_DB` | Database name | `inventory_db` |

## Deployment

### Backend (Render + Docker Hub)

1. Push backend Docker image to Docker Hub:
   ```bash
   docker build -t <dockerhub-username>/inventory-backend:latest ./backend
   docker push <dockerhub-username>/inventory-backend:latest
   ```

2. Deploy on [Render](https://render.com):
   - Create a PostgreSQL database (free tier)
   - Create a Web Service using the Docker image
   - Set `DATABASE_URL` and `CORS_ORIGINS` environment variables

### Frontend (Vercel / Netlify / Render)

1. Deploy the `frontend` directory as a static site
2. Set `VITE_API_URL` to your deployed backend URL (e.g., `https://your-api.onrender.com/api`)

### Using Render Blueprint

The included `render.yaml` can be used for one-click deployment on Render.

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── config.py        # Settings from env vars
│   │   └── routers/         # API route handlers
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React UI components
│   │   └── api.js           # API client
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── render.yaml
└── README.md
```

## License

MIT