# Progress

Tracks the build plan in `docs/project-spec.md` section 13. Claude updates this file as checkpoints are planned and finished.

**Last updated:** 2026-10-31
**Current checkpoint:** 4.1 - Scaffold: React and TypeScript, routing, API client, auth, design tokens (next)

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

| #   | Checkpoint                                                      | Status |
| --- | --------------------------------------------------------------- | ------ |
| 2.1 | Mail module with Mailpit and templates                          | Done   |
| 2.2 | Users module: Admin CRUD, deactivate with open-task check       | Done   |
| 2.3 | Invite flow: setup code, setup-account, resend, forgot or reset | Done   |

### Phase 3: Tasks

| #   | Checkpoint                                                                   | Status |
| --- | ---------------------------------------------------------------------------- | ------ |
| 3.1 | Task, assignee, comment and status-history entities, migration               | Done   |
| 3.2 | Task CRUD with one Manager and several Employees, role scoping, "added" mail | Done   |
| 3.3 | Workflow transitions, review and reject, submitted and result emails         | Done   |
| 3.4 | Dashboard summary endpoint and demo seed data                                | Done   |

### Phase 4: Admin panel

| #   | Checkpoint                                                               | Status  |
| --- | ------------------------------------------------------------------------ | ------- |
| 4.1 | Scaffold: React and TypeScript, routing, API client, auth, design tokens | Next    |
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

- Real Gmail check (Claude cannot read `.env`): as Admin create a user with my own Gmail address (`POST /users`), open the email on the same PC, set a password on the page, log in. For the phone, set `PUBLIC_BASE_URL=http://<PC LAN IP>:3000` in `.env`, restart the API and allow port 3000 in the Windows firewall.
- Mobile 5.2 no longer needs set-up-account or reset-password screens, only login and "Forgot password" (email field). The 5.2 label is unchanged until I edit it.
- The invite page design is deliberately plain because `docs/design-brief.md` is empty. Restyle the tokens at the top of `src/modules/auth/account-pages.html.ts` once the brief exists.
- Change-password (spec 8) is built in 5.6 and must call `RefreshTokensService.revokeAllForUser`.
- Mobile 5.3 needs a task status history read endpoint (none exists yet; spec section 8 does not list one).
- Admin panel 4.3 activates and deactivates users with `PATCH /users/:id` and `status`.
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

### 2.2 Users module - Done

**Goal:** Admin create, edit, list, activate and deactivate users, plus the role-scoped read rules (spec 4, 6, 8). Not in 2.2: invite email, setup code and resend-invite (2.3), and the real open-task check (needs tasks, 3.1/3.2).

**Plan:**

1. Extract `RefreshTokensService` (1.4 refactor, avoids a Users to Auth import cycle). New `modules/refresh-tokens/` with module, service and the `RefreshToken` entity moved from `modules/auth/entities/`. The service owns token persistence: `issue`, `findByRawToken`, `revokeIfActive`, `revokeOwn`, `revokeAllForUser(userId, manager?)`. `AuthService` uses it; behaviour is unchanged. No migration (`migration:generate` must show no drift).
2. `common/dto/pagination-query.dto.ts`: `page` (default 1), `limit` (default 20, max 100).
3. DTOs in `modules/users/dto/`, no new dependency: `CreateUserDto` (name, lowercase email, role MANAGER or EMPLOYEE), `UpdateUserDto` (optional name, email, role, `status` of `active` or `deactivated`; written by hand, `PartialType` needs `@nestjs/mapped-types`), `QueryUsersDto` (pagination, role, status, search).
4. `UsersService`: `create` (status `invited`, no password, readable 409 on duplicate email); `list` and `getVisible` (Admin all, Manager Employees and self, Employee self; others 404; escaped parameterised `ILIKE` search; sorted by name then id); `update` in one transaction:
   - role only between MANAGER and EMPLOYEE, never for an Admin account or on yourself (409).
   - to `deactivated`: 409 for yourself, the last active Admin, or open tasks (tasks listed in `details`); sets the status and revokes all refresh tokens in the same transaction.
   - to `active`: only from `deactivated` (409 otherwise); a user who never set a password goes back to `invited`.
   - same status is a no-op.
   - `findOpenTasks(userId)` is a stub returning an empty list until 3.2.
