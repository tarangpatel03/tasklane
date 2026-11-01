# Mobile app (`@task-app/mobile`)

React Native CLI (0.88, new architecture), TypeScript, Android first. For Managers and Employees; Admins use the admin panel. Login, the task list and the task detail work on a phone; the Manager flows, the tablet layouts and the Profile (with change password and Log out) work too.

Screenshots (in `docs/screenshots/mobile/`): [Tasks](../../docs/screenshots/mobile/tasks.jpg), [Task detail](../../docs/screenshots/mobile/task-detail.jpg), [Review](../../docs/screenshots/mobile/review.jpg), [Profile](../../docs/screenshots/mobile/profile.jpg), [tablet split pane](../../docs/screenshots/mobile/tablet-split.jpg).

## Run

1. From the repo root: `yarn install`, then `yarn build:shared`.
2. Start PostgreSQL and the API (`yarn dev:api`, see `apps/api/README.md`).
3. Connect a phone with USB debugging, or start an emulator. For each device run `adb -s <serial> reverse tcp:3000 tcp:3000` so `http://localhost:3000` on the device reaches the API on this PC (run it again after the device reconnects).
4. `yarn dev:mobile` (Metro), then in another terminal `yarn workspace @task-app/mobile android`. Add `--no-packager` when Metro already runs.

Other script: `yarn workspace @task-app/mobile typecheck`.

## Configuration

`src/config/app-config.ts` holds the API address. Debug builds use the constant `DEBUG_API_URL` (currently the PC's LAN IP on the same Wi-Fi; set `http://localhost:3000` instead to go through `adb reverse`); change that one constant and set `PUBLIC_BASE_URL` for email links as described in the API README. Release builds have no default: set `RELEASE_API_URL` to an `https://` address or the app throws at start. Plain HTTP is allowed in debug builds only (the React Native Gradle plugin fills the manifest's `usesCleartextTraffic` placeholder per build type).

## Structure

- `src/theme/`: design tokens from `docs/design-brief.md` (colours, type scale, spacing, radii, elevation, motion). Components use these only.
- `src/hooks/use-window-class.ts`: `useWindowClass()` returns `compact` (below 600), `medium` (600 to 899) or `expanded` (900 and up), plus `isLandscape`. It is the only place those numbers live.
- `src/api/client.ts`: fetch wrapper for `/api/v1` (port of the admin client). It unwraps the envelope, throws `ApiRequestError`, adds the Bearer token, and on a 401 refreshes once (one request at a time) and retries.
- `src/auth/token-store.ts`: access token in memory, refresh token in the Android Keystore through `react-native-keychain`. `loadTokens()` runs once at startup (see `App.tsx`).
- `src/auth/auth-provider.tsx` and `useAuth()` (`auth-context.ts`): `loading`, `signedOut` or `signedIn`. On start a stored refresh token is checked through `GET /auth/me`. Admin accounts are rejected on the phone ("Admin accounts sign in on the admin panel."). A network failure keeps the stored token.
- `src/navigation/`: React Navigation native stack and its route types. Signed-out users get `Login` and `ForgotPassword`; signed-in users get `Main` (bottom tabs) and the screens above it. The tabs are `Tasks` (status tiles, filter chips, task list), `Profile` (name, email, role, Change password, Log out), `TaskDetail` (people, comments, status history, and the Start, Submit, Complete, Approve and Reject actions allowed for the role; the task's Manager also gets Edit and Delete), and for Managers `Review` (the review queue with inline Approve and Reject) and `TaskForm` (create or edit a task, pick Employees). The tabs (`@react-navigation/bottom-tabs`, `src/navigation/main-tabs.tsx`) stay mounted once opened, and the floating nav is the tab bar (`src/components/bottom-nav.tsx`): its pill slides between tabs and, on wide windows, the nav glides between the list pane and the window centre. Everyone gets Tasks and Profile, Managers also Review (count badge) and a New task button. Overlays inside a tab (the side sheet) hide the nav through `nav-visibility.ts`.
- Login and Forgot password only ask for the email; the new password is set on the web page from the emailed link (the link needs `PUBLIC_BASE_URL` to be an address the phone can open, see the API README).
- `src/components/`: `Logo`, `Wash` (lavender header gradient), `AppText`, `AppButton`, `TextButton`, `TextField`, `Banner`, `BackButton`, `Entrance` (staggered entrance), task UI (`TaskCard`, `StatusBadge`, `PriorityTag`, `Avatar`, `SummaryTile`, `FilterChip`, `Skeleton`, `Snackbar`, `BottomSheet`, `ActionButton`, `CommentComposer`, `HistoryTimeline`, `ManagerNav`, `NewTaskButton`, `RejectSheet`, `ReviewCard`, `PriorityPicker`, `SwitchRow`, `EmployeeRow`), `AuthLayout` (frame of the signed-out screens: centred card from 600 wide, keyboard and safe-area handling).
- Animation uses `react-native-reanimated` (Babel plugin `react-native-worklets/plugin` in `babel.config.js`). Reduced motion is honoured with `useReducedMotion`.
- `metro.config.js` watches the repo root so the hoisted `node_modules` and `@task-app/shared` resolve.

## Fonts and icon

- Plus Jakarta Sans (500, 600, 700, 800) lives in `android/app/src/main/assets/fonts/`; the family names are in `src/theme/typography.ts`.
- The launcher icon is an adaptive icon drawn as vectors from `docs/design/logo/tasklane-icon-*.svg` (`res/drawable/ic_launcher_*.xml`, `mipmap-anydpi-v26`). Android 7.0 and 7.1 still show the React Native default PNGs; replace them from `docs/design/logo/tasklane-icon-full-1024.png` if those versions matter.

## Native modules

`@react-native-community/datetimepicker` (due date on the task form) is a native module: after `yarn install`, rebuild and reinstall the app with `yarn android`; a Metro reload is not enough.

## Layouts by window size

`useWindowClass()` (`src/hooks/use-window-class.ts`) is the only place the breakpoints and screen margins live: compact below 600, medium 600 to 899, expanded 900 and up.

- **Compact:** one column. A task opens as a pushed `TaskDetail` screen; Create/Edit task is full screen.
- **Medium:** tiles in one row, cards in two columns, margin 40. A task opens in a 560px side sheet (`SideSheet`, scrim, Android back closes it). Create/Edit task is a centred modal.
- **Expanded:** `ListDetail`: a 420px list pane (the nav and New task button float inside it) and the selected task's detail in the right pane. The first task is selected on load.

The selected task (`selectedId`) is state of the Tasks and Review screens, which stay mounted through rotation, fold and split-screen, so the selection and the filter survive a resize. If a pushed `TaskDetail` screen finds itself in an expanded window it goes back to the list with that task selected. The detail itself is one component, `TaskDetailView`, with `screen`, `sheet` and `pane` variants.

## Loading and error states

- `Splash` (mark on the wash) shows while the stored session is read and checked.
- Lists and the task detail show skeletons while loading; failed loads show an empty-state card with Retry, and comments or history that fail to load say so inline instead of looking empty.
- `ErrorBoundary` wraps the navigator as a safety net for rendering crashes ("Something went wrong", Try again).
- Change password (`POST /auth/change-password`) signs the user out of every other device and keeps this one signed in with the fresh tokens the API returns.
