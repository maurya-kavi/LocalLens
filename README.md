# LocalLens

LocalLens is a hyperlocal product discovery platform for Adityapur, Jamshedpur. It is intended to help customers discover and compare products listed by nearby physical shops, while helping local shopkeepers showcase selected products online.

The platform addresses the effort involved in visiting multiple shops to discover products and compare prices. Listings are for discovery only and do not guarantee current availability; customers should confirm details with the shopkeeper.

## Intended users

- **Customers:** Discover nearby products, compare local options, and contact shops before visiting.
- **Local shopkeepers:** Create a shop presence and showcase selected products to nearby customers.


## 🎥 Video Demo

Watch the complete demo of LocalLens to understand its features, workflow, and how it helps local shopkeepers improve their product visibility.

[▶️ Watch LocalLens Demo](https://drive.google.com/file/d/1vY45PSDF8HaEqrm387drARoB6-j3LT5D/view?usp=drive_link)


## Technology stack

- Frontend: React, Vite, JavaScript, Tailwind CSS, React Router, Axios, Lucide React
- Backend: Node.js, Express, JavaScript (CommonJS), dotenv, cors
- Database: PostgreSQL, Prisma ORM
- Backend authentication uses JWT/bcrypt; product images use Cloudinary when configured.

## Project structure

```text
client/                 React + Vite frontend
  src/components/       Reusable UI and layout components
  src/pages/            Page-level components
  src/services/         API client helpers
  src/styles/           Global styles and design tokens
server/                 Express API
  prisma/                Prisma schema and database migrations
  src/config/           Environment configuration
  src/config/prisma.js  Reusable Prisma client
  src/controllers/      Request handlers
  src/middleware/       Shared middleware
  src/routes/           API route definitions
research.md             Product research and problem discovery
```

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer

## Installation

From the repository root:

```bash
npm install
npm --prefix client install
npm --prefix server install
Copy-Item server/.env.example server/.env
```

Set `DATABASE_URL` in `server/.env` to a PostgreSQL connection string, for example:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/locallens?schema=public
```

PostgreSQL must be installed and running, and the `locallens` database must exist before applying migrations. Then run:

```bash
npm --prefix server run db:generate
npm --prefix server run db:migrate
```

For deployment environments with committed migrations, use:

```bash
npm --prefix server run db:deploy
```

The database client is configured in `server/src/config/prisma.js`. No database credentials are committed.

## Run locally

Start both applications:

```bash
npm run dev
```

Or start them separately:

```bash
npm run client
npm run server
```

- Frontend: http://localhost:5173
- Backend health check: http://localhost:5000/api/health

Create a production frontend build with:

```bash
npm run build
```

## Current development phase

**Phases 3–6 plus location search: Authentication, seller management, marketplace discovery,
Nominatim place selection, and radius filtering.**
Reservation APIs, analytics, payments, delivery, inventory tracking, and other later-phase
features remain intentionally out of scope.

## Backend API

Authentication endpoints are `POST /api/auth/register`, `POST /api/auth/login`, and
`GET /api/auth/me` (Bearer token). Public marketplace endpoints are
`GET /api/shops`, `GET /api/shops/:id`, `GET /api/products`, and
`GET /api/products/:id`. Seller endpoints create/update shops and manage products
under `/api/shops/:shopId/products` and `/api/products/:id`.

`GET /api/products` accepts `q` (or `search`), `category`, `sort` (`newest`,
`price_asc`, `price_desc`, or `distance`), `page`, `limit`, and optional
`lat`, `lng`, `radius` (kilometres). Successful list responses have the shape
`{ success: true, data: [...], meta: { page, limit, total, totalPages } }`;
detail responses use `{ success: true, data: {...} }`. Seller product create/update
accepts multipart field `image`. Cloudinary credentials are required for image
operations. `GET /api/shops/mine` returns the authenticated seller's shops.
Product listings are for discovery only and do not guarantee current availability.
