# IMPROVEMENT_TRACKER

Temporary working document. Edit it freely: your version wins, and I re-read it before every step.

**Status:** All checkpoints (1.1 to 4.1) done. Static validation passes (section 8). Waiting for your review and the manual checks listed in section 11.
**Last updated:** 2026-11-02

## 1. Audit findings

### 1.1 Repo

- Yarn Classic workspaces: `apps/api`, `apps/admin`, `apps/mobile`, `packages/shared`. Root scripts: `format`, `format:check`, `build:shared`, `dev:*`. Each app has `typecheck`. No tests (as required).
- Docs: root `README.md`, `apps/{api,admin,mobile}/README.md`, `packages/shared/README.md`, `docs/project-spec.md` (still says "Status: planning", with a draft API and data model), `docs/design-brief.md`.
- No ESLint config or lint script exists in any app (CLAUDE.md mentions an ESLint hook). Available static checks: `tsc` typecheck, Vite build, Prettier.
- Admin: duplicated `readError` (TaskDrawer, UserDrawer); repeated error block and page-size/filter-reset logic in Tasks and Users pages; three `as unknown as` casts in `api/client.api.ts` without a reason comment. Noted only, out of scope unless you ask.
- Mobile README names a stale path (`src/components/BottomNav.tsx`; real: `components/navigation/BottomNav.tsx`).

### 1.2 Screens and pages (none is in its own folder today)

Admin pages (`apps/admin/src/pages`). Everything in `features/*` is used by exactly one page.

| Page          | Lines | Page-specific files today (`features/…`)                                                             |
| ------------- | ----- | ---------------------------------------------------------------------------------------------------- |
| DashboardPage | 55    | ManagerWorkload, OverdueList, Panel, RecentActivity, StatusTiles, useDashboard                       |
| TasksPage     | 211   | PersonPicker, TaskDetail, TaskDialogs, TaskDrawer, TasksList, TasksToolbar, taskUtils.util, useTasks |
| UsersPage     | 171   | DeactivateDialog, UserDrawer, UsersList, UsersToolbar, useUsers                                      |
| LoginPage     | 109   | none                                                                                                 |
| NotFoundPage  | 19    | none                                                                                                 |

Each page and feature component has a paired `.module.css` that moves with it. Only importer of pages: `app/router.tsx`.

Mobile screens (`apps/mobile/src/screens`):

| Screen               | Lines | Notes                                                                                                                           |
| -------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| TaskDetailView       | 743   | Not a screen. Variants `screen`/`sheet`/`pane`. Used by TasksScreen, ReviewScreen, TaskDetailScreen. 5 local helper components. |
| TaskFormScreen       | 473   | Local Section, date picker, form helpers. EmployeeRow, PriorityPicker, SwitchRow are used only here.                            |
| TasksScreen          | 413   | Only FlatList in the app. TaskCard, SummaryTile, FilterChip are used only here.                                                 |
| ReviewScreen         | 282   | ReviewCard used only here.                                                                                                      |
| ProfileScreen        | 222   | Local InfoRow. ChangePasswordSheet used only here.                                                                              |
| LoginScreen          | 121   |                                                                                                                                 |
| ForgotPasswordScreen | 102   |                                                                                                                                 |
| TaskDetailScreen     | 44    | Thin wrapper around TaskDetailView.                                                                                             |

Importers of screens: `navigation/RootNavigator.tsx`, `navigation/MainTabs.tsx`, and the `./TaskDetailView` imports in the Tasks, Review and TaskDetail screens. `App.tsx` imports none.

Stay shared in `components/`: brand/\*, buttons/\*, Banner, EmptyState, Skeleton, Snackbar, Entrance, Wash, ListDetail, SideSheet, RejectSheet, BottomSheet, AuthLayout, StatusBadge, PriorityTag, StatusIcon, PriorityIcon, BottomNav, TextField, AppButton.

Conventions seen: PascalCase components, `SCREENS`/`PATHS` constants, no barrels, no `any`, no `@ts-*`. Existing code uses `function` declarations (rule: do not convert unless asked).

