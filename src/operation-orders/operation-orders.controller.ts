import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { OperationOrdersService } from './operation-orders.service';
import { CreateOperationOrderDto } from './dto/create-operation-order.dto';
import { UpdateOperationOrderDto } from './dto/update-operation-order.dto';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';
import { ReorderAllocationsDto } from './dto/reorder-allocations.dto';
import { OperationOrder } from './entities/operation-order.entity';
import { Allocation } from './entities/allocation.entity';

@Controller('operation-orders')
export class OperationOrdersController {
  constructor(private readonly operationOrdersService: OperationOrdersService) {}

  @Post()
  create(@Body() createDto: CreateOperationOrderDto): Promise<OperationOrder> {
    return this.operationOrdersService.create(createDto);
  }

  @Get()
  findAll(): Promise<OperationOrder[]> {
    return this.operationOrdersService.findAll();
  }

  @Get('summary')
  findAllSummary(): Promise<Array<{ id: number; name: string; date: string; time: string }>> {
    return this.operationOrdersService.findAllSummary();
  }

  @Get('antennas')
  getAntennasWithStationInfo() {
    return this.operationOrdersService.getAntennasWithStationInfo();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<OperationOrder | null> {
    return this.operationOrdersService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateOperationOrderDto,
  ): Promise<OperationOrder> {
    return this.operationOrdersService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.operationOrdersService.remove(+id);
  }

  @Post(':id/allocations')
  addAllocation(
    @Param('id') id: string,
    @Body() createDto: CreateAllocationDto,
  ): Promise<Allocation> {
    return this.operationOrdersService.addAllocation(+id, createDto);
  }

  @Post('validate-connectivity')
  validateConnectivity(
    @Body()
    body: {
      terminalId: number;
      antennaId: number;
      operationOrderId: number;
      excludeAllocationId?: number;
    },
  ) {
    return this.operationOrdersService.validateConnectivity(
      body.terminalId,
      body.antennaId,
      body.operationOrderId,
      body.excludeAllocationId,
    );
  }

  @Post('reorder-allocations')
  reorderAllocations(@Body() reorderDto: ReorderAllocationsDto): Promise<void> {
    return this.operationOrdersService.reorderAllocations(reorderDto.allocations);
  }
}

@Controller('allocations')
export class AllocationsController {
  constructor(private readonly operationOrdersService: OperationOrdersService) {}

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAllocationDto,
  ): Promise<Allocation> {
    return this.operationOrdersService.updateAllocation(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.operationOrdersService.removeAllocation(+id);
  }

  @Post(':id/sub-allocation')
  async addSubAllocation(
    @Param('id') parentId: string,
    @Body() createDto: CreateAllocationDto,
  ): Promise<Allocation> {
    return this.operationOrdersService.addSubAllocation(+parentId, createDto);
  }
}
