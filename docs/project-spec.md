# Task Management App - Project spec

Status: planning. This file is the source of truth for scope. If code and this spec disagree, or the spec is unclear, ask before coding.

## 1. Overview

A portfolio full-stack app for assigning and tracking tasks.

- Admin works in a **React admin panel** (web).
- Manager and Employee work in the **React Native mobile app**.
- Backend (NestJS) and database (PostgreSQL) run locally for now.
- Tested on a physical phone and a physical tablet.

## 2. Stack and repo layout

Yarn classic workspaces monorepo, no Turborepo.

```
apps/api       NestJS + TypeORM + PostgreSQL
apps/mobile    React Native CLI (Android first)
apps/admin     React + TypeScript (Vite recommended; confirm at checkpoint 4.1)
packages/shared  shared types: Role, TaskStatus, TaskPriority, response envelope
docs/          this spec, design brief
```

Project rules live in `CLAUDE.md` and `.claude/skills/` (nest-backend, rn-responsive-ui, web-responsive-motion, ui-design-quality).

## 3. Roles, clients and task people

| Role     | Client           | Notes                                        |
| -------- | ---------------- | -------------------------------------------- |
| Admin    | Admin panel only | Created by a seed script. Never an assignee. |
| Manager  | Mobile app       | Reviews tasks.                               |
| Employee | Mobile app       | Does the work.                               |

There are **no teams or reporting lines**. Managers and Employees are free members, and each task picks its own people:

- **One Manager** per task, who reviews it. Admin chooses the Manager. When a Manager creates a task, they become its Manager.
- **One or more Employees** (assignees) per task, who do the work.

Example: Admin creates a task and adds one Manager and two Employees. The Employees work on it and submit it for review, and that Manager approves or rejects it.

The backend enforces every rule below. Clients only hide UI that a role cannot use.

## 4. Permissions

