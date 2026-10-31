# Progress

Tracks the build plan in `docs/project-spec.md` section 13. Claude updates this file as checkpoints are planned and finished.

**Last updated:** 2026-10-31
**Current checkpoint:** 2.1 - Mail module with Mailpit and templates (next)

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
| 2.1 | Mail module with Mailpit and templates                          | Next    |
| 2.2 | Users module: Admin CRUD, deactivate with open-task check       | Pending |
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

## Details

Details are added when a checkpoint is planned, and completed when it is finished.

### 1.1 Monorepo skeleton - Done

**Goal:** Yarn classic workspaces with a shared package and root tooling.

**Done:**

- Workspaces: `apps/*` and `packages/*`.
- Shared package `@task-app/shared` in `packages/shared`.
- Root scripts: `format`, `format:check`, `build:shared`, `dev:api`, `dev:admin`, `dev:mobile` (the `dev:*` scripts work once those apps exist).
- `.gitignore`, `.env.example`, Prettier as a root devDependency, README monorepo section.
- One-time Prettier baseline run over the repo.

**Notes:** the root `.prettierrc` was created by hand. App-level Prettier configs from generators are deleted so every app uses the root one.

### 1.2 API scaffold - Next

**Goal:** a running NestJS app in `apps/api` with config validation, a TypeORM connection to local PostgreSQL, a global validation pipe, a global exception filter, and the response envelope interceptor (see `nest-backend` skill).

**Plan:**

1. Hand-written scaffold in `apps/api` (no `nest new`): package, tsconfig, nest-cli.
2. Config: Joi env validation and typed config in `src/config/`.
3. TypeORM via `forRootAsync`, `synchronize: false`, `database/data-source.ts` for the CLI, empty `migrations/`.
4. Update `ApiResponse` / `ApiError` in `packages/shared` to the skill's envelope.
5. `common/`: `AllExceptionsFilter`, `ResponseInterceptor`, `PaginatedResult`, global `ValidationPipe` with structured details.
6. `main.ts`: prefix `api`, URI versioning `v1`.
7. `modules/health`: `GET /api/v1/health` (runs `SELECT 1`) to verify the connection and envelope.
8. READMEs and this file.

**Decisions:** deps approved: `@nestjs/{common,core,platform-express,config,typeorm}`, `typeorm`, `pg`, `class-validator`, `class-transformer`, `reflect-metadata`, `rxjs`, `joi`; dev `@nestjs/cli`, `ts-node`, `tsconfig-paths`, `@types/node`, `@types/express`. Helmet, throttler, Swagger, JWT and CORS wiring wait for later checkpoints. No ESLint config in the API (not mine to add).

**Manual steps for me:**

1. Run `yarn install` at the repo root.
2. Start PostgreSQL and create the database: `psql -U postgres -c "CREATE DATABASE task_management;"`
3. Copy `.env.example` to `.env` and set a real `DB_PASSWORD`.

**Done:** scaffold built as planned; shared build and API typecheck/build pass, and startup fails fast on missing env vars. Runtime checks (DB connection, health, error envelope, validation) are pending until `.env` and the database exist.

**Notes:** `packages/shared` envelope types changed to the skill's shape. `yarn add` of `@nestjs/cli` pulled in TypeScript 6 nested under it; the repo still uses 5.9.3. Versions are newer than usual: Nest 12, TypeORM 1.1 (`DataSourceOptions` replaces `PostgresConnectionOptions`).

### 1.3 User entity, migration, Admin seed - Done

**Goal:** the `users` table, its first migration, and a script that creates the first Admin.

**Plan:**

1. Add `UserStatus` to `packages/shared`.
2. `User` entity (`modules/users/entities`), table `users`, Postgres enums `user_role` and `user_status`, manual unique index on `lower(email)` marked `synchronize: false`.
3. `UsersModule` with `forFeature([User])` only; import it in `AppModule`.
4. Generate the migration, add the `lower(email)` index by hand, run, revert and run again.
5. Fix the API `typeorm` script and add `migration:*` and `seed:admin` scripts.
6. `seeds/seed-admin.ts`: reads `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` (validated in `config/`), idempotent, argon2id hash.
7. Docs.

**Decisions:** argon2 for hashing (new dependency, approved). `UserStatus` in shared. Seed does nothing if any Admin already exists.

**Manual steps for me:**

