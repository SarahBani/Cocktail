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
| [Cypress](https://www.cypress.io/) | 13.x | E2E browser testing |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Docker Compose | Local multi-service orchestration |
| Node.js 20 Alpine | Base image |

---

## Architecture Overview

```
+---------------------------------------------------------+
|                     Docker Network                      |
|                                                         |
|  +--------------+        +--------------------------+   |
|  |   Frontend   | -----> |         Backend          |   |
|  |   Vue 3 SPA  |        |    NestJS REST API       |   |
|  |   Port 8080  |        |      Port 3000           |   |
|  +--------------+        +------------+-------------+   |
|                                        |                |
|                              +---------+---------+      |
|                              |                   |      |
|                 +------------+----+   +----------+---+  |
|                 |   PostgreSQL    |   | Elasticsearch|  |
|                 |   Port 5432     |   |   Port 9200  |  |
|                 +-----------------+   +--------------+  |
+---------------------------------------------------------+
```

```mermaid
flowchart LR
  subgraph DN[Docker Network]
    FE[Frontend\nVue 3 SPA\nPort 8080]
    BE[Backend\nNestJS REST API\nPort 3000]
    PG[(PostgreSQL\nPort 5432)]
    ES[(Elasticsearch\nPort 9200)]

    FE --> BE
    BE --> PG
    BE --> ES
  end
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
git clone https://github.com/SarahBani/Cocktail/
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
| `GET` | `/cocktail` | List all cocktails. Accepts optional `?search=` query param for fuzzy search. |
| `GET` | `/cocktail/:id` | Get a single cocktail by ID. |
| `POST` | `/cocktail` | Create a new cocktail. |
| `PUT` | `/cocktail/:id` | Update an existing cocktail by ID. |
| `DELETE` | `/cocktail/:id` | Delete a cocktail by ID. |

### POST /cocktail — Request body

```json
{
  "title": "Virgin Mojito",
  "description": "A refreshing mocktail with mint and lime.",
  "price": 8.50
}
```

### PUT /cocktail/:id — Request body

```json
{
  "title": "Virgin Mojito",
  "description": "Updated description.",
  "price": 9.00
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
│   │   └── cocktail/           # Cocktail feature module
│   │       ├── cocktail.module.ts
│   │       ├── cocktail.controller.ts    # Route handlers
│   │       ├── cocktail.service.ts       # Business logic
│   │       ├── cocktail.entity.ts        # TypeORM entity (table: cocktail)
│   │       ├── cocktail.controller.spec.ts
│   │       └── cocktail.service.spec.ts
│   ├── test/
│   │   └── cocktail.e2e-spec.ts    # End-to-end tests
│   └── Dockerfile
│
└── frontend/                   # Vue 3 SPA
    ├── src/
    │   ├── main.js             # App bootstrap
    │   ├── App.vue             # Root component + nav bar
    │   ├── router.ts           # Route definitions
    │   ├── components/
    │   │   ├── toast.vue       # Toast notification
    │   │   ├── not-found.vue   # 404 / not-found view
    │   │   └── cocktail/
    │   │       ├── list.vue    # Cocktail list + search
    │   │       ├── new.vue     # Create cocktail form
    │   │       ├── edit.vue    # Edit cocktail form
    │   │       └── details.vue # Cocktail detail view
    │   ├── services/
    │   │   ├── apiClient.ts    # Axios instance + interceptors
    │   │   └── cocktailService.ts  # API calls
    │   └── stores/
    │       ├── cocktailStore.ts      # Pinia: cocktail state
    │       └── notificationStore.ts  # Pinia: toast notifications
    ├── tests/unit/             # Jest unit tests
    │   ├── stores/             #   notificationStore, cocktailStore
    │   ├── services/           #   cocktailService (axios-mock-adapter)
    │   └── components/         #   toast, list, new, details
    ├── cypress/
    │   └── e2e/
    │       └── cocktails.cy.js # Cypress E2E tests
    ├── cypress.config.js
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

# Unit tests (Jest + Vue Test Utils)
npm test

# Unit tests in watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests — headless (requires dev server on :8080)
npm run serve &
npm run test:e2e

# E2E tests — interactive Cypress UI
npm run test:e2e:open
```

> **Note:** Cypress e2e tests intercept all API calls with `cy.intercept`, so the backend does not need to be running. Only the frontend dev server (`npm run serve`) is required.

---

### What is tested

#### Backend unit tests (`npm test`)
| File | Covers |
|---|---|
| `http-exception.filter.spec.ts` | Error shape (`detail` field), status codes, string vs object responses |
| `elasticsearch.service.spec.ts` | `checkConnection`, `indexCocktail`, `bulkIndex` (empty / errors), `fuzzySearch` |
| `cocktail.service.spec.ts` | ES search, DB fallback on ES failure, conflict detection, graceful ES indexing failure |
| `cocktail.controller.spec.ts` | All endpoints, 404 propagation, `true` return on create |

#### Backend integration tests (`npm run test:e2e`)
| File | Covers |
|---|---|
| `test/cocktail.e2e-spec.ts` | Full HTTP pipeline via supertest — `ParseIntPipe` (400 on bad id), 404/409 response body shape with `HttpExceptionFilter` |

#### Frontend unit tests (`npm test`)
| File | Covers |
|---|---|
| `stores/notificationStore.spec.ts` | `setError`, `setSuccess`, `clear`, overwrite behaviour |
| `stores/cocktailStore.spec.ts` | All 3 actions, loading flag, error→notification wiring |
| `services/cocktailService.spec.ts` | GET/POST calls, 404/409 error `detail` propagation via axios-mock-adapter |
| `components/toast.spec.ts` | Visibility, `error`/`success` CSS class, click to dismiss |
| `components/cocktail/list.spec.ts` | Loading state, empty state, item rendering, search input |
| `components/cocktail/new.spec.ts` | Form submit, reset on success notification, no reset on error |
| `components/cocktail/details.spec.ts` | Loading state, cocktail data rendered, not-found view when no cocktail |

#### Frontend E2E tests (`npm run test:e2e`)
| Suite | Covers |
|---|---|
| **Cocktail List** | Page heading, card rendering, title/price display, empty state, search filtering, navigate to detail |
| **Cocktail Details** | Title/description/price rendered, not-found view + error toast on 404, back link navigation |
| **New Cocktail form** | Field rendering, success toast + form reset, conflict error toast, back link |
