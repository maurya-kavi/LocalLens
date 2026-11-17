# LocalLens

LocalLens is a hyperlocal product discovery platform for Adityapur, Jamshedpur. It is intended to help customers discover and compare products listed by nearby physical shops, while helping local shopkeepers showcase selected products online.

The platform addresses the effort involved in visiting multiple shops to discover products and compare prices. Listings are for discovery only and do not guarantee current availability; customers should confirm details with the shopkeeper.

## Intended users

- **Customers:** Discover nearby products, compare local options, and contact shops before visiting.
- **Local shopkeepers:** Create a shop presence and showcase selected products to nearby customers.

## Technology stack

- Frontend: React, Vite, JavaScript, Tailwind CSS, React Router, Axios, Lucide React
- Backend: Node.js, Express, JavaScript (CommonJS), dotenv, cors
- Database: PostgreSQL, Prisma ORM
- Planned later phases: JWT/bcrypt, Cloudinary

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

**Phase 2: Database & Backend Architecture.** This phase adds the PostgreSQL/Prisma schema, initial migration, reusable Prisma client, and database setup commands. Authentication, seller tools, product APIs, reservations, image uploads, and other application functionality remain intentionally deferred to later phases.