### 1.3 Backend

- **Logging:** Nest `Logger` only, default text output. No request log, no correlation id, no JSON output, no redaction layer. Mail service logs the subject only (plus the Ethereal preview URL in dev). Nothing sensitive is logged today.
- **Rate limiting:** `@nestjs/throttler` is already installed and global (100/min, `app.module.ts:30`, runs first). Per-route limits per minute: login 5, refresh 10, forgot-password 3, change-password 5, account pages 10 (all hardcoded). Gaps: not env-configurable, no `trust proxy` setting (behind a proxy every user shares one IP), in-memory store (single instance only; acceptable).
- **429 shape:** `ThrottlerException` is an `HttpException`, so `AllExceptionsFilter` should already wrap it in the `ApiError` envelope. Confirmed by reading the code only (no runtime check).
- **Queries:** task list = 2 queries (page of ids, then relations) + 1 for submissions; no N+1. Dashboard = 5 parallel queries + 1.
- **Redundant work:**
  - Dashboard runs a separate overdue `countBy` although the totals query already returns `overdue` (`dashboard.service.ts:55`).
  - `notifySubmitted` / `notifyReviewResult` reload the actor with `users.findById` (`taskWorkflow.service.ts:152,170`) for the display name. Low value, probably leave.
  - `transition` calls `assertVisible` then re-reads the task with a lock. Needed for the 404 vs 403 rule; keep.
  - `create`/`update`/`transition` reload the task after commit to return relations. Needed for the response shape; keep.
- **Indexes present:** users `lower(email)` unique; tasks `(manager_id, status)`, `created_by`, `due_date`; task_assignees `(user_id)` + PK; comments `(task_id, created_at)`; history `(task_id, created_at)`; token hashes unique, `user_id`.
- **Index candidates (only with EXPLAIN evidence, which I cannot produce):** `tasks(created_at DESC)`, `task_status_history(created_at DESC)`, `tasks(status)`, partial indexes on `deleted_at IS NULL`.
- **Pagination:** all lists capped at 100 (`paginationQuery.dto.ts`). OK.
- **Transactions / concurrency:** task update, transition and user update use `pessimistic_write` locks in transactions. Task `remove` is check-then-soft-delete without a transaction (low risk, idempotent). User create checks email then inserts; the unique index backstops it and the filter maps 23505 to 409.
- **Serialization:** `plainToInstance` with `excludeExtraneousValues` everywhere. OK.
- **Docs drift:** spec still says "planning"; API README has nothing on logging, rate-limit envelope or proxy setup.

### 1.4 Not verifiable (by design)

- No EXPLAIN / query plans: needs a live PostgreSQL. I will not open `.env` or connect. DB work = static review of queries, entities and migrations; no index is added without evidence, so likely none this round. EXPLAIN checks are a follow-up for you.
- No runtime checks (no Android, browser or API startup). Validation is static only.

## 2. Proposed improvements

| #   | Area           | Change                                                                                                                                                             | Purpose                     |
| --- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| A   | Admin screens  | `pages/<Name>Page/index.tsx` + `subcomponents/` for all 5 pages. Move page-specific `features/*` files and CSS in. Remove empty `features/`.                       | Screen ownership is obvious |
| B   | Mobile screens | `screens/<Name>Screen/index.tsx` + `subcomponents/` for all screens; TaskDetailView split (see D1). Move single-use components out of `components/`.               | Same                        |
| C   | Logging        | Request-scoped structured logs, correlation id, redaction, pretty in dev, JSON in prod, `LOG_LEVEL` env                                                            | Observability, safe logs    |
| D   | Rate limiting  | DROPPED by you: already implemented, not touched                                                                                                                   | n/a                         |
| E   | DB / API perf  | Remove the redundant dashboard count query; static query review; index migration only if justified                                                                 | Evidence-based only         |
| F   | Docs           | Update READMEs and spec: architecture, screen layout, auth, workflow, DB, API conventions, logging, rate limiting, setup, limitations; mark Implemented vs Planned | Docs match code             |

