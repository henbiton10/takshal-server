import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationsService } from './stations.service';
import { StationsController } from './stations.controller';
import { Station } from './entities/station.entity';
import { StationConnectivity } from './entities/station-connectivity.entity';
import { StationAntenna } from './entities/station-antenna.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Station, StationConnectivity, StationAntenna])],
  controllers: [StationsController],
  providers: [StationsService],
  exports: [StationsService, TypeOrmModule],
})
export class StationsModule {}
