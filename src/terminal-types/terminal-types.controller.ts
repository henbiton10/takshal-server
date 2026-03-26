import { Controller, Get } from '@nestjs/common';
import { TerminalTypesService } from './terminal-types.service';

@Controller('terminal-types')
export class TerminalTypesController {
  constructor(
    private readonly terminalTypesService: TerminalTypesService,
  ) {}

  @Get()
  findAll() {
    return this.terminalTypesService.findAll();
  }

  @Get('summary')
  findAllSummary() {
    return this.terminalTypesService.findAllSummary();
  }
}
