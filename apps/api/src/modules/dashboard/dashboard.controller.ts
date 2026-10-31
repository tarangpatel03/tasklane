import { Controller, Get } from '@nestjs/common';
import { Role } from '@task-app/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardSummaryResponseDto } from './dto/dashboard-summary-response.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles(Role.ADMIN)
  @Get('summary')
  summary(): Promise<DashboardSummaryResponseDto> {
    return this.dashboardService.getSummary();
  }
}