Component names stay (`TasksPage`, `TasksScreen`, `TaskDetailView`, …); only folders change. Folder name = component name (`pages/TasksPage/index.tsx`). No barrels: `index.tsx` is the component itself. No lazy loading.

### Target layouts (representative)

- **Admin Tasks:** `pages/TasksPage/index.tsx`, `TasksPage.module.css`, `subcomponents/{TasksList,TasksToolbar,TaskDrawer,TaskDetail,TaskDialogs}/index.tsx` (+ own `.module.css`); `PersonPicker` nested in `TaskDrawer/subcomponents/` (used only there); page-level `useTasks.ts` and `taskUtils.util.ts` (shared by several subcomponents); `TaskFilters`/`NO_TASK_FILTERS` moved to a page-level `taskFilters.util.ts`. `router.tsx` imports keep resolving.
- **Admin Dashboard:** `subcomponents/{StatusTiles,OverdueList,ManagerWorkload,RecentActivity,Panel}`, `useDashboard.ts` page-level.
- **Admin Users:** `subcomponents/{UsersList,UsersToolbar,UserDrawer,DeactivateDialog}`, `useUsers.ts` page-level.
- **Admin Login / NotFound:** folder with `index.tsx` only (see D2).
- **Mobile:** `TasksScreen/subcomponents/{TaskCard,SummaryTile,FilterChip}`, `ReviewScreen/subcomponents/ReviewCard`, `ProfileScreen/subcomponents/{InfoRow,ChangePasswordSheet}`, `TaskFormScreen/subcomponents/{Section,EmployeeRow,PriorityPicker,SwitchRow}` + form helpers.

## 3. Files and directories expected to change

- `apps/admin/src/pages/**`, `apps/admin/src/features/**` (moved), `apps/admin/src/app/router.tsx` (only if needed).
- `apps/mobile/src/screens/**`, `apps/mobile/src/components/{sheets,task,inputs}` (single-use files moved out), `navigation/RootNavigator.tsx`, `navigation/MainTabs.tsx`.
- `apps/api/src/main.ts`, `app.module.ts`, `config/{env.validation,configuration}.ts`, new `common/logging/*`, `.env.example`, `dashboard.service.ts`; a migration only if justified.
- `README.md`, `apps/*/README.md`, `packages/shared/README.md`, `docs/project-spec.md`, this file.

## 4. Proposed dependencies (none installed; need your approval)

- **Logging (see D3):**
  - Option 1 (recommended): `nestjs-pino`, `pino-http`, `pino`; dev-only `pino-pretty`. Mature correlation-id and redaction support.
  - Option 2: no new packages; custom Nest `LoggerService` (JSON/pretty) + small request-id middleware. More code to maintain.
- Rate limiting: none (out of scope).
- Migrations: none planned.

## 5. Implementation phases and priorities

1. Audit (done).
2. Approval (you).
3. Implementation, one checkpoint at a time, stopping after each for your OK:
   - 1.1 API structured logging (needs dependency OK)
   - 1.2 Dashboard: remove redundant overdue count query
   - 2.1 Admin: DashboardPage, LoginPage, NotFoundPage folders
   - 2.2 Admin: UsersPage folder
   - 2.3 Admin: TasksPage folder
   - 3.1 Mobile: Login, ForgotPassword, TaskDetail screen folders
   - 3.2 Mobile: Profile, Review screen folders
   - 3.3 Mobile: Tasks, TaskForm screen folders
   - 3.4 Mobile: TaskDetailView split into `components/task/TaskDetailView/`
   - 4.1 Docs (including "use arrow functions" rule)
4. Validation (static only).
5. Final report in this file.

## 6. Risks and breaking changes

- Screen moves change relative imports and CSS paths. Caught by `typecheck` / `build`; no behavior change intended.
- Metro / Vite caches may need a restart after moves.
- Logging: new env vars are optional with defaults; response bodies unchanged; new `X-Request-Id` response header (additive). CORS `allowedHeaders` must include `X-Request-Id` if browsers send it.
- Rate limiting: untouched.
- No API contract, UI, navigation or business logic changes planned.

