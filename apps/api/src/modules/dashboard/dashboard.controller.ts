import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@task-app/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryResponseDto } from './dto/dashboard-summary-response.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Task totals, overdue, per-Manager rows and recent activity (Admin)' })
  @Get('summary')
  summary(): Promise<DashboardSummaryResponseDto> {
    return this.dashboardService.getSummary();
  }
}
