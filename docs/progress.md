# Progress

Tracks the build plan in `docs/project-spec.md` section 13. Claude updates this file as checkpoints are planned and finished.

**Last updated:** 2026-11-01
**Current checkpoint:** 5.3 - Task list and detail on phone (next)

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

| #   | Checkpoint                                                               | Status |
| --- | ------------------------------------------------------------------------ | ------ |
| 4.1 | Scaffold: React and TypeScript, routing, API client, auth, design tokens | Done   |
| 4.2 | Login and layout shell                                                   | Done   |
| 4.3 | Users pages                                                              | Done   |
| 4.4 | Tasks pages: list, filter, create, assign, review                        | Done   |
| 4.5 | Dashboard                                                                | Done   |

### Phase 5: Mobile

| #   | Checkpoint                                                                       | Status  |
| --- | -------------------------------------------------------------------------------- | ------- |
| 5.1 | Scaffold: navigation, theme tokens, API client, secure storage, safe areas, hook | Done    |
| 5.2 | Auth screens: login, set up account, reset password                              | Done    |
| 5.3 | Task list and detail on phone, with actions, comments and history                | Next    |
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
- Mobile 5.3 history read endpoint: already built in 4.4 (`GET /tasks/:id/history`).
- Mobile API additions agreed in the 5.1 design review (spec section 8 to be updated when each lands): role-scoped status counts endpoint (5.3), `submittedBy` and `submittedAt` on In Review tasks (5.4), `POST /auth/change-password` that revokes all sessions and returns a fresh token pair for the current device (5.6). No `openTaskCount` on users.
- Mobile design decisions from the review: Manager gets Edit and Delete on their tasks (like the admin panel, no Manager field); due date optional; reject reason in history only; greeting "Hello,"; split pane starts at 900 wide (brief overrides the skill's 840); `react-native-reanimated` is the animation library; package id `com.tasklane`. Details in `docs/design-brief.md` Mobile app section.
- Admin panel 4.3 activates and deactivates users with `PATCH /users/:id` and `status`.
- Spec sections 7 and 14 and the 2.1 checklist label still say Mailpit (dropped for Gmail plus Ethereal). Left unchanged until I say so.

## Details

Finished checkpoints are kept short: goal, what was done, deviations. Plans are written here when a checkpoint is approved.

### 1.1 Monorepo skeleton - Done

Yarn classic workspaces `apps/*` and `packages/*`, shared package `@task-app/shared`, root scripts (`format`, `format:check`, `build:shared`, `dev:api`, `dev:admin`, `dev:mobile`), `.gitignore`, `.env.example`, root Prettier. App-level Prettier configs from generators are deleted so every app uses the root `.prettierrc`.

### 1.2 API scaffold - Done

Hand-written NestJS app in `apps/api`: Joi config validation, TypeORM connection (`synchronize: false`, `database/data-source.ts` for the CLI), global validation pipe, exception filter, response envelope (`ApiResponse` / `ApiError` in shared), prefix `api`, URI version `v1`, `GET /health`. Versions are newer than usual (Nest 12, TypeORM 1.1). `yarn add` of `@nestjs/cli` nests TypeScript 6; the repo uses 5.9.3, so run `yarn install` again when `tsc` relinks. No ESLint config in the API.

### 1.3 User entity, migration, Admin seed - Done

`User` entity (enums `user_role`, `user_status`, unique index on `lower(email)`), migration `CreateUsers`, `seed:admin` (idempotent, argon2id; needs `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`). `migration:*` scripts replaced the broken `typeorm` script.

### 1.4 Auth - Done

`@nestjs/jwt` and `@nestjs/throttler`, no passport. Global guards in order: throttler, JWT (private by default, `@Public()` opts out, loads the user and rejects non-active), roles (`@Roles()`). `POST /auth/login` (5/min, one generic 401), `/auth/refresh` (rotating opaque token stored as SHA-256; reuse revokes all of the user's tokens), `/auth/logout`, `GET /auth/me`. Config: `JWT_ACCESS_SECRET` (min 32), `JWT_ACCESS_TTL` (15m), `REFRESH_TTL_DAYS` (7). One `RefreshTokenDto` for refresh and logout; `/auth/me` returns `UserResponseDto`.

### 2.1 Mail module - Done

`MailService.send(to, { subject, html, text })` never throws and returns a boolean; `nodemailer`; SMTP env optional (without `SMTP_HOST` it uses Ethereal and logs a preview URL). Templates in `modules/mail/templates/`. Mailpit dropped for Gmail plus Ethereal (the API README has the Gmail App Password steps). A real Gmail send is not verified yet (see Open items).

### 2.2 Users module - Done

Admin create, edit, list, deactivate and reactivate (`PATCH /users/:id` with `status`; `DELETE` calls the same path), role-scoped reads (Admin all, Manager Employees and self, Employee self). Deactivation is blocked for yourself, the last Admin and users on open tasks (409 lists the tasks) and revokes all refresh tokens in one transaction. Admin accounts cannot be created, promoted or demoted through the API. `RefreshTokensService` was extracted from auth (owns `revokeAllForUser`); `common/dto/pagination-query.dto.ts` added.

### 2.3 Invite and reset by email link - Done

Reverses spec section 6 (no setup code): emails carry a one-time link (256-bit token, SHA-256 stored in `auth_tokens`; invite 48 h, reset 1 h, single use). The link opens an HTML page served by the API (`GET` and `POST /account/setup` and `/account/reset`, plain form, strict CSP, `no-store`). `POST /users/:id/resend-invite`, `POST /auth/forgot-password` (3/min, always 200, 60 s cooldown). Optional `PUBLIC_BASE_URL`. The page is plain because the design brief was empty at the time.

### 3.1 Task entities - Done

`tasks`, `task_assignees`, `task_comments`, `task_status_history` with migration `CreateTasks`. Deviation: `tasks.manager_id` is nullable (an Admin can own a task with no Manager), which changes spec section 5. The generated migration declared the `task_status` enum twice; the duplicate was removed by hand.

### 3.2 Task CRUD and role scoping - Done

`GET/POST /tasks`, `GET/PATCH/DELETE /tasks/:id` with role scoping, one nullable Manager, several Employees, soft delete, and the real open-task check in `UsersService`. The "added to task" email was dropped by decision (spec section 7 item 2 and this label still mention it; `addedToTaskEmail` stays unused).

### 3.3 Workflow, review, comments, emails - Done

`TaskAction` (START, SUBMIT, COMPLETE, APPROVE, REJECT) in shared; `POST /tasks/:id/transition` with row lock and history rows; Admin can review a task with no Manager. Emails after commit: submitted (to the Manager, and the creator if an Admin) and review result (to every assignee). Comments at `/tasks/:taskId/comments` (paginated, oldest first, no edit or delete).

### 3.4 Dashboard summary and demo seed - Done

`GET /dashboard/summary` (Admin only): totals, overdue (count plus 10 oldest), per-Manager rows (including idle Managers and a "no Manager" row). `yarn seed:demo` creates 2 Managers, 5 Employees (`@demo.test`) and about 14 tasks; needs `SEED_DEMO_PASSWORD`; skips if the demo Managers exist. The dev database has no demo data until I run it.

### 4.1 Admin scaffold - Done

`apps/admin` with Vite 8, React 19, react-router 8, TanStack Query; API client with single-flight refresh and one retry; access token in memory, refresh token in `sessionStorage`; non-Admin login rejected; dev proxy (`VITE_API_PROXY_TARGET` lives in `apps/admin/.env.example`). Design tokens were deferred to 4.2.

### 4.2 Login and layout shell - Done

Tokens from the brief (`styles/tokens.css`), Plus Jakarta Sans, designed login, sidebar and top bar shell with profile menu, page fade, skip link. "Forgot password?" and "Change password" are left out until their endpoints are used. A second dev Admin `admin@gmail.com` was inserted once because `seed:admin` skips when an Admin exists.

### 4.3 Users pages - Done

Users list with search, Role and Status filters, paging (8 per page), create and edit drawer, resend invite, deactivate dialog (a 409 turns into a list of blocking tasks), reactivate. Shared components built here: toast, drawer, modal (native `<dialog>`), select field, pagination, skeleton, badges, row menu. Not built: Open tasks, Last active and sorting (the API has no such fields). Test user `check.person@example.test` exists in the dev database.

### 4.4 Tasks pages - Done

List with filters and paging, create and edit drawer, detail drawer (people, comments, history), Approve, Reject (reason required), delete. API addition: `GET /tasks/:id/history` (paginated, oldest first, same visibility as the task). The selected task lives in `?task=<id>`; `status`, `priority` and `managerId` presets are read from the URL. Test data in the dev database: users `maya.employee@example.test` and `noah.employee@example.test`, 8 open tasks and 1 completed.

### 4.5 Dashboard - Done

Four status tiles (count-up, link to Tasks), overdue list (5 of the 10), tasks per Manager (stacked bars, link by `managerId`), recent activity feed. API addition: `recentActivity` (latest 8 status changes) in the summary. `PageHeader` got an optional `action` slot. Two more open test tasks with past due dates exist for `check.person@example.test`.

### 5.1 Mobile scaffold - Done

`apps/mobile` (React Native 0.88 CLI, Android first, package `com.tasklane`) with React Navigation native stack, theme tokens (`src/theme/`), Plus Jakarta Sans per weight, `useWindowClass()` (600 and 900 breakpoints), API client (port of the admin one), Keychain token store (refresh token in the Android Keystore), Reanimated, adaptive launcher icon, `Logo`, `AppText`, `AppButton`, `Wash`. Cleartext HTTP is debug only; release has no default API URL.

**Notes:** `metro.config.js` forces one `react` copy (admin needs ^19.3.1, React Native pins 19.3.0; two copies crashed hooks). `tsconfig.json` has `types: []` (approved) because Jest was removed. The debug API URL is the PC's LAN IP (`10.186.105.165`) in `src/config/app-config.ts`. Context7 was down, so docs came from the official sites. `adb shell input` is blocked on the phone, so I check flows by hand.

### 5.2 Mobile auth screens - Done

`src/api/auth.ts`, `AuthProvider` and `useAuth()` (`loading | signedOut | signedIn`, session restored from the stored refresh token, Admin rejected with "Admin accounts sign in on the admin panel."), `Login` and `ForgotPassword` screens on a shared `AuthLayout` (lavender wash, safe areas, `KeyboardAvoidingView`, centred 480px card from 600 wide), `TextField`, `TextButton`, `Banner`, `BackButton`, `Entrance`, loading state on `AppButton`. `Home` stays a placeholder with a temporary Log out until 5.6.

**Deviations:** the Forgot password screen is my design (no mock). **Confirmed by me:** wrong email or password, Admin rejected, Manager and Employee sign in. **Not checked yet:** session after reopen, Log out, forgot-password success and 429, keyboard, 130% font scale, rotation, tablet.

## Update rules for Claude

- When I approve a checkpoint plan, write it under that checkpoint in Details: goal, steps, files, decisions, manual steps for me.
- When a checkpoint is finished, set its Status to `Done` in the Overview, fill in `Done` (short), note any deviation from the spec, set the next checkpoint to `Next`, and update "Last updated" and "Current checkpoint".
- Keep entries short. Do not edit the checkpoint list itself without asking.
- Do not mention these file updates in the final one-line reply.
