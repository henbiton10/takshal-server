import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SatellitesService } from './satellites.service';
import { SatellitesController } from './satellites.controller';
import { Satellite } from './entities/satellite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Satellite])],
  controllers: [SatellitesController],
  providers: [SatellitesService],
  exports: [SatellitesService],
})
export class SatellitesModule {}
