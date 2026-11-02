import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROUTES, Role } from '@task-app/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryResponseDto } from './dto/dashboardSummaryResponse.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller(ROUTES.dashboard.controller)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Task totals, overdue, per-Manager rows and recent activity (Admin)' })
  @Get(ROUTES.dashboard.summary)
  summary(): Promise<DashboardSummaryResponseDto> {
    return this.dashboardService.getSummary();
  }
}
