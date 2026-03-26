import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TerminalsService } from './terminals.service';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';
import { Terminal } from './entities/terminal.entity';

@Controller('terminals')
export class TerminalsController {
  constructor(private readonly terminalsService: TerminalsService) {}

  @Post()
  create(@Body() createTerminalDto: CreateTerminalDto): Promise<Terminal> {
    return this.terminalsService.create(createTerminalDto);
  }

  @Get('summary')
  findAllSummary(): Promise<Array<{ id: number; name: string }>> {
    return this.terminalsService.findAllSummary();
  }

  @Get()
  findAll(): Promise<Terminal[]> {
    return this.terminalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Terminal | null> {
    return this.terminalsService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTerminalDto: UpdateTerminalDto,
  ): Promise<Terminal> {
    return this.terminalsService.update(+id, updateTerminalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.terminalsService.remove(+id);
  }
}
