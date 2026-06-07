import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminalsService } from './terminals.service';
import { TerminalsController } from './terminals.controller';
import { Terminal } from './entities/terminal.entity';
import { TerminalConnectivity } from './entities/terminal-connectivity.entity';
import { TerminalType } from '../terminal-types/entities/terminal-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Terminal, TerminalConnectivity, TerminalType])],
  controllers: [TerminalsController],
  providers: [TerminalsService],
  exports: [TerminalsService],
})
export class TerminalsModule {}
