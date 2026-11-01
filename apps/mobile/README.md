# Mobile app (`@task-app/mobile`)

React Native CLI (0.88, new architecture), TypeScript, Android first. For Managers and Employees; Admins use the admin panel. This checkpoint is the scaffold only: a placeholder Home screen that shows the window class, insets and an API check. Login and the task screens come next.

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
- `src/navigation/`: React Navigation native stack and its route types. Signed-out users get `Login` and `ForgotPassword`; signed-in users get `Home`, a placeholder with a temporary Log out button until the task screens and Profile exist.
- Login and Forgot password only ask for the email; the new password is set on the web page from the emailed link (the link needs `PUBLIC_BASE_URL` to be an address the phone can open, see the API README).
- `src/components/`: `Logo`, `Wash` (lavender header gradient), `AppText`, `AppButton`, `TextButton`, `TextField`, `Banner`, `BackButton`, `Entrance` (staggered entrance), `AuthLayout` (frame of the signed-out screens: centred card from 600 wide, keyboard and safe-area handling).
- Animation uses `react-native-reanimated` (Babel plugin `react-native-worklets/plugin` in `babel.config.js`). Reduced motion is honoured with `useReducedMotion`.
- `metro.config.js` watches the repo root so the hoisted `node_modules` and `@task-app/shared` resolve.

## Fonts and icon

- Plus Jakarta Sans (500, 600, 700, 800) lives in `android/app/src/main/assets/fonts/`; the family names are in `src/theme/typography.ts`.
- The launcher icon is an adaptive icon drawn as vectors from `docs/design/logo/tasklane-icon-*.svg` (`res/drawable/ic_launcher_*.xml`, `mipmap-anydpi-v26`). Android 7.0 and 7.1 still show the React Native default PNGs; replace them from `docs/design/logo/tasklane-icon-full-1024.png` if those versions matter.
