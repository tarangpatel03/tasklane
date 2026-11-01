# Progress

Tracks the build plan in `docs/project-spec.md` section 13. Claude updates this file as checkpoints are planned and finished.

**Last updated:** 2026-11-01
**Current checkpoint:** 6.2 - Security checklist pass (next)

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

| #   | Checkpoint                                                                       | Status |
| --- | -------------------------------------------------------------------------------- | ------ |
| 5.1 | Scaffold: navigation, theme tokens, API client, secure storage, safe areas, hook | Done   |
| 5.2 | Auth screens: login, set up account, reset password                              | Done   |
| 5.3 | Task list and detail on phone, with actions, comments and history                | Done   |
| 5.4 | Manager flows: create task, pick Employees, review queue                         | Done   |
| 5.5 | Tablet split-pane layout and rotation checks on the real phone and tablet        | Done   |
| 5.6 | Profile, loading, empty and error states, animations                             | Done   |

### Phase 6: Polish

| #   | Checkpoint                                      | Status  |
| --- | ----------------------------------------------- | ------- |
| 6.1 | READMEs, Swagger, screenshots, demo walkthrough | Done    |
| 6.2 | Security checklist pass                         | Next    |
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

### 5.3 Task list and detail on phone - Done

**Goal:** replace the placeholder `HomeScreen` with a Tasks screen and a Task detail screen for Manager and Employee on a phone. Bottom nav and Manager Edit/Delete are not in 5.3 (both move to 5.4). The temporary Log out stays on the Tasks screen until 5.6. Medium and expanded widths show the phone layout in a centred max width until 5.5.

**Steps:**

1. API: `GET /tasks/summary` (role-scoped counts for all four statuses, zero-filled). `TasksService.summary` reuses `scopedQuery`; new `TaskSummaryDto`; route declared above `GET /tasks/:id`. Update spec section 8 and the API README if it lists task routes.
2. Mobile data layer `src/api/tasks.ts`: types, list (status filter, 20 per page), summary, get, comments (list, create), history, transition. TanStack Query: `useInfiniteQuery` for the list, `useQuery` for the rest, `useMutation` for transition and comment; a transition invalidates task, list, summary and history. Add `QueryClientProvider` to `App.tsx` only if missing.
3. Components (tokens only): StatusIcon, PriorityIcon (react-native-svg), StatusBadge, PriorityTag, Avatar, AvatarStack, SummaryTile, FilterChip, TaskCard, Skeleton, EmptyState, Snackbar, BottomSheet (Modal + Reanimated, PanResponder swipe-down, no gesture-handler), CommentComposer, HistoryTimeline, due-date and relative-date helpers.
4. `tasks-screen.tsx`: wash header with greeting, role pill and refresh button; 2 x 2 tiles with count-up and active ring; filter chips; stagger list; pull to refresh with skeletons; paging; empty and error states.
5. `task-detail-screen.tsx`: header, Description, People, Comments with composer, Status history (newest first, reversed on the client); pinned actions by role and status; Reject sheet (reason goes to history only); snackbars. The API stays the authority on 403/409.
6. Navigation: `Home` becomes `Tasks` plus `TaskDetail: { taskId }`; `home-screen.tsx` removed.
7. Docs: mobile README if it lists screens; this file.

**Done:** `GET /tasks/summary` (API, spec section 8 and API README updated); `src/api/tasks.ts`; Tasks and Task detail screens; task components; `Home` replaced by `Tasks` and `TaskDetail`. Typecheck (mobile, API) and Prettier pass. Not run on the phone.

**Deviations:** `BottomSheet` closes with `scheduleOnRN` from `react-native-worklets` (already installed) because `runOnJS` is deprecated. Comments and history load one page of 100. Detail hides the action bar while the keyboard is open. Not checked on a device: everything in the list above.

**Decisions:** no new dependencies, no tsconfig change. Existing typecheck errors in `text-field.tsx` and `login-screen.tsx` (from 5.2) are reported, not fixed, unless I say so.

**Manual steps for me:** restart the API; get a Manager and Employees with tasks in every status (`yarn seed:demo` with `SEED_DEMO_PASSWORD`, or the existing test Employees plus a Manager made in the admin panel); rebuild the app if Metro reload is not enough.

