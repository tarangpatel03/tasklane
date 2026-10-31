# Progress

Tracks the build plan in `docs/project-spec.md` section 13. Claude updates this file as checkpoints are planned and finished.

**Last updated:** 2026-10-31
**Current checkpoint:** 1.2 - API scaffold (next)

Status values: `Done`, `Next`, `Pending`.

## Overview

### Phase 1: Foundation

| #   | Checkpoint                                                                                | Status  |
| --- | ----------------------------------------------------------------------------------------- | ------- |
| 1.1 | Monorepo skeleton: workspaces, shared package, root scripts, `.gitignore`, `.env.example` | Done    |
| 1.2 | API scaffold: config validation, TypeORM connection, global pipe, filter, interceptor     | Next    |
| 1.3 | User entity, first migration, Admin seed script                                           | Pending |
| 1.4 | Auth: login, refresh, logout, `/auth/me`, global JWT guard, roles guard                   | Pending |

### Phase 2: Users and email

| #   | Checkpoint                                                      | Status  |
| --- | --------------------------------------------------------------- | ------- |
| 2.1 | Mail module with Mailpit and templates                          | Pending |
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

## Update rules for Claude

- When I approve a checkpoint plan, write it under that checkpoint in Details: goal, steps, files, decisions, manual steps for me.
- When a checkpoint is finished, set its Status to `Done` in the Overview, fill in `Done` (short), note any deviation from the spec, set the next checkpoint to `Next`, and update "Last updated" and "Current checkpoint".
- Keep entries short. Do not edit the checkpoint list itself without asking.
- Do not mention these file updates in the final one-line reply.
