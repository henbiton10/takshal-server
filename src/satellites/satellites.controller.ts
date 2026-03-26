import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SatellitesService } from './satellites.service';
import { CreateSatelliteDto } from './dto/create-satellite.dto';
import { UpdateSatelliteDto } from './dto/update-satellite.dto';
import { Satellite } from './entities/satellite.entity';

@Controller('satellites')
export class SatellitesController {
  constructor(private readonly satellitesService: SatellitesService) {}

  @Post()
  create(@Body() createSatelliteDto: CreateSatelliteDto): Promise<Satellite> {
    return this.satellitesService.create(createSatelliteDto);
  }

  @Get('summary')
  findAllSummary(): Promise<Array<{ id: number; name: string }>> {
    return this.satellitesService.findAllSummary();
  }

  @Get()
  findAll(): Promise<Satellite[]> {
    return this.satellitesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Satellite | null> {
    return this.satellitesService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSatelliteDto: UpdateSatelliteDto,
  ): Promise<Satellite> {
    return this.satellitesService.update(+id, updateSatelliteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.satellitesService.remove(+id);
  }
}
