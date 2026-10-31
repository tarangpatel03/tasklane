/** User roles. Admin uses the admin panel; Manager and Employee use the mobile app. */
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

/** Task status belongs to the whole task, not to each assignee. */
export enum TaskStatus {
  TODO = 'TODO',
  WORKING = 'WORKING',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

/** Successful API response envelope. */
export interface ApiResponse<T> {
  success: true;
  data: T;
}

/** Error API response envelope. Never contains stack traces or SQL. */
export interface ApiError {
  success: false;
  error: {
    statusCode: number;
    message: string;
    details?: string[];
  };
}
