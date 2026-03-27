import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  DashboardDataDto,
  DashboardStationDto,
  DashboardSatelliteDto,
  DashboardNetworkDto,
} from './dto/dashboard.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ): Promise<DashboardDataDto> {
    return this.dashboardService.getDashboardData(startDate, endDate, startTime, endTime);
  }

  @Get('stations')
  async getStationsWithTerminals(): Promise<DashboardStationDto[]> {
    return this.dashboardService.getStationsWithTerminals();
  }

  @Get('satellites')
  async getSatellitesWithAllocations(): Promise<DashboardSatelliteDto[]> {
    return this.dashboardService.getSatellitesWithAllocations();
  }

  @Get('networks')
  async getNetworksWithTerminals(): Promise<DashboardNetworkDto[]> {
    return this.dashboardService.getNetworksWithTerminals();
  }
}