| Action                         | Admin                                 | Manager                                           | Employee                   |
| ------------------------------ | ------------------------------------- | ------------------------------------------------- | -------------------------- |
| Create, edit, deactivate users | Yes                                   | No                                                | No                         |
| View users                     | All                                   | All Employees (to pick assignees), and self       | Self                       |
| Create task                    | Yes (picks the Manager and Employees) | Yes (becomes the task's Manager, picks Employees) | No                         |
| Set or change a task's Manager | Yes                                   | No                                                | No                         |
| Add or remove assignees        | Any task                              | Tasks they are Manager of                         | No                         |
| View tasks                     | All                                   | Tasks they are Manager of                         | Tasks they are assigned to |
| Start, submit, complete a task | No                                    | No                                                | Any assignee of that task  |
| Approve or reject              | Any task                              | Tasks they are Manager of                         | No                         |
| Edit or delete (soft) a task   | Any                                   | Tasks they are Manager of                         | No                         |
| Comment on a task              | Anyone who can view it                | Same                                              | Same                       |

Assignees must be Employees. A task's Manager must be a Manager.

## 5. Task workflow

Statuses: `TODO`, `WORKING`, `IN_REVIEW`, `COMPLETED`. The status belongs to the whole task, not to each assignee.

| Transition             | Who                      | Rule                               |
| ---------------------- | ------------------------ | ---------------------------------- |
| TODO to WORKING        | Any assignee             |                                    |
| WORKING to IN_REVIEW   | Any assignee             | Only if `requires_review` is true  |
| WORKING to COMPLETED   | Any assignee             | Only if `requires_review` is false |
| IN_REVIEW to COMPLETED | Task's Manager, or Admin | Approve                            |
| IN_REVIEW to WORKING   | Task's Manager, or Admin | Reject, comment required           |

All transitions are validated in the task service, never trusted from the client. Any other transition returns 409. Every transition is recorded in `task_status_history` with who did it, when, and the comment.

Task fields: `title` (required, max 120), `description` (optional, max 2000), `priority` (LOW, MEDIUM, HIGH; default MEDIUM), `due_date` (optional), `requires_review` (default true), `manager_id` (required), at least one assignee, `created_by`, `status`, `completed_at`, timestamps, `deleted_at`. There is no unassigned backlog in v1.

## 6. Users and auth

- A seed script creates the first Admin from env variables. Credentials are never committed.
- Admin creates a user with name, email (unique, case-insensitive) and role. The user starts as `invited` and becomes `active` after setting a password.
- **No passwords by email.** The invite email contains a one-time **setup link** (random 256-bit token, only its hash is stored, valid 48 hours, works once). The link opens a single page served by the API with a password and a confirm-password field. After saving, the user logs in to the mobile app with their email and that password. Admin can resend the invite, which invalidates the earlier link. `PUBLIC_BASE_URL` sets the link's host: `localhost` works on the same PC, and opening the link on a phone needs the PC's LAN IP (or the deployed URL later).
- Forgot password and reset use the same mechanism: the mobile app asks for the email, an email with a reset link (valid 1 hour, works once) follows, and the same kind of page sets the new password and revokes all sessions. The response never reveals whether an email exists.
- A user cannot be deactivated while they are on open tasks. The error lists those tasks so Admin can reassign them first. Admin cannot deactivate themselves or the last Admin. Deactivating blocks login and revokes tokens.
- Login uses email and password. Short-lived access token (about 15 minutes) plus a rotating refresh token, stored hashed and revoked on logout, password change or deactivation. Login is rate-limited.
- Global JWT guard with `@Public()` for open routes, plus a roles guard with `@Roles()`.
- Token storage: Android secure storage on mobile; admin panel storage is decided at checkpoint 4.1.

## 7. Emails

Sent after the request succeeds. A mail failure is logged and never breaks the request.

1. **Account created** to the new user: invite with the setup link. A second email of the same kind carries the **password reset** link after "Forgot password".
2. **Submitted for review** to the task's Manager, and to the task's creator if that is a different person (for example the Admin).
3. **Review result** (approved, or rejected with comment) to every assignee.

SMTP settings come from env variables (Gmail with an App Password); without them the API uses an Ethereal test mailbox and logs a preview URL. Templates are simple HTML with a plain-text fallback.

## 8. API (draft)

Prefix `/api/v1`. Response envelope and error shape follow the `nest-backend` skill.

- Auth: `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`, `/auth/change-password`; `GET /auth/me`.
- Account pages (HTML, public): `GET` and `POST /account/setup?token=...` and `/account/reset?token=...`. They replace the earlier `/auth/setup-account` and `/auth/reset-password` JSON routes.
- Users: `GET /users` (filter by role), `POST /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id` (deactivate), `POST /users/:id/resend-invite`.
- Tasks: `GET /tasks/summary` (role-scoped counts per status; tasks In Review also carry `submittedBy` and `submittedAt`), `GET /tasks` (role-scoped; filters for status, assignee, priority, due date; pagination), `POST /tasks` (title, description, priority, dueDate, requiresReview, assigneeIds, managerId for Admin only), `GET /tasks/:id`, `PATCH /tasks/:id` (including assigneeIds), `DELETE /tasks/:id`, `POST /tasks/:id/transition` (action: START, SUBMIT, COMPLETE, APPROVE, REJECT; comment required for REJECT).
- Comments: `GET /tasks/:id/comments`, `POST /tasks/:id/comments`.
- Dashboard (Admin): `GET /dashboard/summary`.

## 9. Data model (draft)

- `users`: id (uuid), name, email, password_hash (nullable until set), role, status (invited, active, deactivated), timestamps.
- `tasks`: fields in section 5.
- `task_assignees`: task_id, user_id, added_at (primary key on both ids).
- `task_comments`: id, task_id, author_id, body, created_at.
- `task_status_history`: id, task_id, from_status, to_status, actor_id, comment, created_at.
- `auth_tokens`: id, user_id, type (setup, reset), token_hash, expires_at, used_at, created_at.
- `refresh_tokens`: id, user_id, token_hash, expires_at, revoked_at.

All timestamps are `timestamptz` (UTC). Indexes: `users(lower(email))` unique, `tasks(manager_id, status)`, `tasks(created_by)`, `tasks(due_date)`, `task_assignees(user_id)`.

## 10. Clients

### Admin panel (React, Admin only)

- Login, layout shell.
- Dashboard: counts by status, overdue tasks, tasks per Manager.
- Users: list with search and filters, create, edit, deactivate, resend invite.
- Tasks: all tasks with filters, create (choose the Manager and Employees), edit, change Manager or assignees, delete, review, comments.
- Responsive from desktop down to phone width. Visual direction comes from `docs/design-brief.md`.

### Mobile app (React Native, Manager and Employee)

- Everyone: login, "Forgot password" (asks for the email only; setting a password happens on the web page from the email link), task list with status filter and pull-to-refresh, task detail with actions, comments and status history, profile with change password and logout.
- Employee: sees tasks they are assigned to, with Start, Submit, and Complete actions.
- Manager adds: create tasks and pick Employees, add or remove assignees, review queue (tasks in review where they are the Manager, with approve or reject).
- **Tablet:** tested on a physical tablet. On wide windows the task list sits on the left and the selected task's detail on the right; on phone, tapping a task opens a detail screen. Must work in portrait and landscape, handle safe areas, and keep the selection across rotation. Use window size classes, not device models (see `rn-responsive-ui`).
- **Dev connectivity:** for each connected device run `adb -s <serial> reverse tcp:3000 tcp:3000`, and set the API base URL to `http://localhost:3000` through config, never hardcoded. Debug builds may allow plain HTTP; release builds must not. A same-Wi-Fi LAN IP also works.

## 11. Security and quality

- Role and ownership checks happen on the server for every endpoint.
- Validation whitelist on all input; no stack traces or SQL in responses.
- CORS limited to the admin panel origin; login rate-limited.
- No secrets, tokens or passwords in logs or the repo; `.env.example` stays current.
- Migrations only, `synchronize` off.
- Every app has a README. The API has Swagger docs.
- No automated tests unless requested.

## 12. Later (out of scope for now)

Per-assignee progress and separate submissions, several Managers on one task, due-date reminders, push notifications, attachments, dark mode, reopening completed tasks, unassigned backlog, docker-compose, deployment, automated tests.

## 13. Build plan

Work one checkpoint at a time. After each, report `Checkpoint X.Y done. Proceed to X.Z (<name>)?` and wait.

**Phase 1: Foundation**

- 1.1 Monorepo skeleton: workspaces, `packages/shared`, root scripts, ESLint and Prettier baseline, `.gitignore`, `.env.example`
- 1.2 API scaffold: config validation, TypeORM connection, global pipe, filter and interceptor, response envelope
- 1.3 User entity, first migration, Admin seed script
- 1.4 Auth: login, refresh, logout, `/auth/me`, global JWT guard, roles guard

**Phase 2: Users and email**

- 2.1 Mail module and templates
- 2.2 Users module: Admin CRUD, deactivate with open-task check
- 2.3 Invite flow: setup link, resend, forgot and reset password

**Phase 3: Tasks**

- 3.1 Task, assignee, comment and status-history entities, migration
- 3.2 Task CRUD with one Manager and several Employees, and role scoping
- 3.3 Workflow transitions, review and reject, submitted and result emails
- 3.4 Dashboard summary endpoint

**Phase 4: Admin panel**

- 4.1 Scaffold: React and TypeScript, routing, API client, auth, design tokens from the brief
- 4.2 Login and layout shell
- 4.3 Users pages
- 4.4 Tasks pages: list, filter, create, assign, review
- 4.5 Dashboard

**Phase 5: Mobile**

- 5.1 Scaffold: navigation, theme tokens, API client, secure token storage, safe areas, window-size hook
- 5.2 Auth screens: login, forgot password
- 5.3 Task list and detail on phone, with actions, comments and history
- 5.4 Manager flows: create task, pick Employees, review queue
- 5.5 Tablet split-pane layout and rotation checks on the real phone and tablet
- 5.6 Profile, loading, empty and error states, animations

**Phase 6: Polish**

- 6.1 READMEs, Swagger, screenshots
- 6.2 Security checklist pass
- 6.3 Final check on phone and tablet

## 14. Decisions to make during the build

- Admin panel bundler (Vite recommended) and token storage (checkpoint 4.1)
- Secure storage library and navigation library for mobile (checkpoint 5.1)
- Mail library for the API (checkpoint 2.1)
