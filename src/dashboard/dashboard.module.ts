import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Station } from '../stations/entities/station.entity';
import { StationAntenna } from '../stations/entities/station-antenna.entity';
import { StationConnectivity } from '../stations/entities/station-connectivity.entity';
import { Terminal } from '../terminals/entities/terminal.entity';
import { Satellite } from '../satellites/entities/satellite.entity';
import { Network } from '../networks/entities/network.entity';
import { Allocation } from '../operation-orders/entities/allocation.entity';
import { OperationOrder } from '../operation-orders/entities/operation-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Station,
      StationAntenna,
      StationConnectivity,
      Terminal,
      Satellite,
      Network,
      Allocation,
      OperationOrder,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