**I will check on the phone:** both roles log in; tile and chip counts match the list; filters; pull to refresh; open and go back; Start, Submit, Reject with reason, Submit, Approve; Complete on a no-review task; comments; history order; overdue text; empty state; 130% font scale; 320 and 430 wide; rotation keeps the open task.

### 5.4 Manager flows - Done

**Goal:** a Manager can create, edit and delete tasks, pick Employees, and work a review queue on the phone. The floating bottom nav and Manager Edit/Delete moved here from 5.3. Medium and expanded widths keep the phone layout until 5.5.

**Decisions:** add `@react-native-community/datetimepicker` (native rebuild needed). Bottom nav is Tasks and Review (Managers only, red count badge); Employees get no nav until Profile arrives in 5.6. API adds `submittedBy` and `submittedAt` on In Review tasks. Manager has no Manager field in the form.

**Steps:**

1. API: `TasksService` sets transient `submittedBy`/`submittedAt` from the latest `task_status_history` row to IN_REVIEW (in `list` and `loadOrFail`); `TaskResponseDto` exposes them (null unless In Review). Update spec section 8 and the API README.
2. Mobile data: `tasks.ts` gets the new fields plus `createTask`, `updateTask` (changed fields only, `dueDate: null` clears), `deleteTask`; new `users.ts` with `fetchEmployees` (`GET /users?role=EMPLOYEE&limit=100`, deactivated filtered out).
3. Plumbing: `SnackbarProvider` at the app root so messages survive navigation; `useTransitionTask()` hook and `RejectSheet` extracted from the detail screen and reused by Review.
4. Navigation: routes `Review` and `TaskForm: { taskId? }`; `BottomNav` (switches with `navigation.replace`, fade) and `NewTaskButton` on Tasks and Review for Managers; extra list bottom padding.
5. `task-form-screen.tsx`: Title, Description, Priority tiles, optional Due date with clear, Requires review switch, Employee rows with "n selected"; footer "Add a title and an Employee" until valid, then "Create task" / "Save changes" (edit: disabled until changed, prefilled, no Manager field); success overlay on create, "Task updated" snackbar on edit.
6. Detail: for the task's Manager, "Edit" pill and "Delete" icon button; Delete sheet, then go back with "Task deleted".
7. `review-screen.tsx`: header with waiting count, IN_REVIEW list (API-scoped to the Manager), cards with "Submitted by", Reject (sheet) and Approve; handled card collapses with a snackbar; empty state "Nothing in review".
8. Docs: mobile README, this file.

**Done:** all eight steps. Typecheck (mobile, API) and Prettier pass. Not run on the phone. `datetimepicker` 9.2.2 added (docs checked with Context7). A picked due date is stored as the end of that day (local time).

**Deviations:** `NewTaskButton` is rendered by `ManagerNav` (in `bottom-nav.tsx`) together with the nav, so screens add one component. The review queue uses a `ScrollView` with a "Show more" button instead of a `FlatList`, because Reanimated exit animations do not run for `FlatList` cells. `TextField` got a `multiline` style for the Description field. Spec section 8 now mentions `submittedBy`/`submittedAt`.

**Manual steps for me:** `yarn install` at the root, rebuild and reinstall the app (`yarn android`); restart the API; use a Manager with Employees and a task In Review (`yarn seed:demo` or the admin panel).

**I will check on the phone:** create (validation, disabled text, priority, due date set and cleared, review switch, Employees, overlay); the Employee sees it; edit and delete as Manager; Employee submits, it shows in Review with "Submitted by" and the badge count; Approve and Reject from the card; empty state; no nav for an Employee; 130% font scale, 320 and 430 wide, keyboard on the form, rotation.

### 5.5 Tablet split-pane layout - Done

**Goal:** tablet layouts from the design brief and a selected task that survives rotation, fold and resize. Window classes unchanged (compact < 600, medium 600-899, expanded >= 900). No native change, no new dependency, no API change.

**By size class:** Tasks - medium: tiles in one row of four, cards in 2 columns, nav 480, margin 40, a card opens a 560px side sheet; expanded: 420px list pane (nav 388 and New task inside it) plus detail pane, first task preselected, selected card highlighted. Review - medium: single pane; expanded: 420px queue plus detail pane with the brief's empty texts. Task detail - side sheet (medium) or right pane (expanded: two columns, 104px action bar). Task form - centred modal on medium and expanded, full screen on compact.

