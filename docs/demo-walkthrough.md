# Demo walkthrough

A ten-minute tour of Tasklane that touches every role. Screenshots are in `docs/screenshots/`.

## Set up

From the repo root, after `yarn install`, filling in `.env` and `yarn build:shared` (see the README):

1. `yarn workspace @task-app/api migration:run`
2. `yarn workspace @task-app/api seed:admin` (uses `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`)
3. `yarn workspace @task-app/api seed:demo` (uses `SEED_DEMO_PASSWORD`, the password of every demo account)
4. `yarn dev:api` and `yarn dev:admin`
5. Phone: connect it with USB debugging, run `adb reverse tcp:3000 tcp:3000` (or point `DEBUG_API_URL` at your PC's LAN IP), then `yarn dev:mobile` and `yarn workspace @task-app/mobile android`. A tablet works the same way.

## Accounts

| Role     | Login                                                  | Where       |
| -------- | ------------------------------------------------------ | ----------- |
| Admin    | `SEED_ADMIN_EMAIL` from `.env`                         | Admin panel |
| Manager  | `maya@demo.test`, `daniel@demo.test`                   | Mobile app  |
| Employee | `aisha@`, `ben@`, `chloe@`, `diego@`, `emma@demo.test` | Mobile app  |

The password for demo accounts is `SEED_DEMO_PASSWORD`. Admin accounts are rejected by the mobile app and Managers and Employees by the admin panel, on purpose.

## The tour

1. **Admin dashboard.** Sign in to http://localhost:5173. The tiles show tasks per status, the overdue list, tasks per Manager and recent activity. Click a tile to open the Tasks page filtered by that status.
2. **Users.** Open Users: search, filter by role and status, open a user. Create a user with your own email to see the invite email (with no SMTP set, the API log prints an Ethereal preview URL). Try deactivating a user who is on an open task: the 409 lists the blocking tasks.
3. **Manager creates a task (phone).** Sign in as `maya@demo.test`. Tap New task, add a title, pick priority and a due date, leave Requires review on, choose two Employees, create it. The Tasks screen counts update.
4. **Employee works it (phone).** Sign in as one of those Employees on the phone (Profile, Log out first). Open the task: Start, add a comment, Submit for review.
5. **Manager reviews.** Back as Maya, the Review tab shows a badge. Reject with a reason: the task returns to Working and the reason is in its history (and in the Employee's email). The Employee submits again, and Maya approves.
6. **Admin sees it.** Refresh the dashboard: the new task is Completed, and the recent activity feed lists each step. Open the task in the Tasks page to see comments and the full status history.
7. **Tablet and rotation.** On a tablet in landscape the list and the selected task sit side by side; in portrait a task opens in a side sheet. Rotate with a task open: the selection and filter stay.
8. **Account safety.** On Profile use Change password (all other devices are signed out), or Log out and use Forgot password to get a reset link by email.

## API

Swagger UI at http://localhost:3000/api/docs lists every route. Log in with `POST /auth/login`, copy `accessToken`, press Authorize and try `GET /tasks`: you see the same data the apps do, scoped by the role of the account.
