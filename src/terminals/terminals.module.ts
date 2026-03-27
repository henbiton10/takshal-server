import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminalsService } from './terminals.service';
import { TerminalsController } from './terminals.controller';
import { Terminal } from './entities/terminal.entity';
import { TerminalType } from '../terminal-types/entities/terminal-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Terminal, TerminalType])],
  controllers: [TerminalsController],
  providers: [TerminalsService],
  exports: [TerminalsService],
})
export class TerminalsModule {}