## 7. Progress

- **1.1 API structured logging: done, awaiting your OK for 1.2.**
  - Installed in `apps/api`: `nestjs-pino`, `pino-http`, `pino`, dev `pino-pretty`. Ran `yarn install` once more afterwards (documented TypeScript 6 relink issue).
  - New `src/common/logging/appLogger.module.ts`: request id (`X-Request-Id` reused when safe, else UUID, echoed in the response), `reqId` on every log including service `Logger` calls, `warn` for 4xx and `error` for 5xx, redaction of auth headers, cookies, passwords and tokens, request log keeps only method and path (query string dropped because account links carry `?token=`).
  - Pretty single-line logs outside production, JSON in production.
  - `main.ts`: `bufferLogs` + `app.useLogger`, CORS allows and exposes `X-Request-Id`. `app.module.ts`: module registered.
  - `LOG_LEVEL` (optional; default `info` in production, `debug` otherwise) added to `env.validation.ts`, `configuration.ts` and `.env.example`.
  - Not done: API README section on logging (goes in checkpoint 4.1).
- **1.2 Dashboard redundant query: done, awaiting your OK for 2.1.** `dashboard.service.ts` no longer runs the separate overdue `countBy`; the count comes from the totals query (`COUNT(*) FILTER (status != COMPLETED AND due_date < NOW())`), same rule, same response. One query fewer per dashboard load. `typecheck` passes. Static review of the rest of the DB code found no other justified change; no index or migration added (no EXPLAIN evidence).

- **2.1 Admin DashboardPage, LoginPage, NotFoundPage: done, awaiting your OK for 2.2.**
  - `pages/DashboardPage/index.tsx` + `DashboardPage.module.css` + page-level `useDashboard.ts` + `subcomponents/{StatusTiles,OverdueList,ManagerWorkload,RecentActivity,Panel}/` (each `index.tsx` + own `.module.css`). `Panel` stays a sibling because three subcomponents use it.
  - `pages/LoginPage/` and `pages/NotFoundPage/`: `index.tsx` + CSS only (D2).
  - `features/dashboard/` removed. Only relative import paths changed; `router.tsx` untouched (folder imports resolve to `index.tsx`).
  - Moves were done with `git mv`, so the renames are staged (nothing committed).

- **2.2 Admin UsersPage: done, awaiting your OK for 2.3.** `pages/UsersPage/index.tsx` + `UsersPage.module.css` + page-level `useUsers.ts` + `subcomponents/{UsersToolbar,UsersList,UserDrawer,DeactivateDialog}/` (each `index.tsx` + own CSS). `features/users/` removed. Import paths only; renames staged with `git mv`.

- **2.3 Admin TasksPage: done, awaiting your OK for 3.1.** `pages/TasksPage/index.tsx` + `TasksPage.module.css` + page-level `useTasks.ts` and `taskUtils.util.ts` + `subcomponents/{TasksToolbar,TasksList,TaskDrawer,TaskDetail,TaskDialogs}/` (each `index.tsx` + own CSS); `PersonPicker` nested in `TaskDrawer/subcomponents/PersonPicker/`. `features/` removed entirely (admin is now free of it). Import paths only. Deviation from the earlier plan: `TaskFilters`/`NO_TASK_FILTERS`/`hasTaskFilters` stay in `TasksToolbar` (as `UserFilters` does in `UsersToolbar`) instead of a new `taskFilters.util.ts`, to keep the change a pure move.

- **3.1 Mobile LoginScreen, ForgotPasswordScreen, TaskDetailScreen: done, awaiting your OK for 3.2.** Each is now `screens/<Name>/index.tsx` only (D2). `RootNavigator.tsx` untouched (folder imports resolve to `index.tsx`). `TaskDetailScreen` temporarily imports `../TaskDetailView`; that moves in 3.4. Import paths only; renames staged with `git mv`.

