import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  /** Runs a trivial query so the check fails when the database is unreachable. */
  async check(): Promise<{ status: 'ok'; database: 'up' }> {
    await this.dataSource.query('SELECT 1');
    return { status: 'ok', database: 'up' };
  }
}
