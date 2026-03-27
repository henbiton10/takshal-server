import { Controller, Get, Post, Body } from '@nestjs/common';
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

  @Post()
  create(@Body() body: { name: string }) {
    return this.terminalTypesService.create(body.name);
  }
}
