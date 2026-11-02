import { createBrowserRouter } from 'react-router';
import { RequireAuth } from '../auth/require-auth';
import { AppShell } from '../layout/app-shell';
import { DashboardPage } from '../pages/dashboard-page';
import { LoginPage } from '../pages/login-page';
import { NotFoundPage } from '../pages/not-found-page';
import { TasksPage } from '../pages/tasks-page';
import { UsersPage } from '../pages/users-page';
import { PATHS } from './paths';

export const router = createBrowserRouter([
  { path: PATHS.login, element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: PATHS.dashboard, element: <DashboardPage /> },
          { path: PATHS.tasks, element: <TasksPage /> },
          { path: PATHS.users, element: <UsersPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
