import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { AppConfig } from '../config/configuration';

/** Connection settings shared by the Nest app and the TypeORM CLI. Schema changes go through migrations only. */
export function buildDatabaseOptions(db: AppConfig['database']): DataSourceOptions {
  return {
    type: 'postgres',
    host: db.host,
    port: db.port,
    username: db.username,
    password: db.password,
    database: db.name,
    synchronize: false,
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  };
}
