/** Global prefix and URI version the API mounts every controller under. */
export const API_PREFIX = 'api';
export const API_VERSION = '1';
export const API_BASE_PATH = `/${API_PREFIX}/v${API_VERSION}`;

/**
 * Route patterns as the NestJS controllers declare them (relative, with `:param` placeholders).
 * Controllers use these directly; clients use `ENDPOINTS`, which is built from them.
 */
export const ROUTES = {
  auth: {
    controller: 'auth',
    login: 'login',
    refresh: 'refresh',
    forgotPassword: 'forgot-password',
    changePassword: 'change-password',
    logout: 'logout',
    me: 'me',
  },
  account: {
    controller: 'account',
    setup: 'setup',
    reset: 'reset',
  },
  users: {
    controller: 'users',
    byId: ':id',
    resendInvite: ':id/resend-invite',
  },
  tasks: {
    controller: 'tasks',
    summary: 'summary',
    byId: ':id',
    transition: ':id/transition',
  },
  taskComments: { controller: 'tasks/:taskId/comments' },
  taskHistory: { controller: 'tasks/:taskId/history' },
  dashboard: { controller: 'dashboard', summary: 'summary' },
  health: { controller: 'health' },
} as const;

/** Absolute client paths (relative to `API_BASE_PATH`), with builders for the `:param` routes. */
export const ENDPOINTS = {
  auth: {
    login: `/${ROUTES.auth.controller}/${ROUTES.auth.login}`,
    refresh: `/${ROUTES.auth.controller}/${ROUTES.auth.refresh}`,
    forgotPassword: `/${ROUTES.auth.controller}/${ROUTES.auth.forgotPassword}`,
    changePassword: `/${ROUTES.auth.controller}/${ROUTES.auth.changePassword}`,
    logout: `/${ROUTES.auth.controller}/${ROUTES.auth.logout}`,
    me: `/${ROUTES.auth.controller}/${ROUTES.auth.me}`,
  },
  users: {
    list: `/${ROUTES.users.controller}`,
    byId: (id: string): string => `/${ROUTES.users.controller}/${id}`,
    resendInvite: (id: string): string => `/${ROUTES.users.controller}/${id}/resend-invite`,
  },
  tasks: {
    list: `/${ROUTES.tasks.controller}`,
    summary: `/${ROUTES.tasks.controller}/${ROUTES.tasks.summary}`,
    byId: (id: string): string => `/${ROUTES.tasks.controller}/${id}`,
    transition: (id: string): string => `/${ROUTES.tasks.controller}/${id}/transition`,
    comments: (taskId: string): string => `/${ROUTES.tasks.controller}/${taskId}/comments`,
    history: (taskId: string): string => `/${ROUTES.tasks.controller}/${taskId}/history`,
  },
  dashboard: {
    summary: `/${ROUTES.dashboard.controller}/${ROUTES.dashboard.summary}`,
  },
} as const;
