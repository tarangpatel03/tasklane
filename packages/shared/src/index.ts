/** User roles. Admin uses the admin panel; Manager and Employee use the mobile app. */
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

/** Account lifecycle: invited until the user sets a password, deactivated blocks login. */
export enum UserStatus {
  INVITED = 'invited',
  ACTIVE = 'active',
  DEACTIVATED = 'deactivated',
}

/** Task status belongs to the whole task, not to each assignee. */
export enum TaskStatus {
  TODO = 'TODO',
  WORKING = 'WORKING',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
}

/** What a user asks the workflow to do; the backend decides the resulting status. */
export enum TaskAction {
  START = 'START',
  SUBMIT = 'SUBMIT',
  COMPLETE = 'COMPLETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

/** Pagination info returned with list responses. */
export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Successful API response envelope. */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

/** One failed input field, as reported by validation. */
export interface ApiErrorDetail {
  field: string;
  messages: string[];
}

/** Error API response envelope. Never contains stack traces or SQL. */
export interface ApiError {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  details?: ApiErrorDetail[];
  path: string;
  timestamp: string;
}

export * from './api-routes';
