import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { ApiErrorDetail } from '@task-app/shared';

function flatten(errors: ValidationError[], parent?: string): ApiErrorDetail[] {
  return errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const own = error.constraints ? [{ field, messages: Object.values(error.constraints) }] : [];
    return [...own, ...flatten(error.children ?? [], field)];
  });
}

/** Strict global pipe: unknown fields are rejected and failures are reported per field. */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) =>
      new BadRequestException({ message: 'Validation failed', details: flatten(errors) }),
  });
}
