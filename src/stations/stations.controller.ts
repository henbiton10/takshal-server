import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { StationsService } from './stations.service';
import { Station } from './entities/station.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Post()
  create(@Body() createStationDto: CreateStationDto): Promise<Station> {
    return this.stationsService.create(createStationDto);
  }

  @Get('summary')
  findAllSummary(): Promise<Array<{ id: number; name: string }>> {
    return this.stationsService.findAllSummary();
  }

  @Get()
  findAll(): Promise<Station[]> {
    return this.stationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Station | null> {
    return this.stationsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateStationDto: UpdateStationDto): Promise<Station> {
    return this.stationsService.update(+id, updateStationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.stationsService.remove(+id);
  }
}
