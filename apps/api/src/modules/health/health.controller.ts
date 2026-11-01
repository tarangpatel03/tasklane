import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @ApiOperation({ summary: 'API and database health' })
  @Get()
  check(): Promise<{ status: 'ok'; database: 'up' }> {
    return this.healthService.check();
  }
}
