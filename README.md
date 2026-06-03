# Inventory & Order Management System

A full-stack app to manage products, customers, orders and inventory.

- Backend: Python, FastAPI, SQLAlchemy
- Frontend: React (Vite), axios
- Database: PostgreSQL
- Docker + Docker Compose

## Project structure

```
backend/        FastAPI app (models, schemas, routers)
frontend/       React app (pages, components, axios client)
docker-compose.yml
render.yaml
```

## Running locally

You need Docker Desktop installed.

Create a `.env` file in the project root:

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=inventory
CORS_ORIGINS=*
LOW_STOCK_THRESHOLD=10
```

Then start everything:

```
docker compose up --build -d
```

- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs

Stop:

```
docker compose down        # keep data
docker compose down -v     # remove data volume
```

## Running without Docker

Backend (needs a local PostgreSQL):

```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql+psycopg2://postgres:postgres@localhost:5432/inventory"
uvicorn app.main:app --reload
```

Frontend:

```
cd frontend
npm install
npm run dev
```

## Environment variables

| Variable | Where | Description |
|---|---|---|
| POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB | compose | Database credentials |
| DATABASE_URL | backend | SQLAlchemy connection string |
| CORS_ORIGINS | backend | Allowed origins, comma separated or `*` |
| LOW_STOCK_THRESHOLD | backend | Quantity at or below this is low stock |
| VITE_API_URL | frontend build | Backend URL; empty in compose (uses nginx /api proxy) |

## API

Products

```
POST   /products
GET    /products
GET    /products/{id}
PUT    /products/{id}
DELETE /products/{id}
```

Customers

```
POST   /customers
GET    /customers
GET    /customers/{id}
DELETE /customers/{id}
```

Orders

```
POST   /orders
GET    /orders
GET    /orders/{id}
DELETE /orders/{id}
```

Dashboard

```
GET /dashboard
```

Create order body:

```json
{ "customer_id": 1, "items": [{ "product_id": 1, "quantity": 2 }] }
```
