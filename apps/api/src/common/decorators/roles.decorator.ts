import { SetMetadata } from '@nestjs/common';
import { Role } from '@task-app/shared';

export const ROLES_KEY = 'roles';

/** Restricts a route to the listed roles. Without it, any authenticated user may call the route. */
export const Roles = (...roles: Role[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
