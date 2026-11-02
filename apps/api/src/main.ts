import 'reflect-metadata';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { REQUEST_ID_HEADER } from './common/logging/appLogger.module';
import { AppConfig } from './config/configuration';
import { API_PREFIX, API_VERSION } from '@task-app/shared';

async function bootstrap(): Promise<void> {
  // Buffered so startup messages are written by pino too, not by Nest's default logger.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);

  app.setGlobalPrefix(API_PREFIX);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: API_VERSION });

  const isProduction = config.get('nodeEnv', { infer: true }) === 'production';

  // Swagger UI needs inline scripts and styles, so helmet's default CSP is relaxed outside production only.
  // The account pages set their own stricter CSP header per response.
  app.use(
    isProduction
      ? helmet()
      : helmet({
          contentSecurityPolicy: {
            directives: {
              ...helmet.contentSecurityPolicy.getDefaultDirectives(),
              'script-src': ["'self'", "'unsafe-inline'"],
              // Dev runs over plain HTTP (including the LAN IP), which this directive would break.
              'upgrade-insecure-requests': null,
            },
          },
        }),
  );

  // The mobile app is not a browser, so only the admin panel origin needs CORS.
  app.enableCors({
    origin: config.get('adminCorsOrigin', { infer: true }),
    allowedHeaders: ['Authorization', 'Content-Type', REQUEST_ID_HEADER],
    exposedHeaders: [REQUEST_ID_HEADER],
  });

  // Docs list every route and the DTO shapes; they stay off in production.
  if (!isProduction) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Tasklane API')
        .setDescription(
          'Every success response is wrapped as `{ success: true, data, meta? }`; the schemas below describe `data`. Errors are `{ success: false, statusCode, error, message, details?, path, timestamp }`.',
        )
        .setVersion('1')
        .addBearerAuth()
        .build(),
    );
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(config.get('port', { infer: true }));
}

void bootstrap();