5. `UsersController`: `GET /users`, `GET /users/:id` (any role, scoped in the service), `POST`, `PATCH /:id`, `DELETE /:id` (Admin only, `ParseUUIDPipe`). `DELETE` is kept per spec and calls the same deactivate path as `PATCH`.
6. API README (users endpoints, rules, the stub) and this file.

**Decisions:** open-task check is a stub until 3.2. Reactivation through `PATCH` (not in the spec; the admin panel will use it). Admin accounts cannot be created, promoted to or demoted from through the API. No new dependencies, no migration, no env changes.

**Manual steps for me:** none. `JWT_ACCESS_SECRET` is already in `.env`; SMTP values are not needed until 2.3.

**Verification:** typecheck, build, `format:check`, no `migration:generate` drift; 1.4 regression (login, refresh rotation and reuse, logout); a temporary script (deleted afterwards) inserts throwaway users into the dev database, runs the HTTP checks (create, duplicates, validation, 403 and 401, list scoping and filters, patch rules, deactivate then login, access token and refresh all 401 with tokens revoked, activate restores login, invited cannot be activated, deactivated never-set-password user returns to `invited`) and deletes every row it created. `.env` is not read. The last-Admin rule is a race safety net and is covered by code review only.

**Done:** everything above as planned. The check script passed every check (one assertion in it had a wrong expected count of 7 instead of 6; the API returned the correct total) and deleted its rows (0 left). `migration:generate` found no drift after the entity move. 1.4 regression (login, rotation, reuse 401, logout) passed after the refactor. A deactivated user's access token, refresh token and login all return 401 at once, and their tokens are marked revoked.

**Deviations:** `AuthService.revokeAllForUser` no longer exists; it moved to `RefreshTokensService`. The last-Admin check locks the active Admin rows inside the transaction. Updating with the same status is a no-op. Role changes are blocked on yourself and on Admin accounts. API README has a Users section.

### 2.3 Invite and reset by email link - Done

**Goal:** the invite and reset emails carry a link; the link opens a browser page (served by the API) with password and confirm password; afterwards the user logs in with email and that password. This reverses spec section 6 (setup code, no link).

**Decisions:** no new dependencies. Spec sections 6 to 10 rewritten for the link flow (`auth_tokens` replaces `auth_codes`, reset email added, `/account/...` pages replace the `/auth/setup-account` and `/auth/reset-password` JSON routes, mobile needs login and "Forgot password" only); checklist labels (2.3, 5.2) and Mailpit wording left unchanged. Reverses the 2.1 "no links in emails" rule for these two emails. No attempts counter (256-bit token, only its SHA-256 stored). Invite link valid 48 hours, reset link 1 hour. Change-password stays in 5.6.

**Done:**

- Optional `PUBLIC_BASE_URL` (default `http://localhost:<API_PORT>`) in config and `.env.example`.
- `modules/auth-tokens/` (`AuthToken` entity, migration `CreateAuthTokens`, `AuthTokensService`: `issue` replaces older unused tokens, `findValid`, single-use `consume`, `issuedWithin`, `buildUrl`).
- Mail: `accountCreatedEmail` takes a `setupUrl`, new `passwordResetEmail`, `renderLinkButton` in the layout; `escapeHtml` moved to `common/utils/escape-html.ts`.
- `POST /users` creates the user and setup token in one transaction and sends the invite after commit (unawaited); `POST /users/:id/resend-invite` (Admin, 409 unless `invited`).
- `POST /auth/forgot-password` (3/min, always 200, active users only, 60 s cooldown). `AuthService.previewToken` and `redeem` (a reset also revokes all refresh tokens).
- Pages `GET` and `POST /api/v1/account/setup` and `/account/reset`: plain HTML form, no scripts, GET does not use up the link, POST 10/min, `no-store`, `no-referrer`, strict CSP, everything escaped. A hidden username field helps password managers.
- Verified (41 checks, temporary script deleted, Ethereal only, no real mail, `.env` not read): invite email and link, page form, wrong confirm and short password re-render with the link still valid, success then login, link single use, resend (409, 403, 404, old link dies), forgot (unknown, invited, deactivated get nothing; cooldown), reset (old password and refresh tokens die, wrong-type, expired and deactivated-user links invalid), headers, name escaping in the email. Screenshots at 320 px and 1280 px look right. Migration run, revert, run; no drift.

