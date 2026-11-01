# @task-app/api

NestJS + TypeORM + PostgreSQL backend. Routes are served under `/api/v1`.

## Setup

1. `yarn install` at the repo root, then `yarn build:shared`.
2. Start PostgreSQL and create the database: `psql -U postgres -c "CREATE DATABASE task_management;"`
3. Copy `.env.example` (repo root) to `.env` and set `DB_PASSWORD` and the other `DB_*` values. The API reads the root `.env`.
4. `yarn dev:api` from the repo root. Check `http://localhost:3000/api/v1/health`.

## API docs (Swagger)

With `NODE_ENV` other than `production`, Swagger UI is at `http://localhost:3000/api/docs` (raw JSON at `/api/docs-json`) and lists every route under `/api/v1`. Log in with `POST /auth/login`, copy `accessToken`, press Authorize and paste it. The `@nestjs/swagger` CLI plugin (`nest-cli.json`) builds the schemas from the DTOs, so a new DTO property shows up without extra decorators; new controllers need `@ApiTags`, `@ApiBearerAuth` (private routes) and `@ApiOperation`. Every success response is wrapped as `{ success, data, meta? }` (see Response shape); the schemas describe `data` only. The HTML account pages (`/account/*`) are left out. Production serves no docs.

## Environment variables

Validated at startup (the app refuses to start if one is missing or invalid).

| Variable            | Default                       | Notes                                       |
| ------------------- | ----------------------------- | ------------------------------------------- |
| `NODE_ENV`          | `development`                 | `development`, `production`, `test`         |
| `API_PORT`          | `3000`                        |                                             |
| `ADMIN_CORS_ORIGIN` | required                      | Admin panel origin                          |
| `DB_HOST`           | required                      |                                             |
| `DB_PORT`           | `5432`                        |                                             |
| `DB_USER`           | required                      |                                             |
| `DB_PASSWORD`       | required                      |                                             |
| `DB_NAME`           | required                      |                                             |
| `JWT_ACCESS_SECRET` | required                      | At least 32 characters                      |
| `JWT_ACCESS_TTL`    | `15m`                         | Access token lifetime                       |
| `REFRESH_TTL_DAYS`  | `7`                           | Refresh token lifetime in days              |
| `PUBLIC_BASE_URL`   | `http://localhost:<API_PORT>` | Host used in email links, see Account links |

Mail variables are all optional (see Mail below). The seed variables in `.env.example` are only read by `seed:admin` (`SEED_ADMIN_*`) and `seed:demo` (`SEED_DEMO_PASSWORD`).

## Mail

`MailService` (`src/modules/mail`) sends email over SMTP with `nodemailer`. `send(to, content)` never throws: a failure is logged (message only) and returns `false`, so mail cannot break a request. Templates for the emails are functions in `src/modules/mail/templates/`. Only the invite and the password reset email contain a link (see Account links).

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
- `POST /auth/change-password` (5 per minute): `{ currentPassword, newPassword }` (8 to 128 characters). Revokes every session and returns a fresh `accessToken`/`refreshToken` pair for the calling device. A wrong current password is a 400 with a `currentPassword` detail, not a 401.
- `GET /auth/me`: the current user.
- `POST /auth/forgot-password` (public, 3 per minute): `{ email }` always answers 200. An active user gets a reset email; nobody else does, and at most one per minute.

Refresh tokens are random strings stored as SHA-256 hashes in `refresh_tokens` (`RefreshTokensService`). All other routes allow 100 requests per minute per IP.

## Users

Lists are paginated (`page`, `limit` up to 100). Emails are stored lowercase and are unique.

