import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminalTypesService } from './terminal-types.service';
import { TerminalTypesController } from './terminal-types.controller';
import { TerminalType } from './entities/terminal-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TerminalType])],
  controllers: [TerminalTypesController],
  providers: [TerminalTypesService],
  exports: [TerminalTypesService],
})
export class TerminalTypesModule {}
