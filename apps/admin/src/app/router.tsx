import { createBrowserRouter } from 'react-router';
import { RequireAuth } from '../auth/RequireAuth';
import { AppShell } from '../layout/AppShell';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { TasksPage } from '../pages/TasksPage';
import { UsersPage } from '../pages/UsersPage';
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
