# @task-app/shared

Shared types used by the API, admin panel and mobile app, all from `src/index.ts`:

- Enums: `Role`, `UserStatus`, `TaskStatus`, `TaskAction`, `TaskPriority`
- Response envelope: `ApiResponse`, `ApiMeta`, `ApiError`, `ApiErrorDetail`
- API routes (`src/api-routes.ts`), the single source of truth for every endpoint path: `API_PREFIX`, `API_VERSION`, `API_BASE_PATH`, `ROUTES` (relative patterns the NestJS controllers declare) and `ENDPOINTS` (absolute client paths and builders such as `ENDPOINTS.tasks.byId(id)`). Add a new route here first, then use it in the controller and in the clients; never type a path string in an app.

Build (emits `dist/`): `yarn build:shared` from the repo root.