**Deviations:** no JSON `setup-account` or `reset-password` endpoints. The page is plain because the design brief is empty. The real Gmail send is not verified yet (see Open items).

### 3.1 Task entities and migration - Done

**Done:** four entities, `TasksModule` (imported in `AppModule`), migration `CreateTasks`, API README section. Migration run, revert, run work and `migration:generate` finds no drift. Temporary SQL script (deleted, rows removed) confirmed defaults, duplicate assignee rejected (23505), referenced user delete rejected, task delete cascades. Typecheck, build and `/health` OK.

**Deviations:** `tasks.manager_id` is nullable (my decision: an Admin can own a task with no Manager); this changes spec section 5 and the "Manager is required" rule, so 3.2 must allow a null Manager (Admin only) and 3.3 must handle review on a task without one (Admin approves). The generated migration declared the `task_status` enum twice (once for `tasks`, once for the history table); I removed the duplicate `CREATE TYPE` and `DROP TYPE` by hand before applying it.

**Plan (as approved):**

**Goal:** the `tasks`, `task_assignees`, `task_comments` and `task_status_history` tables, as entities plus one migration. No controller, service, DTO, endpoint or email (those start in 3.2).

**Plan:**

1. Entities in `apps/api/src/modules/tasks/entities/`, same style as `user.entity.ts` (explicit snake_case `name:`, Postgres enums with `enumName`):
   - `task.entity.ts`: `title` (120), `description` (2000, nullable), `priority` (`task_priority`, default MEDIUM), `status` (`task_status`, default TODO), `due_date`, `requires_review` (default true), `manager_id`, `created_by`, `completed_at`, timestamps, `deleted_at` (`@DeleteDateColumn`). User FKs `ON DELETE RESTRICT`.
   - `task-assignee.entity.ts`: composite PK (`task_id`, `user_id`), `added_at`. `task_id` CASCADE, `user_id` RESTRICT.
   - `task-comment.entity.ts`: `task_id` (CASCADE), `author_id` (RESTRICT), `body` text, `created_at`.
   - `task-status-history.entity.ts`: `task_id` (CASCADE), `from_status` (nullable), `to_status`, `actor_id` (RESTRICT), `comment` (nullable), `created_at`.
2. Indexes: `tasks(manager_id, status)`, `tasks(created_by)`, `tasks(due_date)`, `task_assignees(user_id)`, plus `task_comments(task_id, created_at)` and `task_status_history(task_id, created_at)`.
3. `TasksModule` (`TypeOrmModule.forFeature` for the four entities) imported in `AppModule`; follow how `data-source.ts` finds entities.
4. Migration `CreateTasks` via `yarn migration:generate`; read the SQL before keeping it.
5. API README note on the new tables.

**Decisions:** `from_status` nullable so creation can be logged as the first history row (3.2 decides). Assignees being Employees and the manager being a Manager are service rules (3.2), not DB constraints. `completed_at` is set by the service in 3.3. No new dependencies, env changes, tsconfig or shared-package changes.

**Manual steps for me:** none. Local PostgreSQL must be running.

**Verification:** typecheck, build, `format:check`; migration run, revert, run; `migration:generate` shows no drift; temporary SQL script (deleted afterwards, rows removed) checks duplicate assignee rejected, deleting a referenced user rejected, task delete cascades; API starts and `/health` is OK.

### 3.2 Task CRUD and role scoping - Done

**Done:** all plan items. `TasksService` / `TasksController` / DTOs in `modules/tasks/`, `findOpenTasks` in `UsersService` replaced (also blocks role changes), `escapeLike` moved to `common/utils/escape-like.ts`, `UsersService.findByIds` added, API README updated. Typecheck, build and no migration drift. A temporary script (deleted, 0 rows left) ran 63 HTTP checks, all passing: create/validation per role, scoping, filters and paging, patch rules, soft delete, no email sent, deactivation and role change blocked on open tasks and allowed after completion.

**Deviations:** `UsersService` imports the `Task` entity (not `TasksModule`) to avoid a module cycle. The first `find`-based open-task query returned a 500 and was rewritten as a query builder with an EXISTS subquery. `addedToTaskEmail` stays unused. Spec section 7 and the 3.2 label still mention the "added" email.

