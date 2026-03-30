# Cocktail Bar — Fullstack Node.js Assessment

A full-stack web application for managing cocktail recipes. Features a searchable list, detailed views, and the ability to create new cocktails. Built as a technical assessment.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Run with Docker Compose](#run-with-docker-compose)
  - [Run Locally (without Docker)](#run-locally-without-docker)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Testing](#testing)

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| [NestJS](https://nestjs.com/) | 10.x | REST API framework |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Language |
| [PostgreSQL](https://www.postgresql.org/) | 13 | Primary database |
| [TypeORM](https://typeorm.io/) | 0.3.x | ORM / database access |
| [Elasticsearch](https://www.elastic.co/) | 8.6 | Full-text fuzzy search |
| [Swagger / OpenAPI](https://swagger.io/) | — | API documentation |
| [Jest](https://jestjs.io/) | 29.x | Unit & E2E testing |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| [Vue 3](https://vuejs.org/) | 3.2.x | UI framework |
| [Vue Router](https://router.vuejs.org/) | 4.x | Client-side routing |
| [Pinia](https://pinia.vuejs.org/) | 3.x | State management |
| [Axios](https://axios-http.com/) | 1.x | HTTP client |
| [Jest](https://jestjs.io/) | 29.x | Unit testing |
| [Vue Test Utils](https://test-utils.vuejs.org/) | 2.x | Component testing |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Local multi-service orchestration |
| Node.js 20 Alpine | Base image |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Docker Network                      │
│                                                          │
│  ┌──────────────┐        ┌──────────────────────────┐   │
│  │   Frontend   │──────▶ │        Backend           │   │
│  │   Vue 3 SPA  │        │  NestJS REST API         │   │
│  │   Port 8080  │        │  Port 3000               │   │
│  └──────────────┘        └────────────┬─────────────┘   │
│                                       │                  │
│                          ┌────────────┴─────────────┐   │
│                          │                          │   │
│                 ┌────────▼────────┐  ┌─────────────▼─┐ │
│                 │   PostgreSQL    │  │ Elasticsearch  │ │
│                 │   Port 5432     │  │   Port 9200    │ │
│                 └─────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Search strategy**: Elasticsearch provides fuzzy full-text search on title and description fields. If Elasticsearch is unavailable, the backend automatically falls back to a PostgreSQL `LIKE` query.

**Database seeding**: On first startup, PostgreSQL is seeded with 15 mocktail recipes via `db-init.sql`.

**Elasticsearch indexing**: On backend startup, all cocktails from the database are bulk-indexed into Elasticsearch automatically.

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed and running.

That's all you need — no local Node.js installation required.

---

### Run with Docker Compose

**1. Clone the repository**

```bash
git clone <repository-url>
cd fullstack-nodejs-assessment
```

**2. Start all services**

```bash
docker-compose up --build
```

This command starts four services:
- **Frontend** — Vue 3 dev server at [http://localhost:8080](http://localhost:8080)
- **Backend** — NestJS API at [http://localhost:3000](http://localhost:3000)
- **PostgreSQL** — Database at `localhost:5432`
- **Elasticsearch** — Search engine at [http://localhost:9200](http://localhost:9200)

The services start in the correct dependency order (database and Elasticsearch must be healthy before the backend starts). The database is automatically seeded with 15 cocktail recipes on first run.

**3. Open the app**

Visit [http://localhost:8080](http://localhost:8080) in your browser.

**Swagger API docs** are available at [http://localhost:3000/api](http://localhost:3000/api).

---

**Stop all services**

```bash
docker-compose down
```

**Stop and remove volumes (wipes database data)**

```bash
docker-compose down -v
```

---

### Run Locally (without Docker)

You still need PostgreSQL and Elasticsearch running. The easiest way is to start only the infrastructure services via Docker and run the apps natively.

**1. Start only the infrastructure**

```bash
docker-compose up postgres elasticsearch
```

**2. Run the backend**

```bash
cd backend
cp .env.example .env   # or set variables manually (see below)
npm install
npm start
```

**3. Run the frontend**

```bash
cd frontend
npm install
npm run serve
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the NestJS server listens on |
| `DATABASE_URL` | `postgres://user:password@localhost:5432/mydatabase` | PostgreSQL connection string |
| `ELASTICSEARCH_HOST` | `http://localhost:9200` | Elasticsearch base URL |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VUE_APP_API_URL` | `http://localhost:3000` | Backend API base URL |

---

## API Reference

Full interactive documentation is available via Swagger at **[http://localhost:3000/api](http://localhost:3000/api)** when the backend is running.

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/cocktails` | List all cocktails. Accepts optional `?search=` query param for fuzzy search. |
| `GET` | `/cocktails/:id` | Get a single cocktail by ID. |
| `POST` | `/cocktails` | Create a new cocktail. |

### POST /cocktails — Request body

```json
{
  "title": "Virgin Mojito",
  "description": "A refreshing mocktail with mint and lime.",
  "price": 8.50
}
```

### Error responses

All errors return JSON with a `detail` field:

```json
{
  "statusCode": 409,
  "detail": "Cocktail with this title already exists"
}
```

---

## Project Structure

```
fullstack-nodejs-assessment/
├── docker-compose.yml          # Orchestration for all services
├── db-init.sql                 # PostgreSQL schema + seed data
│
├── backend/                    # NestJS REST API
│   ├── src/
│   │   ├── main.ts             # Entry point, Swagger setup, global filter
│   │   ├── app.module.ts       # Root module (TypeORM + config)
│   │   ├── elasticsearch.service.ts  # Elasticsearch indexing & search
│   │   ├── http-exception.filter.ts  # Global HTTP error handler
│   │   └── cocktails/          # Cocktails feature module
│   │       ├── cocktails.module.ts
│   │       ├── cocktails.controller.ts   # Route handlers
│   │       ├── cocktails.service.ts      # Business logic
│   │       ├── cocktails.entity.ts       # TypeORM entity
│   │       ├── cocktails.controller.spec.ts
│   │       └── cocktails.service.spec.ts
│   ├── test/
│   │   └── cocktails.e2e-spec.ts   # End-to-end tests
│   └── Dockerfile
│
└── frontend/                   # Vue 3 SPA
    ├── src/
    │   ├── main.js             # App bootstrap
    │   ├── App.vue             # Root component + nav bar
    │   ├── router.ts           # Route definitions
    │   ├── components/
    │   │   ├── toast.vue       # Toast notification
    │   │   └── cocktails/
    │   │       ├── list.vue    # Cocktail list + search
    │   │       ├── new.vue     # Create cocktail form
    │   │       └── details.vue # Cocktail detail view
    │   ├── services/
    │   │   ├── apiClient.ts    # Axios instance + interceptors
    │   │   └── cocktailService.ts  # API calls
    │   └── stores/
    │       ├── cocktailStore.ts      # Pinia: cocktail state
    │       └── notificationStore.ts  # Pinia: toast notifications
    ├── tests/unit/             # Frontend unit tests
    └── Dockerfile
```

---

## Testing

### Backend

```bash
cd backend

# Unit tests
npm test

# Unit tests in watch mode
npm run test:watch

# Coverage report
npm run test:cov

# End-to-end tests
npm run test:e2e
```

### Frontend

```bash
cd frontend

# Unit tests
npm test

# Unit tests in watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

### What is tested

**Backend unit tests** cover:
- Controller route handlers with mocked service
- Service methods with mocked TypeORM repository and Elasticsearch
- Duplicate title conflict (409)
- Missing cocktail (404)
- Elasticsearch fallback to database on failure
- Input validation (`ParseIntPipe` on `:id`)

**Backend E2E tests** cover the full HTTP request/response cycle.

**Frontend unit tests** cover:
- Vue components (list, new, details, toast)
- Pinia stores (cocktail state, notification state)
- API service functions with mocked Axios
