import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationsService } from './stations.service';
import { StationsController } from './stations.controller';
import { Station } from './entities/station.entity';
import { StationAntenna } from './entities/station-antenna.entity';
import { StationCratos } from './entities/station-cratos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Station, StationAntenna, StationCratos])],
  controllers: [StationsController],
  providers: [StationsService],
  exports: [StationsService, TypeOrmModule],
})
export class StationsModule {}
