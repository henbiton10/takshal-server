import { Controller, Get } from '@nestjs/common';
import { ConnectivityTypesService } from './connectivity-types.service';

@Controller('connectivity-types')
export class ConnectivityTypesController {
  constructor(
    private readonly connectivityTypesService: ConnectivityTypesService,
  ) {}

  @Get()
  findAll() {
    return this.connectivityTypesService.findAll();
  }

  @Get('summary')
  findAllSummary() {
    return this.connectivityTypesService.findAllSummary();
  }
}