- **3.2 Mobile ProfileScreen, ReviewScreen: done, awaiting your OK for 3.3.** `screens/ProfileScreen/index.tsx` + `subcomponents/{InfoRow,ChangePasswordSheet}/`; `screens/ReviewScreen/index.tsx` + `subcomponents/ReviewCard/`. `ChangePasswordSheet` (was `components/sheets/`) and `ReviewCard` (was `components/task/`) were used by one screen only, so they moved in (D1). `InfoRow` was a local helper in `ProfileScreen`; it is now its own file with its two styles and row height constant (same values, copied code). `ReviewScreen` temporarily imports `../TaskDetailView` (moves in 3.4). Renames staged with `git mv`.

- **3.3 Mobile TasksScreen, TaskFormScreen: done, awaiting your OK for 3.4.** `screens/TasksScreen/index.tsx` + `subcomponents/{TaskCard,SummaryTile,FilterChip}/`; `screens/TaskFormScreen/index.tsx` + `subcomponents/{Section,EmployeeRow,PriorityPicker,SwitchRow}/`. The five components were used by one screen only and moved out of `components/` (D1); they still import shared pieces (`StatusIcon`, `PriorityIcon`, `PriorityTag`, `StatusBadge`, `Avatar`) from `components/`. `Section` was a local helper, now its own file with its style. Form helpers (`toDueIso`, `toInput`, `changedFields`) stay in `TaskFormScreen/index.tsx` because they are tied to its form types. `TasksScreen` still imports `../TaskDetailView` until 3.4. Renames staged with `git mv`.

- **3.4 Mobile TaskDetailView split: done, awaiting your OK for 4.1.** `screens/TaskDetailView.tsx` (743 lines) is now `components/task/TaskDetailView/` (shared by Tasks, Review and TaskDetail screens, D1). `index.tsx` (300 lines) keeps the state, queries, mutations and layout. `subcomponents/`: `DetailHeader`, `DetailFooter`, `DescriptionCard`, `PeopleCard`, `CommentsCard` (with `CommentComposer` nested, moved from `components/inputs/`), `HistoryCard` (with `HistoryTimeline` nested, moved from `components/task/`), `DeleteTaskSheet`, `DetailSkeleton`, `LoadNote`, `Card`, `InfoRow`. Plain files: `detailFooter.util.ts` (`footerFor`, `Footer`) and `taskDetailView.types.ts` (`DetailVariant`).
  - Small code changes beyond moving: the pieces now take props instead of closing over the view's state; `Card` got an optional title so `DetailSkeleton` reuses it instead of copying its style; the delete sheet's close guard moved into `DeleteTaskSheet`. Styles, strings, conditions and behavior are meant to be identical, but this was not runtime-checked, so please open a task on phone, medium and tablet layouts and try Edit, Delete, Reject/Approve and comments.
  - Mobile screens are now all `screens/<Name>/index.tsx`; `TasksScreen`, `ReviewScreen` and `TaskDetailScreen` import the view from `components/task/TaskDetailView`.

- **4.1 Docs: done.**
  - `docs/project-spec.md`: status line, how the apps communicate, the screen and page organization rules (canonical home), API and data model marked "as built", logging and rate limiting in section 11, new section 15 Known limitations.
  - `apps/api/README.md`: modules table and task workflow, `LOG_LEVEL`, Logging, Rate limiting (documents what already existed; code untouched), Database and migrations.
  - `apps/admin/README.md` and `apps/mobile/README.md`: new folder layout, stale paths fixed (`BottomNav`, `features/`), arrow-function rule.
  - Root `README.md`: "How the pieces fit" (architecture, auth, errors, logging, screens, limitations) and a fixed docs list. `packages/shared/README.md` needed no change.
  - Details live in one place each and the other files link to it (spec for organization and limitations, API README for logging and rate limiting).
- **Final summary of changes:** API structured logging (new dependencies `nestjs-pino`, `pino-http`, `pino`, dev `pino-pretty`); one dashboard query removed; all 5 admin pages and all 8 mobile screens in `index.tsx` + `subcomponents/` folders; `TaskDetailView` split; docs updated. Rate limiting, database schema, migrations, API contracts, navigation and UI were not changed. Nothing was committed; file moves are staged from `git mv`.