- `GET /users` (any role): filters `role`, `status`, `search` (part of name or email). Admin sees everyone, a Manager sees Employees and self, an Employee sees self.
- `GET /users/:id` (any role): same visibility. A user the caller may not see returns 404.
- `POST /users` (Admin): `{ name, email, role }` with role `MANAGER` or `EMPLOYEE`. The user starts `invited` with no password and gets an email with a setup link.
- `POST /users/:id/resend-invite` (Admin): sends a new setup link to an `invited` user (409 otherwise). The earlier link stops working.
- `PATCH /users/:id` (Admin): any of `name`, `email`, `role` (`MANAGER` or `EMPLOYEE`), `status` (`active` or `deactivated`).
- `DELETE /users/:id` (Admin): same as `PATCH` with `status: deactivated`.

Rules, all answered with 409:

- An Admin cannot deactivate themselves or the last active Admin, and cannot change their own role. An Admin account's role cannot be changed, and Admin accounts cannot be created through the API (the seed script creates the first one).
- Deactivating revokes the user's refresh tokens, and the access token stops working immediately. A user who is on open tasks cannot be deactivated; the error lists the tasks.
- Activating works only from `deactivated`. Someone who never set a password goes back to `invited` instead of `active`. An `invited` user becomes active by setting up their account.

## Account links

The invite and password reset emails carry a one-time link to a small web page served by the API, where the user enters a password and confirms it. Afterwards they log in to the app with their email and that password.

- Pages (public, plain HTML, no scripts): `GET` and `POST /api/v1/account/setup?token=...` for invites (valid 48 hours) and `/api/v1/account/reset?token=...` for resets (valid 1 hour). A link works once, and a newer link for the same user replaces the older one. A reset signs the user out everywhere.
- Opening the page does not use up the link, so a mail client previewing it is harmless. The token is 256 random bits and only its SHA-256 is stored (`auth_tokens`).
- The link host comes from `PUBLIC_BASE_URL`. The default `http://localhost:3000` works when the email is opened on the same PC as the API. To open it on a phone, set `PUBLIC_BASE_URL=http://<your PC's LAN IP>:3000`, restart the API and allow port 3000 through the Windows firewall.
- The page is deliberately plain: the design brief is still empty. Its colours, spacing and sizes are tokens at the top of `src/modules/auth/account-pages.html.ts`.

## Tasks

Migration `CreateTasks` adds `tasks` (soft delete through `deleted_at`), `task_assignees` (primary key on task and user), `task_comments` and `task_status_history`. Deleting a task row cascades to its assignees, comments and history; users referenced by any of them cannot be hard-deleted. `tasks.manager_id` is nullable so an Admin can own a task without a Manager.

- `GET /api/v1/tasks` (filters: `status`, `priority`, `assigneeId`, `managerId`, `dueFrom`, `dueTo`, `search`; paginated, newest first) and `GET /api/v1/tasks/:id`. `GET /api/v1/tasks/summary` returns the count per status within the caller's scope. Tasks that are In Review also carry `submittedBy` and `submittedAt` (the latest submission). Admin sees every task, a Manager the tasks they manage, an Employee the tasks they are assigned to. Anything else is a 404.
- `POST /api/v1/tasks`, `PATCH /api/v1/tasks/:id`, `DELETE /api/v1/tasks/:id` (soft delete) for Admin and Manager. A Manager can only create tasks they manage and edit those; only an Admin sets, changes or clears the Manager. A task needs at least one assignee. `assigneeIds` on `PATCH` replaces the whole set.
- Assignees must be Employees and the Manager a Manager, neither deactivated. A new task starts as `TODO` with a first `task_status_history` row. `status` cannot be set here (transitions come in 3.3).
- `POST /api/v1/tasks/:id/transition` with `action` and an optional `comment` (max 2000, stored in `task_status_history`). Every transition is checked on the server and recorded with who did it:

  | Action     | Change                 | Who                             | Rule                                  |
  | ---------- | ---------------------- | ------------------------------- | ------------------------------------- |
  | `START`    | TODO to WORKING        | an assignee                     |                                       |
  | `SUBMIT`   | WORKING to IN_REVIEW   | an assignee                     | only if the task requires review      |
  | `COMPLETE` | WORKING to COMPLETED   | an assignee                     | only if the task does not need review |
  | `APPROVE`  | IN_REVIEW to COMPLETED | the task's Manager, or an Admin |                                       |
  | `REJECT`   | IN_REVIEW to WORKING   | the task's Manager, or an Admin | `comment` required                    |

  A task the caller cannot see is a 404, an action the caller may not do is a 403, a wrong current status is a 409. Admin and Manager cannot start, submit or complete. A task with no Manager is reviewed by an Admin.