**Steps:**

1. `useWindowClass()` returns `margin` (20, 16 below 360, 40 medium, 24 expanded list pane); `AuthLayout`, screens and `NewTaskButton` use it.
2. Split `task-detail-screen.tsx` into `TaskDetailView` (variants `screen`, `sheet`, `pane`) plus a thin `TaskDetailScreen`; the data hook moves with it.
3. `ListDetail` layout (420 list pane with right border, detail pane `#FBFAFF`), panes resize over 450ms. Selection (`selectedId`, `sheetOpen`) lives in the Tasks and Review screens; expanded auto-selects the first task only when nothing is selected; the selection is cleared on delete; Review drops a selection that left the queue. A `TaskDetail` screen on the stack pops back to the list with the task selected if the window becomes expanded. Detail swap: 300ms fade and 24px slide.
4. Tasks screen: `numColumns` 2 on medium (FlatList keyed per column count), `ManagerNav` rendered inside the list pane, `TaskCard` gets `selected`.
5. Review screen: expanded split with highlighted card; card buttons never change the selection.
6. `SideSheet` as an absolute overlay (not a `Modal`, so the snackbar stays visible), scrim, 450ms emphasized, round close button, Android back closes it.
7. `TaskForm` route uses `transparentModal` with a fade; the screen itself draws full screen (compact) or scrim plus centred card (medium, expanded).
8. Login and Forgot password only switch to the hook margin.
9. Docs: mobile README, this file.

**Done:** all nine steps. Typecheck passes and Prettier is clean on `src`. Not run on the phone or tablet.

**Deviations:** the 450ms pane resize on rotation was left out (the split layout mounts and unmounts with the window class, so there is nothing to resize); the detail pane uses two columns only when it is at least 700 wide (a 900 wide window gives a 480 pane, too narrow for two columns); on medium a Review card tap opens the side sheet like on Tasks; `TaskDetail` pushed on the stack goes back to the list when the window becomes expanded.

**Manual steps for me:** Metro reload is enough; a Manager with tasks in every status (a few In Review) and an Employee (`yarn seed:demo`); auto-rotate on both devices; tablet multi-window for resize checks.

**I will check:** phone behaviour unchanged and rotation keeps the open task; tablet portrait (four tiles, two-column cards, side sheet with scrim and back button, actions and snackbar inside it, Create/Edit modal, Review single pane); tablet landscape (list plus detail panes, preselected first task, highlight, two-column detail with 104px bar, nav and New task inside the list pane, Review queue and its empty texts); rotating with a selection keeps selection and filter; 130% font scale; nothing under the system bars.

### 5.6 Profile, states and animations - Done

**Goal:** Profile with change password and Log out, a nav for every role, better loading, empty and error states, and the brief's motions that are still missing. No new dependency, no tsconfig change, no database change.

**Decisions:** nav is Tasks, Review (Managers, red badge) and Profile (everyone); `POST /auth/change-password` revokes all sessions and returns a fresh token pair for the current device; the temporary Log out moves into Profile.

**Steps:**

1. API: `ChangePasswordDto` (new password 8-128), `AuthService.changePassword` (argon2 verify, then in one transaction set the password, `revokeAllForUser`, `issueTokens`), `POST /auth/change-password` (200, throttled 5 per minute). A wrong current password or an unchanged password is a 400 with a `currentPassword` detail, never 401 (the mobile client treats 401 as an expired session). API README updated.
2. Mobile Profile: route `Profile`; wash header (radius 40), 96px avatar with 4px ring (`Avatar` `ringWidth`), name, role pill, Name/Email/Role rows, 64px Change password row, outlined Log out. `ChangePasswordSheet` with three fields, client-side mismatch message, API error banner; on success store the returned tokens and show "Password updated". Column max 640 on medium and expanded.
3. `ManagerNav` becomes `BottomNav`: Profile item for everyone, Review for Managers, New task button for Managers on Tasks and Review; pane placement passed as `inPane`; smaller `NAV_CLEARANCE` without the New task button. Remove the Log out footer from the Tasks screen.
4. Loading: `Splash` while tokens load and the session is restored; detail skeleton instead of a spinner; inline retry when comments or history fail to load.
5. Empty and error: `EmptyState` tile sizes (80 Tasks, 96 Review); `ErrorBoundary` around the navigator as a crash safety net.
6. Motion: press scale on chips, tiles and nav items; `StatusBadge` tint cross-fade over 300ms; Profile `Entrance` stagger; reduced motion fallbacks. The 450ms pane resize stays out.
7. Docs: mobile README, API README, this file.

