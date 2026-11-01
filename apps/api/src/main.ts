import 'reflect-metadata';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);

  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // Docs list every route and the DTO shapes; they stay off in production.
  if (config.get('nodeEnv', { infer: true }) !== 'production') {
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