- `GET` and `POST /api/v1/tasks/:taskId/comments` (body 1-2000 characters, oldest first, paginated) for anyone who can see the task, including on completed tasks. No edit or delete.
- `GET /api/v1/tasks/:taskId/history` returns the task's status changes (`fromStatus` is null for the creation row, `toStatus`, `actor`, `comment`, `createdAt`), oldest first and paginated, for anyone who can see the task. Read-only.
- Emails: only two. Submitting for review emails the task's Manager and, if the creator is an Admin and not the Manager, the creator. Approving or rejecting emails every assignee (with the comment). Nothing else sends mail.
- A user on a task that is not completed or deleted (as Manager or assignee) cannot be deactivated or change role. The 409 lists the tasks in `details`.

## Dashboard

`GET /api/v1/dashboard/summary` (Admin only) returns `totals` (task count and a count for each status), `overdue` (count plus the 10 oldest-due tasks that are not completed) and `perManager` (one row per active Manager, even with no tasks, plus any other Manager who still has tasks, and a last row with `manager: null` for tasks without a Manager; each row has `total`, `byStatus` and `overdue`). It also returns `recentActivity`: the 8 latest status changes (`taskId`, `taskTitle`, `fromStatus`, `toStatus`, `actor`, `comment`, `createdAt`, newest first) on tasks that still exist. Soft-deleted tasks are not counted.

## Demo data

`yarn workspace @task-app/api seed:demo` fills the database for demos: 2 Managers, 5 Employees and 14 sample tasks in every status (some overdue, one without a Manager, comments and status history included). It needs an Admin (`seed:admin` first) and `SEED_DEMO_PASSWORD` (min 8 characters) in the root `.env`, which becomes the password of every demo account.

- Demo logins: `maya@demo.test` and `daniel@demo.test` (Managers); `aisha@`, `ben@`, `chloe@`, `diego@` and `emma@demo.test` (Employees). The `.test` domain never receives mail, and the seed sends none.
- Running it again does nothing while the demo accounts exist. To start over, delete the demo data in SQL: `DELETE FROM tasks WHERE id IN (SELECT task_id FROM task_assignees WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@demo.test'));` then `DELETE FROM users WHERE email LIKE '%@demo.test';`, and run the seed again.

## Scripts

- `yarn workspace @task-app/api build | start | start:dev | typecheck`
- `yarn workspace @task-app/api typeorm <command> -d src/database/data-source.ts`: raw TypeORM CLI. `synchronize` is off, so schema changes go through migrations in `src/database/migrations/`.
- `yarn workspace @task-app/api migration:generate src/database/migrations/<Name>`, `migration:run`, `migration:revert`. Read generated SQL before running. TypeORM cannot generate expression indexes (such as `lower(email)`), so add those by hand.
- `yarn workspace @task-app/api seed:admin`: creates the first Admin from `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` (min 8 characters) in the root `.env`. It does nothing if an Admin already exists.
- After `yarn add`, run `yarn install` once more if `tsc` reports a TypeScript 6 error. `@nestjs/cli` ships its own TypeScript 6, and `yarn add` can relink `tsc` to it.

## Response shape

Successes: `{ success: true, data, meta? }`. Errors: `{ success: false, statusCode, error, message, details?, path, timestamp }`. Types live in `@task-app/shared`.
