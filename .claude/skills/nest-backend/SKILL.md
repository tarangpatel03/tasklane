---
name: nest-backend
description: Use when building or changing NestJS backend code (modules, controllers, services, DTOs, guards, pipes, entities, migrations, config, API responses) with PostgreSQL and TypeORM. Enforces feature-module structure, secure-by-default guards and pipes, one response shape, and migration-only schema changes.
---

# NestJS backend (PostgreSQL + TypeORM)

Use current APIs: TypeORM 0.3+ (`DataSource`, `findOneBy`, `FindOptionsWhere`), not the deprecated `Connection`, `getRepository` or `findOne(id)`. If unsure about an API, check current docs (Context7) instead of guessing.

## Folder structure (one feature = one folder)

```
src/
  main.ts, app.module.ts
  config/          env validation + typed config
  database/        dataSource.ts, migrations/
  common/          decorators/ filters/ guards/ interceptors/ pipes/ dto/ types/   (generic, feature-agnostic only)
  modules/
    <feature>/
      <feature>.module.ts
      <feature>.controller.ts
      <feature>.service.ts
      dto/         create-<feature>.dto.ts, update-<feature>.dto.ts, query-<feature>.dto.ts, <feature>-response.dto.ts
      entities/    <feature>.entity.ts
      (guards/ or decorators/ only when used by this feature alone)
```

- Everything a feature owns lives in its folder. No global `controllers/` or `services/` folders.
- camelCase file names with a role suffix (`authTokens.service.ts`, `createUser.dto.ts`, `jwtAuth.guard.ts`; also `.controller.ts`, `.module.ts`, `.entity.ts`, `.types.ts`, `.enum.ts`, `.util.ts`). PascalCase classes. Feature folder names stay kebab-case; migration files keep TypeORM's `<timestamp>-<Name>.ts` format.
- A module exports only what others need (usually the service). Never inject another module's repository: import its module and use its service.
- Avoid circular imports. Needing `forwardRef` means the design should change first.

## Layers

- Controller: routing, DTOs for params/query/body, one service call, return the result. No business logic, no repository, no try/catch.
- Service: business rules, resource-level authorization, transactions, throws Nest exceptions. All database access happens here through injected repositories or `DataSource`.
- Entities are persistence only. Never accept them as input or return them to clients.

## Secure by default: guards and pipes

- Global `JwtAuthGuard` registered as `APP_GUARD`. Every route is private unless marked `@Public()`. Roles use `@Roles()` with a global `RolesGuard`.
- A role check is not enough for user-owned data: the service must verify the caller owns or may access the record (no IDOR). Take the user from a `@CurrentUser()` decorator, never from the body or params.
- Global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`. Route ids use `ParseUUIDPipe` or `ParseIntPipe`.
- Passwords: argon2 or bcrypt. Never stored, returned or logged in plain form. JWT: short-lived access token plus refresh token. Secrets come from env only.
- Also expected: helmet, restricted CORS origins, `@nestjs/throttler` rate limits (stricter on auth routes). If a package is missing, ask once and list what is needed.
- Parameterized queries only. Never build SQL from string concatenation or template literals.
- Never expose stack traces, SQL text or internal error details to clients.

## DTOs (input)

- class-validator + class-transformer. One DTO per use: Create, Update (`PartialType(CreateXDto)`), Query. Every property is decorated, strings get `@IsString() @IsNotEmpty() @MaxLength(n)`.
- List endpoints take a Query DTO: `page` (default 1), `limit` (default 20, `@Max(100)`), optional `sort` and filters. No unbounded lists.
- Entities are never reused as DTOs. DTOs contain no logic.

## Response shape (output)

One envelope everywhere. A global `ResponseInterceptor` wraps successes and a global `AllExceptionsFilter` formats errors.

```ts
// success
{ success: true, data: T, meta?: { page: number; limit: number; total: number; totalPages: number } }
// error
{ success: false, statusCode: number, error: string, message: string,
  details?: { field: string; messages: string[] }[], path: string, timestamp: string }
```

- Controllers return plain data (response DTO instances); the interceptor wraps it. Paginated services return items + total, mapped to `data` + `meta`.
- Map entity to response DTO with `@Expose()` and `plainToInstance(Dto, entity, { excludeExtraneousValues: true })`. Never leak password hashes, tokens, or internal flags.
- Status codes: 201 for create, 200 for read/update, 200 with `data: null` for delete (keeps the envelope consistent for clients), 400 validation, 401 unauthenticated, 403 forbidden, 404 missing, 409 conflict.
- Conventions: JSON camelCase keys, ISO-8601 UTC timestamps, UUID ids, plural kebab-case routes, global prefix `api` with URI versioning (`/api/v1/tasks`).
- Services throw Nest exceptions (`NotFoundException`, `ConflictException`, ...) with a readable message. Do not catch just to rethrow or log. Catch `QueryFailedError` only to translate known Postgres codes: `23505` (unique) to 409, `23503` (foreign key) to 409 or 400.

## TypeORM + PostgreSQL

- `TypeOrmModule.forRootAsync` with `ConfigService`, plus a separate `database/dataSource.ts` for the CLI. `synchronize: false` always. Schema changes only through migrations: generate, read the SQL, commit. Never edit a migration that has been applied.
- Entities: `@Entity('plural_snake_case')`, `@PrimaryGeneratedColumn('uuid')`, `@CreateDateColumn({ type: 'timestamptz' })`, `@UpdateDateColumn({ type: 'timestamptz' })`. Use `@DeleteDateColumn` only when soft delete is required. Column names snake_case: set `name:` explicitly, or ask before adding a naming-strategy package.
- Money is `numeric` (string in TypeScript), never float. JSON data is `jsonb`. Enums: a shared TS enum plus a Postgres enum or varchar.
- Put constraints in the database: `nullable`, `unique`, foreign keys with explicit `onDelete`. Index foreign keys and columns used in frequent filters or sorting (`@Index`).
- Queries: select only needed columns, load relations explicitly (`relations` or QueryBuilder joins), and never query inside a loop (N+1). Always `take`/`skip` on lists. Wrap multi-write operations in `dataSource.transaction`. Type filters with `FindOptionsWhere`, no `any`.

## Config, logging, docs

- `@nestjs/config` with schema validation at startup so the app fails fast. No `process.env` outside `config/`. Keep `.env.example` current.
- Use Nest `Logger` per class. No `console.log`. Never log secrets or full request bodies.
- Add Swagger decorators to controllers and DTOs if `@nestjs/swagger` is installed. When endpoints or env vars change, update the README.
- In a monorepo with `packages/shared`, the response envelope types and shared enums live there. Ask before moving other code.

## Order for a new feature

Entity, migration, DTOs (create/update/query/response), service, controller (guards and pipes), register the module. Then verify: typecheck/build, run the migration on the local database, and call the endpoint for a success case, a validation error and an unauthorized request.
