# @task-app/api

NestJS + TypeORM + PostgreSQL backend. Routes are served under `/api/v1`.

## Setup

1. `yarn install` at the repo root, then `yarn build:shared`.
2. Start PostgreSQL and create the database: `psql -U postgres -c "CREATE DATABASE task_management;"`
3. Copy `.env.example` (repo root) to `.env` and set `DB_PASSWORD` and the other `DB_*` values. The API reads the root `.env`.
4. `yarn dev:api` from the repo root. Check `http://localhost:3000/api/v1/health`.

## Environment variables

Validated at startup (the app refuses to start if one is missing or invalid).

| Variable            | Default       | Notes                               |
| ------------------- | ------------- | ----------------------------------- |
| `NODE_ENV`          | `development` | `development`, `production`, `test` |
| `API_PORT`          | `3000`        |                                     |
| `ADMIN_CORS_ORIGIN` | required      | Admin panel origin                  |
| `DB_HOST`           | required      |                                     |
| `DB_PORT`           | `5432`        |                                     |
| `DB_USER`           | required      |                                     |
| `DB_PASSWORD`       | required      |                                     |
| `DB_NAME`           | required      |                                     |

Other variables in `.env.example` (JWT, SMTP, seed) are validated when the checkpoint that uses them lands.

## Scripts

- `yarn workspace @task-app/api build | start | start:dev | typecheck`
- `yarn workspace @task-app/api typeorm <command>`: TypeORM CLI using `src/database/data-source.ts`. `synchronize` is off, so schema changes go through migrations in `src/database/migrations/`.

## Response shape

Successes: `{ success: true, data, meta? }`. Errors: `{ success: false, statusCode, error, message, details?, path, timestamp }`. Types live in `@task-app/shared`.