**Plan (as approved):**

**Goal:** `GET/POST /tasks`, `GET/PATCH/DELETE /tasks/:id` with role scoping, one nullable Manager and several Employees, and the real open-task check in `UsersService`. No email in 3.2: the "added to task" email is dropped by my decision (only submitted-for-review and review-result emails remain, both in 3.3).

**Plan:**

1. DTOs in `modules/tasks/dto/`: `CreateTaskDto`, `UpdateTaskDto` (hand-written, `null` clears description, dueDate, managerId; `assigneeIds` replaces the set, min 1), `QueryTasksDto` (pagination, status, priority, assigneeId, managerId, dueFrom, dueTo, search), `TaskResponseDto` with `UserSummaryDto` (id, name, role).
2. `TasksService`: create (Admin may omit or pass the Manager; a Manager becomes the Manager, passing another is 403; one transaction with assignees and a first history row `null` to TODO); people validation (assignees active-or-invited Employees, Manager an active-or-invited Manager, else 400); list scoped by role (Admin all, Manager `manager_id`, Employee assignee EXISTS) with two-step pagination; `getVisible` (invisible is 404); update (Admin any, Manager own tasks, only Admin changes the Manager, assignee diff, row lock); soft delete.
3. `TasksController` at `/api/v1/tasks`; writes `@Roles(ADMIN, MANAGER)`; `ParseUUIDPipe`.
4. `TasksModule` imports `UsersModule`; registered in `AppModule` already.
5. Replace `findOpenTasks` in `UsersService` (non-deleted, non-COMPLETED tasks as assignee or Manager, queried through the transaction's `Task` repository to avoid a module cycle); also block role changes while a user is on open tasks.
6. API README section replaced; this file updated.

**Decisions:** comments endpoints move to 3.3. No new dependencies, migration, env, tsconfig or shared changes. Editing a COMPLETED task is allowed. Spec section 7 and the 3.2 label still mention the "added" email until I edit them.

**Manual steps for me:** none.

**Verification:** typecheck, build, `format:check`, no migration drift; temporary script (deleted afterwards, rows removed) covers create/list/read/patch/delete per role, validation errors, filters and paging, no mail sent, deactivation 409 with open tasks and success after completion, role change blocked; `/health` OK.

### 3.3 Workflow transitions, review, comments, emails - Done

**Done:** all plan items. `TaskAction` in `packages/shared`; `task-workflow.service.ts` with a rules table and `POST /tasks/:id/transition`; `task-comments.service.ts` / controller; `TasksService.assertVisible` and `loadOrFail` made public; `TasksModule` imports `MailModule`; API README updated. Typecheck, build, no migration drift. A temporary script (deleted, 0 rows left) ran 44 checks, all passing: both paths with history rows and `completed_at`, 409/400/403/404 cases, Admin reviewing a task with no Manager, parallel START (one 200, one 409), email counts from the API log (forced to Ethereal), and comments.

**Deviations:** none from the plan. The `submittedForReviewEmail` doc comment now says "creator when an Admin". No history read endpoint yet (5.3 adds it). Spec section 7 item 2 and the 3.2 label still mention the "added" email; `addedToTaskEmail` stays unused.

**Plan (as approved):**

**Goal:** status transitions (spec 5) with history, the submitted-for-review and review-result emails, and the comments endpoints deferred from 3.2.

**Plan:**

1. Add `TaskAction` (`START`, `SUBMIT`, `COMPLETE`, `APPROVE`, `REJECT`) to `packages/shared`; rebuild it.
2. `POST /tasks/:id/transition` (`action`, optional `comment`, max 2000) in a new `task-workflow.service.ts`: visibility first (invisible is 404), then one transaction with the task row locked and the status re-read. START (TODO to WORKING), SUBMIT (WORKING to IN_REVIEW, only if `requiresReview`), COMPLETE (WORKING to COMPLETED, only if not `requiresReview`) by an assignee; APPROVE (IN_REVIEW to COMPLETED) and REJECT (IN_REVIEW to WORKING, comment required) by the task's Manager or an Admin. Wrong status 409, not allowed to act 403. Sets or clears `completed_at`, inserts a `task_status_history` row each time.
3. Emails after commit, never failing the request, deactivated users skipped: SUBMIT goes to the Manager and to the creator if the creator is an Admin and not the Manager; APPROVE and REJECT go to every assignee. `TasksModule` imports `MailModule`.
4. Comments: `GET` (paginated, oldest first) and `POST` (body 1-2000) at `/tasks/:taskId/comments`, for anyone who can see the task. No edit or delete.
5. API README and this file.

**Decisions:** submitted email recipients are my answer above. No history read endpoint yet (5.3 adds it). No new dependencies, migration, env or tsconfig changes.

**Manual steps for me:** none. The test script forces Ethereal so no real mail is sent.

**Verification:** build shared, typecheck, build, `format:check`, no drift; temporary script (deleted, rows removed) covers the happy and reject paths, no-review path, 409/400/403/404 cases, parallel START, email counts from Ethereal log lines, and comments.

### 3.4 Dashboard summary and demo seed - Done

**Done:** all plan items. `modules/dashboard/` with `GET /dashboard/summary` (Admin only); `seeds/seed-demo.ts` + `seeds/demo-data.ts`; `loadDemoSeedEnv()`; `seed:demo` script; `.env.example` comment for `SEED_DEMO_PASSWORD`; API README sections. Typecheck, build, no migration drift. A temporary script (deleted) ran 24 checks, all passing: seed ran twice (second did nothing), 7 users and 14 tasks, history chains consistent and ending at each task's status, `completed_at` only on completed tasks; dashboard totals, overdue count and per-Manager rows equal independent SQL counts before and after a soft delete; idle active Manager listed, deactivated one not; Manager and Employee 403, no token 401. All test rows removed (0 left), so the dev database has no demo data yet.

**Deviations:** none. `SEED_DEMO_PASSWORD` was already in `.env.example` (added by me/you); I added a comment above it.

**Plan (as approved):**

**Goal:** `GET /dashboard/summary` for the admin panel dashboard, and a `seed:demo` script with sample users and tasks (spec 8, 10, 11).

**Plan:**

1. `modules/dashboard/` (module, controller, service, response DTO). `GET /dashboard/summary`, Admin only, soft-deleted tasks ignored. Returns `totals` (total and all four statuses), `overdue` (count plus the 10 oldest-due open tasks with their Manager) and `perManager` (every active Manager including zero rows, other Managers who still have tasks, and a last row for tasks with no Manager; each with total, by status, overdue). Three aggregate queries with `FILTER`, parameterised, read through `DataSource` like `UsersService.findOpenTasks`.
2. `yarn seed:demo` (`seeds/seed-demo.ts`, `seeds/demo-data.ts`): needs an existing Admin and `SEED_DEMO_PASSWORD` (validated by a new `loadDemoSeedEnv()`). Creates 2 Managers and 5 Employees (`@demo.test` emails, active, argon2) and about 14 tasks covering every status (2 to 3 overdue open ones, one no-review completed, one Admin-created without a Manager), a few comments, consistent history rows and `completed_at`. One transaction. Skips if the demo Managers already exist. No email is sent.
3. `DashboardModule` in `AppModule`, `seed:demo` script, `SEED_DEMO_PASSWORD` in `.env.example`, API README, this file.

**Decisions:** all active Managers listed even with zero tasks; demo password only from env; skip-if-present instead of reset (README explains manual removal). No new dependencies, migration, tsconfig or shared changes.

**Manual steps for me:** add `SEED_DEMO_PASSWORD` to `.env`; run `yarn workspace @task-app/api seed:demo` myself when done (my test rows are removed afterwards).

**Verification:** typecheck, build, `format:check`, no drift; seed run twice with a throwaway password (second run does nothing); dashboard numbers equal independent SQL counts, role checks 403/401, soft-deleted task not counted; all test rows removed.

## Update rules for Claude

- When I approve a checkpoint plan, write it under that checkpoint in Details: goal, steps, files, decisions, manual steps for me.
- When a checkpoint is finished, set its Status to `Done` in the Overview, fill in `Done` (short), note any deviation from the spec, set the next checkpoint to `Next`, and update "Last updated" and "Current checkpoint".
- Keep entries short. Do not edit the checkpoint list itself without asking.
- Do not mention these file updates in the final one-line reply.
