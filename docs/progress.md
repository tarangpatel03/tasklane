# Progress

Tracks the build plan in `docs/project-spec.md` section 13. Claude updates this file as checkpoints are planned and finished.

**Last updated:** 2026-10-31
**Current checkpoint:** 2.2 - Users module: Admin CRUD, deactivate with open-task check (next)

Status values: `Done`, `Next`, `Pending`.

## Overview

### Phase 1: Foundation

| #   | Checkpoint                                                                                | Status |
| --- | ----------------------------------------------------------------------------------------- | ------ |
| 1.1 | Monorepo skeleton: workspaces, shared package, root scripts, `.gitignore`, `.env.example` | Done   |
| 1.2 | API scaffold: config validation, TypeORM connection, global pipe, filter, interceptor     | Done   |
| 1.3 | User entity, first migration, Admin seed script                                           | Done   |
| 1.4 | Auth: login, refresh, logout, `/auth/me`, global JWT guard, roles guard                   | Done   |

### Phase 2: Users and email

| #   | Checkpoint                                                      | Status  |
| --- | --------------------------------------------------------------- | ------- |
| 2.1 | Mail module with Mailpit and templates                          | Done    |
| 2.2 | Users module: Admin CRUD, deactivate with open-task check       | Next    |
| 2.3 | Invite flow: setup code, setup-account, resend, forgot or reset | Pending |

### Phase 3: Tasks

| #   | Checkpoint                                                                   | Status  |
| --- | ---------------------------------------------------------------------------- | ------- |
| 3.1 | Task, assignee, comment and status-history entities, migration               | Pending |
| 3.2 | Task CRUD with one Manager and several Employees, role scoping, "added" mail | Pending |
| 3.3 | Workflow transitions, review and reject, submitted and result emails         | Pending |
| 3.4 | Dashboard summary endpoint and demo seed data                                | Pending |

### Phase 4: Admin panel

| #   | Checkpoint                                                               | Status  |
| --- | ------------------------------------------------------------------------ | ------- |
| 4.1 | Scaffold: React and TypeScript, routing, API client, auth, design tokens | Pending |
| 4.2 | Login and layout shell                                                   | Pending |
| 4.3 | Users pages                                                              | Pending |
| 4.4 | Tasks pages: list, filter, create, assign, review                        | Pending |
| 4.5 | Dashboard                                                                | Pending |

### Phase 5: Mobile

| #   | Checkpoint                                                                       | Status  |
| --- | -------------------------------------------------------------------------------- | ------- |
| 5.1 | Scaffold: navigation, theme tokens, API client, secure storage, safe areas, hook | Pending |
| 5.2 | Auth screens: login, set up account, reset password                              | Pending |
| 5.3 | Task list and detail on phone, with actions, comments and history                | Pending |
| 5.4 | Manager flows: create task, pick Employees, review queue                         | Pending |
| 5.5 | Tablet split-pane layout and rotation checks on the real phone and tablet        | Pending |
| 5.6 | Profile, loading, empty and error states, animations                             | Pending |

### Phase 6: Polish

| #   | Checkpoint                                      | Status  |
| --- | ----------------------------------------------- | ------- |
| 6.1 | READMEs, Swagger, screenshots, demo walkthrough | Pending |
| 6.2 | Security checklist pass                         | Pending |
| 6.3 | Final check on phone and tablet                 | Pending |

## Open items for me

- 2.2 and 2.3 must call `AuthService.revokeAllForUser` on deactivation and password change.
- 2.3 imports `MailModule` and does the first real Gmail send check.
- Spec sections 7 and 14 and the 2.1 checklist label still say Mailpit (dropped for Gmail plus Ethereal). Left unchanged until I say so.

## Details

Details are added when a checkpoint is planned, and completed when it is finished. Finished entries are kept short: goal, decisions, what was done, deviations.

### 1.1 Monorepo skeleton - Done

**Goal:** Yarn classic workspaces with a shared package and root tooling.

**Done:** workspaces `apps/*` and `packages/*`; shared package `@task-app/shared`; root scripts `format`, `format:check`, `build:shared`, `dev:api`, `dev:admin`, `dev:mobile` (the `dev:*` ones work once those apps exist); `.gitignore`, `.env.example`, Prettier as a root devDependency, README monorepo section; one-time Prettier baseline.

**Notes:** the root `.prettierrc` was created by hand. App-level Prettier configs from generators are deleted so every app uses the root one.

### 1.2 API scaffold - Done

**Goal:** a NestJS app in `apps/api` with Joi config validation, a TypeORM connection to local PostgreSQL, a global validation pipe, exception filter and response envelope interceptor (see `nest-backend` skill).

**Decisions:** hand-written scaffold (no `nest new`). Approved deps: `@nestjs/{common,core,platform-express,config,typeorm}`, `typeorm`, `pg`, `class-validator`, `class-transformer`, `reflect-metadata`, `rxjs`, `joi`; dev `@nestjs/cli`, `ts-node`, `tsconfig-paths`, `@types/node`, `@types/express`. `synchronize: false`, `database/data-source.ts` for the CLI. `main.ts`: prefix `api`, URI version `v1`. `GET /api/v1/health` runs `SELECT 1`. `ApiResponse` / `ApiError` in `packages/shared` follow the skill's envelope. No ESLint config in the API (not mine to add).

**Done:** scaffold built; startup fails fast on missing env vars. Runtime checks passed in 1.3 (health, 404 envelope, 400 with `details`, extra field rejected, generic 500, paginated `meta`).