**Done:** all seven steps. `yarn typecheck` (mobile, API) and Prettier pass. Not run on a device, and `POST /auth/change-password` was not called against a running API (I cannot read `.env` credentials).

**Deviations:** a small `usePressScale` hook was added for the new press feedback; `NAV_CLEARANCE` is now an object (`withButton`, `navOnly`); the "Your password was changed" case needs no extra screen. Spec section 8 already listed the route.

**Follow-up after testing (approved):** switching Tasks, Review and Profile lagged on the landscape tablet because each tab was a separate stack screen rebuilt on every switch. Added `@react-navigation/bottom-tabs` (JS only): `Main` tab navigator with the floating nav as its tab bar, tabs stay mounted, the pill and the nav position animate, `TaskDetail` carries `from` so a window growing to the split layout returns to the right tab, "Back to review queue" uses `popTo('Main', { screen: 'Review' })`.

**Manual steps for me:** restart the API; Metro reload is enough; use a throwaway account for the password test.

**Notes:** other devices keep working until their 15-minute access token expires (the JWT guard does not check revocation); only refresh is cut at once, as with the reset flow.

**I will check:** Profile for Manager and Employee, nav items per role, Log out; change password (mismatch, wrong current, success, old password rejected, new works, keyboard, 130% font); splash on launch, airplane-mode errors with Retry; empty states; press feedback, badge tint fade, reduced motion; tablet Profile and unchanged Tasks and Review.

### 6.1 READMEs, Swagger, screenshots, demo walkthrough - Done

**Goal:** meet spec section 11 ("Every app has a README. The API has Swagger docs."). No feature, database or tsconfig change.

**Decisions:** add `@nestjs/swagger` with the Nest CLI plugin; admin screenshots by Claude (Chrome DevTools), mobile screenshots supplied by me; root README rewritten, the starter-pack text moves to `docs/claude-setup.md`.

**Steps:**

1. Swagger: check `@nestjs/swagger` supports Nest 12 first (stop and ask if not); add it to the API; `nest-cli.json` plugin with `introspectComments`; `main.ts` `DocumentBuilder` with bearer auth at `/api/docs`, not served when `NODE_ENV=production`; `@ApiTags`, `@ApiBearerAuth` (not on public routes) and `@ApiOperation` on controllers; `account-pages` excluded. The response envelope is documented once in the description and the API README, not on every type.
2. Root `README.md` rewritten as the project README (overview, roles, stack, layout, quick start, Swagger URL, links, screenshots); old text moved unchanged to `docs/claude-setup.md`.
3. Fix drift in the app READMEs: API (Swagger section, stale "stub until tasks exist" line), Admin and Mobile (screenshot links), `packages/shared/README.md` (list the real exports).
4. `docs/demo-walkthrough.md`: setup commands, demo logins, scripted Admin, Manager and Employee tour including tablet and email links.
5. Screenshots in `docs/screenshots/`: admin captured by Claude (1440 and narrow); mobile (phone Tasks, Task detail, Review, Profile, Create task; tablet landscape split pane) supplied by me in `docs/screenshots/mobile/`. Links are written now.
6. This file.

**Done:** all six steps. `@nestjs/swagger` 12.0.5 with the CLI plugin; `/api/docs` serves 17 paths and returns 404 with `NODE_ENV=production` (checked on ports 3001 and 3002, both stopped). API typecheck, build and Prettier pass. Root `README.md` is now the project README (old text in `docs/claude-setup.md`); `docs/demo-walkthrough.md` added; API, Admin, Mobile and shared READMEs updated (the "stub until tasks exist" line removed).

