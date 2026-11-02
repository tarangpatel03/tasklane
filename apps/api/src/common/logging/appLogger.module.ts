import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';
import { LoggerModule } from 'nestjs-pino';
import { SerializedRequest } from 'pino';
import { AppConfig } from '../../config/configuration';

export const REQUEST_ID_HEADER = 'x-request-id';

/** Letters, digits, dash, underscore and dot only, so a client cannot inject odd text into the logs. */
const SAFE_REQUEST_ID = /^[\w.-]{1,64}$/;

/** Safety net: these never reach the log even if a future change logs a whole request or body. */
const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  'password',
  '*.password',
  '*.currentPassword',
  '*.newPassword',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
];

/** Reuses the caller's id when it looks safe (a gateway may already have set one), else makes a new one. */
function resolveRequestId(req: IncomingMessage, res: ServerResponse): string {
  const incoming = req.headers[REQUEST_ID_HEADER];
  const id =
    typeof incoming === 'string' && SAFE_REQUEST_ID.test(incoming) ? incoming : randomUUID();
  res.setHeader(REQUEST_ID_HEADER, id);
  return id;
}

/** Logs only what helps debugging. No headers, and no query string: account links carry a one-time `?token=`. */
function serializeRequest(
  req: SerializedRequest,
): Pick<SerializedRequest, 'id' | 'method' | 'url'> {
  return { id: req.id, method: req.method, url: req.url.split('?')[0] };
}

/**
 * Structured request logging. Development prints one readable line per entry, production prints JSON.
 * Every log written while a request is handled, including `Logger` calls in services, carries the
 * request id as `reqId`. Client errors are logged as `warn`, server errors as `error`.
 */
export const AppLoggerModule = LoggerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService<AppConfig, true>) => {
    const isProduction = config.get('nodeEnv', { infer: true }) === 'production';
    return {
      pinoHttp: {
        level: config.get('logLevel', { infer: true }),
        genReqId: resolveRequestId,
        redact: REDACTED_PATHS,
        serializers: { req: serializeRequest },
        customLogLevel: (_req: IncomingMessage, res: ServerResponse, error?: Error) => {
          if (error || res.statusCode >= 500) {
            return 'error';
          }
          return res.statusCode >= 400 ? 'warn' : 'info';
        },
        transport: isProduction
          ? undefined
          : { target: 'pino-pretty', options: { singleLine: true, ignore: 'pid,hostname' } },
      },
    };
  },
});
