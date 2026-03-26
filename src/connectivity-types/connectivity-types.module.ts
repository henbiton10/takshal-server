import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectivityTypesService } from './connectivity-types.service';
import { ConnectivityTypesController } from './connectivity-types.controller';
import { ConnectivityType } from './entities/connectivity-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConnectivityType])],
  controllers: [ConnectivityTypesController],
  providers: [ConnectivityTypesService],
  exports: [ConnectivityTypesService],
})
export class ConnectivityTypesModule {}
