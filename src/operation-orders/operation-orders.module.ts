import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationOrder } from './entities/operation-order.entity';
import { Allocation } from './entities/allocation.entity';
import { OperationOrdersService } from './operation-orders.service';
import { OperationOrdersController, AllocationsController } from './operation-orders.controller';
import { StationConnectivity } from '../stations/entities/station-connectivity.entity';
import { StationAntenna } from '../stations/entities/station-antenna.entity';
import { Terminal } from '../terminals/entities/terminal.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OperationOrder,
      Allocation,
      StationConnectivity,
      StationAntenna,
      Terminal,
    ]),
  ],
  controllers: [OperationOrdersController, AllocationsController],
  providers: [OperationOrdersService],
  exports: [OperationOrdersService],
})
export class OperationOrdersModule {}
