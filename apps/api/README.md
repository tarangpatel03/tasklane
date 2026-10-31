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
| `JWT_ACCESS_SECRET` | required      | At least 32 characters              |
| `JWT_ACCESS_TTL`    | `15m`         | Access token lifetime               |
| `REFRESH_TTL_DAYS`  | `7`           | Refresh token lifetime in days      |

Mail variables are all optional (see Mail below). The seed variables in `.env.example` are only read by `seed:admin`.

## Mail

`MailService` (`src/modules/mail`) sends email over SMTP with `nodemailer`. `send(to, content)` never throws: a failure is logged (message only) and returns `false`, so mail cannot break a request. Templates for the four emails are functions in `src/modules/mail/templates/`. Emails contain no links.

| Variable    | Default     | Notes                                                                |
| ----------- | ----------- | -------------------------------------------------------------------- |
| `SMTP_HOST` | empty       | Empty uses an Ethereal test account (see below)                      |
| `SMTP_PORT` | `587`       | 587 uses STARTTLS, 465 uses TLS from the start                       |
| `SMTP_USER` | empty       | Set together with `SMTP_PASS`                                        |
| `SMTP_PASS` | empty       | For Gmail, an App Password                                           |
| `MAIL_FROM` | `SMTP_USER` | Sender address. Gmail may replace it with the account address anyway |

**Gmail:** turn on 2-Step Verification on the Google account, create an App Password (Google Account, Security, App passwords), and put the 16 characters without spaces in `SMTP_PASS`. Use `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587` and your Gmail address as `SMTP_USER`. Your normal Google password does not work.

**No setup (Ethereal):** leave `SMTP_HOST` empty or remove the `SMTP_*` lines. On the first email the API creates a free Ethereal test account. Nothing is delivered; each email's preview URL is printed in the API log. This needs internet access.

## Auth

Every route needs `Authorization: Bearer <accessToken>` unless marked `@Public()`. `@Roles(...)` limits a route to roles. Deactivated or not-yet-active users are rejected on every request.

- `POST /auth/login` (public, 5 per minute): `{ email, password }` returns `accessToken`, `refreshToken`, `user`.
- `POST /auth/refresh` (public, 10 per minute): `{ refreshToken }` returns a new pair. The old refresh token stops working. Reusing a revoked one revokes all of that user's sessions.
- `POST /auth/logout`: `{ refreshToken }` revokes that token.
- `GET /auth/me`: the current user.

Refresh tokens are random strings stored as SHA-256 hashes in `refresh_tokens`. All other routes allow 100 requests per minute per IP.

## Scripts

- `yarn workspace @task-app/api build | start | start:dev | typecheck`
- `yarn workspace @task-app/api typeorm <command> -d src/database/data-source.ts`: raw TypeORM CLI. `synchronize` is off, so schema changes go through migrations in `src/database/migrations/`.
- `yarn workspace @task-app/api migration:generate src/database/migrations/<Name>`, `migration:run`, `migration:revert`. Read generated SQL before running. TypeORM cannot generate expression indexes (such as `lower(email)`), so add those by hand.
- `yarn workspace @task-app/api seed:admin`: creates the first Admin from `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` (min 8 characters) in the root `.env`. It does nothing if an Admin already exists.
- After `yarn add`, run `yarn install` once more if `tsc` reports a TypeScript 6 error. `@nestjs/cli` ships its own TypeScript 6, and `yarn add` can relink `tsc` to it.

## Response shape

Successes: `{ success: true, data, meta? }`. Errors: `{ success: false, statusCode, error, message, details?, path, timestamp }`. Types live in `@task-app/shared`.