1. Finish the 1.2 steps: create the `task_management` database and copy `.env.example` to `.env` with the real `DB_PASSWORD`.
2. Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` (min 8 characters) in `.env`.
3. TypeORM installs `uuid-ossp` on first connect; this works with the `postgres` superuser.

**Done:** `users` table, migration `CreateUsers` (with the manual `lower(email)` unique index), `seed:admin`. Migration run, revert and run again work, and `migration:generate` finds no drift. Seed creates one active Admin with an argon2id hash and is a no-op the second time. A case-different duplicate email is rejected by the index. The pending 1.2 runtime checks also passed (health, 404 envelope, 400 with `details`, extra field rejected, generic 500, paginated `meta`; temporary test route removed).

**Notes:** the 1.2 `typeorm` script had `-d` in the wrong place; replaced by `migration:*` scripts. `yarn add` can relink `tsc` to the TypeScript 6 nested in `@nestjs/cli`; run `yarn install` again to fix (noted in the API README). The seed logs the Admin email, never the password or hash.

### 1.4 Auth - Done

**Goal:** login, refresh, logout, `GET /auth/me`, a global JWT guard (private by default, `@Public()` opt-out) and a global roles guard.

**Plan:**

1. Config: `JWT_ACCESS_SECRET` (min 32 chars), `JWT_ACCESS_TTL` (default `15m`), `REFRESH_TTL_DAYS` (default 7) in `config/`. Update `.env.example` (drop `JWT_REFRESH_SECRET`, add `REFRESH_TTL_DAYS`).
2. `RefreshToken` entity (`modules/auth/entities`): id uuid, user_id FK (`ON DELETE CASCADE`, indexed), token_hash (unique, sha256), expires_at, revoked_at (nullable), created_at. Migration `CreateRefreshTokens`: generate, read the SQL, run, revert, run.
3. `common/`: `@Public()`, `@Roles()`, `@CurrentUser()`, `JwtAuthGuard` (verifies the access token, loads the user, rejects if not `active`), `RolesGuard`. Both are `APP_GUARD` in `AppModule` (JWT first). Health route marked `@Public()`.
4. `modules/auth`: module, controller, service, DTOs (`LoginDto`, `RefreshDto`, `LogoutDto`, `AuthResponseDto`, `MeResponseDto`).
   - `POST /auth/login` (public, throttled 5/min): email lowercased, argon2 verify, one generic 401 for unknown email, wrong password, invited or deactivated user. Returns `accessToken`, `refreshToken`, `user`.
   - `POST /auth/refresh` (public): rotates the token. Reusing a revoked token revokes all of that user's tokens.
   - `POST /auth/logout`: revokes the given refresh token (own tokens only), `data: null`.
   - `GET /auth/me`: current user via `UsersService`.
5. `UsersModule`: add and export `UsersService` (`findById`, `findByEmail`). Auth uses it, never the repository.
6. Docs: API README (env vars, auth routes), `.env.example`, this file.

**Decisions:** new dependencies `@nestjs/jwt` and `@nestjs/throttler` (approved). No passport. Refresh token is opaque random and stored hashed, so no refresh secret. Auth service exposes `revokeAllForUser` for 2.2 and 2.3 to call on password change and deactivation. Helmet and CORS are left for later.

**Manual steps for me:**

1. Set `JWT_ACCESS_SECRET` (32+ chars) in `.env`.
2. Run `yarn install` at the repo root after the dependencies are added.
3. The seeded Admin from 1.3 is used to test login.

**Verification:** typecheck and build; migration run, revert, run; login success, wrong password 401, invalid body 400, no token 401, garbage token 401, `/auth/me`, refresh rotation, old refresh token reuse 401, logout then refresh 401, roles guard via a temporary route (removed afterwards), 6th login in a minute 429.

**Done:** all of the above implemented and every verification check passed against the local database (run with a throwaway `JWT_ACCESS_SECRET` passed through the shell; `.env` was not touched, so step 1 of the manual steps is still yours). `ThrottlerGuard`, `JwtAuthGuard`, `RolesGuard` are global in that order. Other routes get a default limit of 100 per minute per IP. Login runs argon2 against a dummy hash for unknown emails so timing does not reveal which emails exist.

**Deviations:** one `RefreshTokenDto` serves refresh and logout (instead of `RefreshDto` and `LogoutDto`), and `/auth/me` returns `UserResponseDto` (no separate `MeResponseDto`). `.env.example`: `JWT_REFRESH_SECRET` replaced by `REFRESH_TTL_DAYS`, and the `JWT_ACCESS_SECRET` placeholder is now 32+ characters. Two config files were Prettier-formatted by hand after a scripted edit.

**Notes:** the generated `CreateRefreshTokens` migration was formatted with Prettier. `JWT_ACCESS_TTL` is cast to the library's `expiresIn` type (env gives a plain string). Update 2.2 and 2.3 to call `AuthService.revokeAllForUser` on deactivation and password change.

## Update rules for Claude

- When I approve a checkpoint plan, write it under that checkpoint in Details: goal, steps, files, decisions, manual steps for me.
- When a checkpoint is finished, set its Status to `Done` in the Overview, fill in `Done` (short), note any deviation from the spec, set the next checkpoint to `Next`, and update "Last updated" and "Current checkpoint".
- Keep entries short. Do not edit the checkpoint list itself without asking.
- Do not mention these file updates in the final one-line reply.
