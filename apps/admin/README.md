# Admin panel (`@task-app/admin`)

React 19 + TypeScript + Vite. Admin accounts only; Managers and Employees use the mobile app.

## Run

1. From the repo root: `yarn install`, then `yarn build:shared`.
2. Start the API (`yarn dev:api`, see `apps/api/README.md`) with a seeded Admin.
3. `yarn dev:admin` and open http://localhost:5173.

Other scripts: `yarn workspace @task-app/admin typecheck` and `build`.

## Configuration

The dev server proxies `/api` to the API, so the browser sees one origin and no CORS setup is needed in development. To point at another API, copy `.env.example` to `.env` in this folder and set `VITE_API_PROXY_TARGET`. CORS for a deployed panel is still to be added to the API.

## How it works

- `src/api/client.ts`: fetch wrapper for `/api/v1`. It unwraps the response envelope, throws `ApiRequestError` (with field `details`), adds the Bearer token, and on a 401 refreshes the session once (single request at a time, because refresh tokens rotate) and retries.
- `src/auth/`: `AuthProvider` and `useAuth` (login, logout, current user), `RequireAuth` route guard, token store. The access token is kept in memory only. The refresh token is kept in `sessionStorage`, so a reload keeps the session but closing the tab ends it. A non-Admin account is signed out again right after login.
- `src/app/router.tsx`: routes. `/login` is public; everything else sits behind `RequireAuth`.
- `src/features/users/` and `pages/users-page.tsx`: the Users screen (filters, table and cards, create and edit drawer, resend invite, deactivate and reactivate). Dashboard and Tasks are placeholder pages until checkpoints 4.5 and 4.4.
- Shared UI in `src/components/`: toast (`useToast`), drawer and modal (native `<dialog>`), select field, pagination, skeleton, row menu, badges.

## Layout and styling

- Design source: `docs/design-brief.md` (tokens, brand, responsive rules) and `docs/design/admin/`.
- `src/styles/tokens.css` holds every design token as a CSS variable; components use these only. `global.css` has the reset, focus ring and reduced-motion rules. Components use CSS Modules (`*.module.css`); there is no UI library.
- `src/layout/`: `AppShell` (sidebar, top bar, routed content), `Sidebar`, `TopBar`, `ProfileMenu`. Breakpoints are 640 and 1024: from 1024 the sidebar is fixed and collapsible, below it slides in as a drawer.
- Plus Jakarta Sans is loaded from Google Fonts in `index.html`, so the first load needs internet access.
