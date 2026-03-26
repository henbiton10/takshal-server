import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworksService } from './networks.service';
import { NetworksController } from './networks.controller';
import { Network } from './entities/network.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Network])],
  controllers: [NetworksController],
  providers: [NetworksService],
  exports: [NetworksService],
})
export class NetworksModule {}
