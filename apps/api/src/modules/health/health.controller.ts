import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { HealthService } from './health.service';
import { ROUTES } from '@task-app/shared';

@ApiTags('Health')
@Controller(ROUTES.health.controller)
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @ApiOperation({ summary: 'API and database health' })
  @Get()
  check(): Promise<{ status: 'ok'; database: 'up' }> {
    return this.healthService.check();
  }
}