## 8. Validation results

Planned (static only): `yarn workspace @task-app/{api,admin,mobile} typecheck`, `yarn workspace @task-app/api build`, admin build, `yarn format:check`. No tests.
Checkpoint 1.1: `yarn workspace @task-app/api typecheck` passes, `yarn workspace @task-app/api build` passes. `prettier --check` could not be run (command denied); the edit hook formats changed files.
Checkpoint 1.2: api `typecheck` passes.
Checkpoint 2.1: `yarn workspace @task-app/admin typecheck` and `build` pass.
Checkpoint 2.2: admin `typecheck` and `build` pass.
Checkpoint 2.3: admin `typecheck` and `build` pass.
Checkpoint 3.1: mobile `typecheck` passes. Metro resolution of folder `index.tsx` imports is not runtime-checked; restart Metro with `--reset-cache` after the mobile moves.
Checkpoint 3.2: mobile `typecheck` passes.
Checkpoint 3.3: mobile `typecheck` passes.
Checkpoint 3.4: mobile `typecheck` passes.
**Final run (after all checkpoints):** api, admin and mobile `typecheck` pass; api `build` and admin `build` pass. `yarn format:check`: the files I changed are clean (I formatted `UsersPage/index.tsx`, `TaskDrawer.module.css` and `project-spec.md`, which my edits had left unformatted). It still reports 5 files I did not touch and left alone: `apps/admin/package.json`, `package.json`, `apps/mobile/src/api/errorMessage.api.ts`, `packages/shared/README.md`, `packages/shared/tsconfig.json`.
Not validated by design: runtime behavior (logs, 429 response, UI, Android) and DB query plans. Listed as manual follow-ups for you.

## 9. Pending decisions (please answer here or in chat)

- **D1** DECIDED: a component used by only one screen moves into that screen's `subcomponents/`; a component used by more than one stays in `components/`. So `TaskDetailView` (3 screens) stays shared in `src/components/task/TaskDetailView/` (folder with `index.tsx` + `subcomponents/`), and `TaskDetailScreen` stays a thin screen folder.
- **D2** DECIDED: tiny screens get a folder with `index.tsx` only; `subcomponents/` only when something meaningful splits.
- **D3** DECIDED in principle: the goal is production-grade structured logs with correlation ids (not debug printing), so use the industry standard, pino via `nestjs-pino`. Still needs your explicit OK to install (section 4).
- **D4** DECIDED: keep existing `function` declarations; docs must state that React and React Native code uses arrow functions.
- **D5** MOOT: rate limiting is not touched.

## 10. Known issues

- Dashboard overdue count query duplicate: fixed in 1.2.
- `yarn format:check` reports 5 pre-existing files (listed in section 8). Not touched.
- Rate limits are hardcoded and there is no `trust proxy` setting (documented as a limitation; rate limiting was left alone on your instruction).
- Mobile `ReviewScreen` renders its queue with `map` in a `ScrollView` (not virtualized); `TaskCard`/`renderItem` not memoized. Out of scope unless you ask.
- Mobile has no lint script; spec still says "planning" (docs fix in F).

## 11. Manual checks for you (not done by me: no runtime checks by design)

- API: start it, confirm dev logs are one readable line each and have `reqId`; call an endpoint and check the `X-Request-Id` response header; set `NODE_ENV=production` once to see JSON logs; confirm no token appears in the log when opening an account link.
- API: run `EXPLAIN (ANALYZE)` on the task list, summary and dashboard queries with realistic data before adding any index.
- Admin: open Dashboard, Users, Tasks (filters, drawer, detail, reject, delete) and Login; check the 404 page.
- Mobile: restart Metro with `--reset-cache`, rebuild if needed; check Login, Forgot password, Tasks, Review, Profile (change password), Task form, and the task detail on phone, medium and tablet layouts (Edit, Delete, Start/Submit/Complete, Approve/Reject, comments, pull to refresh).
- Decide whether to run `prettier --write` on the 5 pre-existing unformatted files.