**Deviations:** a first `yarn add` failed on a locked Gradle file and left `node_modules` half linked; fixed with `yarn install` after Gradle stopped, then a second `yarn install` to put `tsc` back to 5.9.3. The five admin screenshots in `docs/screenshots/admin/` were taken from the current dev database, which has test data (junk titles such as "x" and "Yttg") and real Gmail addresses on the Users page. They are placeholders: run `seed:demo` on a clean database and retake them before publishing. Mobile screenshots are still missing (links already written).

**Still for me:** take the six mobile screenshots (`tasks`, `task-detail`, `review`, `profile`, `create-task`, `tablet-split` as `.png` in `docs/screenshots/mobile/`); retake the admin ones on demo data; the demo walkthrough was not run end to end.

**Original manual steps:** `yarn install` at the root; Postgres up, `migration:run`, `seed:admin`, `seed:demo` (needs `SEED_DEMO_PASSWORD`); start `yarn dev:api` and `yarn dev:admin` before admin screenshots; take the mobile screenshots; no commit unless I ask.

**Verification:** API typecheck and build pass; `/api/docs` loads, Authorize and `GET /tasks` work, absent in production; every README command and link checked.

**Risks:** Swagger support for Nest 12; plugin vs pinned TypeScript 5.9.3 (report, do not change tsconfig); mobile screenshots depend on me.

### 6.2 Security checklist pass - Next

**Goal:** check spec section 11 against the code and fix small gaps (about 10 lines each); larger ones are listed as risks. Survey found no CORS (`ADMIN_CORS_ORIGIN` is validated but unused) and no helmet.

**Decisions:** add CORS and `helmet` (new dependency); fix small gaps, report big ones; screenshot set is 4 admin (no login), 4 mobile (no login), 1 tablet.

**Steps:**

1. `main.ts`: `enableCors` limited to `ADMIN_CORS_ORIGIN` (Authorization and Content-Type headers), `helmet` defaults with the CSP relaxed only for Swagger outside production; confirm the account pages keep their own CSP; update the Admin README CORS line and the `.env.example` comment.
2. Audit, one line each in this file: role and ownership checks on every endpoint; validation whitelist and `ParseUUIDPipe`; no stack or SQL in errors; rate limits and the 429 envelope; no secrets in logs, mail or the repo; migrations only; demo seed matches the spec; `yarn audit` (report only). Run on a test instance on port 3001, never on the user's API on 3000.
3. Small fixes: `Referrer-Policy: no-referrer` on the account pages, pin JWT `algorithms: ['HS256']`, anything else under about 10 lines.
4. Report-only risks: access tokens live up to 15 minutes after a password change or reset; release builds use the debug keystore and have no release API URL; admin refresh token in `sessionStorage`; no HTTPS or `trust proxy` setup.
5. Screenshot cleanup: delete `docs/screenshots/admin/login.png`; drop `create-task.png` and the login link from the READMEs and the walkthrough. Final set: admin `dashboard`, `users`, `tasks`, `task-detail`; mobile `tasks`, `task-detail`, `review`, `profile`; tablet `tablet-split`.
6. Docs: API README, this file (6.3 becomes Next).

**Manual steps for me:** stop Gradle if `yarn add helmet` hits the locked file, then `yarn install` at the root; restart the API on 3000 and keep `ADMIN_CORS_ORIGIN` equal to the admin origin; take the mobile and tablet screenshots and retake the admin ones on demo data; no commit unless I ask.

**Verification:** API typecheck, build and Prettier pass; on port 3001 the allowed origin gets the CORS header and `http://evil.test` does not, helmet headers are present, `/api/docs` renders, the account page keeps its CSP and gains Referrer-Policy, 401, 403, 404 and 429 behave; admin login and mobile login still work.

**Risks:** helmet CSP can break Swagger UI; installing a dependency can relink `tsc` to TS 6 or hit the Gradle lock.

## Update rules for Claude

- When I approve a checkpoint plan, write it under that checkpoint in Details: goal, steps, files, decisions, manual steps for me.
- When a checkpoint is finished, set its Status to `Done` in the Overview, fill in `Done` (short), note any deviation from the spec, set the next checkpoint to `Next`, and update "Last updated" and "Current checkpoint".
- Keep entries short. Do not edit the checkpoint list itself without asking.
- Do not mention these file updates in the final one-line reply.