**Notes:** `yarn add` of `@nestjs/cli` pulled in TypeScript 6 nested under it; the repo uses 5.9.3. Versions are newer than usual: Nest 12, TypeORM 1.1 (`DataSourceOptions` replaces `PostgresConnectionOptions`).

### 1.3 User entity, migration, Admin seed - Done

**Goal:** the `users` table, its first migration, and a script that creates the first Admin.

**Decisions:** argon2 for hashing (approved dependency). `UserStatus` in shared. Seed does nothing if any Admin already exists. `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` (min 8 chars) are validated in `config/`. TypeORM installs `uuid-ossp` on first connect (works with the `postgres` superuser).

**Done:** `User` entity (Postgres enums `user_role`, `user_status`; manual unique index on `lower(email)` marked `synchronize: false`), migration `CreateUsers`, `UsersModule`, `seed:admin` (idempotent, argon2id). Migration run, revert, run work and `migration:generate` finds no drift. A case-different duplicate email is rejected by the index.

**Notes:** the 1.2 `typeorm` script had `-d` in the wrong place; replaced by `migration:*` scripts. `yarn add` can relink `tsc` to the nested TypeScript 6; run `yarn install` again (noted in the API README). The seed logs the Admin email, never the password or hash.

### 1.4 Auth - Done

**Goal:** login, refresh, logout, `GET /auth/me`, a global JWT guard (private by default, `@Public()` opt-out) and a global roles guard.

**Decisions:** new deps `@nestjs/jwt` and `@nestjs/throttler` (approved), no passport. Config: `JWT_ACCESS_SECRET` (min 32), `JWT_ACCESS_TTL` (default `15m`), `REFRESH_TTL_DAYS` (default 7). Refresh token is opaque random, stored as SHA-256 in `refresh_tokens` (FK `ON DELETE CASCADE`, unique hash), so no refresh secret. Helmet and CORS are left for later.

**Done:**

- Global guards in order: `ThrottlerGuard` (default 100/min per IP), `JwtAuthGuard` (loads the user on every request, rejects if not `active`), `RolesGuard`. Decorators `@Public()`, `@Roles()`, `@CurrentUser()`. Health route is public.
- `POST /auth/login` (public, 5/min): one generic 401 for unknown email, wrong password, invited or deactivated user; argon2 runs against a dummy hash for unknown emails so timing does not leak.
- `POST /auth/refresh` (public, 10/min): rotates the token; reusing a revoked one revokes all of that user's tokens.
- `POST /auth/logout`: revokes the caller's own token, `data: null`. `GET /auth/me`.
- `UsersService` (`findById`, `findByEmail`) exported from `UsersModule`; `AuthService.revokeAllForUser` for later checkpoints.
- Verified against the local database (login, wrong password 401, invalid body 400, no or garbage token 401, `/auth/me`, rotation, old-token reuse 401, logout then refresh 401, roles guard via a temporary route, 6th login 429). Migration `CreateRefreshTokens` run, revert, run.

**Deviations:** one `RefreshTokenDto` for refresh and logout; `/auth/me` returns `UserResponseDto` (no `MeResponseDto`). `.env.example`: `JWT_REFRESH_SECRET` replaced by `REFRESH_TTL_DAYS`, longer `JWT_ACCESS_SECRET` placeholder.

**Notes:** tests ran with a throwaway `JWT_ACCESS_SECRET` passed through the shell. `JWT_ACCESS_TTL` is cast to the library's `expiresIn` type (env gives a plain string).

### 2.1 Mail module - Done

**Goal:** a `MailService` with a generic `send`, the four email templates from spec section 7, and SMTP config. No triggers yet (they come in 2.3, 3.2 and 3.3).

**Decisions:** `nodemailer` (approved; the planned dev `@types/nodemailer` was not needed because nodemailer 10 ships its own types). Mailpit dropped for Gmail plus Ethereal. `send` has no retry or queue. Emails contain no links.

**Done:**

- Config: optional `SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`; empty strings count as unset; `SMTP_USER` and `SMTP_PASS` must be set together. `.env.example` has Gmail placeholders and the Ethereal note.
- `MailService.send(to, { subject, html, text }): Promise<boolean>` never throws; failures are logged with the message only. Transport is built on first send: with `SMTP_HOST`, `secure` only on port 465 and `requireTLS` otherwise (587 uses STARTTLS); without it, one cached Ethereal account and a logged preview URL per email. From: `MAIL_FROM`, else `SMTP_USER`, else the Ethereal address (or `no-reply@taskapp.local` if a host is set with neither).
- Templates in `modules/mail/templates/` (`layout.ts` with `escapeHtml`, `account-created`, `added-to-task`, `submitted-for-review`, `review-result`); subjects are forced to one line. `MailModule` exports `MailService` and is not imported in `AppModule` yet.
- API README documents SMTP, the Gmail App Password steps (2-Step Verification, 16 characters without spaces), the Ethereal option and the Gmail From rewrite.
- Verified with a temporary script (deleted): five Ethereal sends returned `true` with preview URLs, `<script>` and a line break in a task title stayed escaped, a bad host logged `ECONNREFUSED`, returned `false` and did not throw (no password logged). A real Gmail send is not verified yet (see Open items).

## Update rules for Claude

- When I approve a checkpoint plan, write it under that checkpoint in Details: goal, steps, files, decisions, manual steps for me.
- When a checkpoint is finished, set its Status to `Done` in the Overview, fill in `Done` (short), note any deviation from the spec, set the next checkpoint to `Next`, and update "Last updated" and "Current checkpoint".
- Keep entries short. Do not edit the checkpoint list itself without asking.
- Do not mention these file updates in the final one-line reply.
