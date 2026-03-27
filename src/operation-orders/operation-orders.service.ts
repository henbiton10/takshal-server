import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OperationOrder } from './entities/operation-order.entity';
import { Allocation } from './entities/allocation.entity';
import { CreateOperationOrderDto } from './dto/create-operation-order.dto';
import { UpdateOperationOrderDto } from './dto/update-operation-order.dto';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { UpdateAllocationDto } from './dto/update-allocation.dto';
import { StationConnectivity } from '../stations/entities/station-connectivity.entity';
import { StationAntenna } from '../stations/entities/station-antenna.entity';
import { Terminal } from '../terminals/entities/terminal.entity';

@Injectable()
export class OperationOrdersService {
  constructor(
    @InjectRepository(OperationOrder)
    private operationOrdersRepository: Repository<OperationOrder>,
    @InjectRepository(Allocation)
    private allocationsRepository: Repository<Allocation>,
    @InjectRepository(StationConnectivity)
    private connectivityRepository: Repository<StationConnectivity>,
    @InjectRepository(StationAntenna)
    private antennaRepository: Repository<StationAntenna>,
    @InjectRepository(Terminal)
    private terminalRepository: Repository<Terminal>,
  ) {}

  async create(createDto: CreateOperationOrderDto): Promise<OperationOrder> {
    const order = this.operationOrdersRepository.create(createDto);
    return this.operationOrdersRepository.save(order);
  }

  async findAll(): Promise<OperationOrder[]> {
    return this.operationOrdersRepository.find({
      where: { isDeleted: false },
      relations: ['allocations'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllSummary(): Promise<Array<{ id: number; name: string; startDate: string; startTime: string; endDate: string; endTime: string }>> {
    return this.operationOrdersRepository.find({
      select: ['id', 'name', 'startDate', 'startTime', 'endDate', 'endTime'],
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<OperationOrder | null> {
    return this.operationOrdersRepository.findOne({
      where: { id, isDeleted: false },
      relations: [
        'allocations',
        'allocations.terminal',
        'allocations.terminal.station',
        'allocations.transmissionSatellite',
        'allocations.receptionSatellite',
        'allocations.transmissionAntenna',
        'allocations.transmissionAntenna.station',
        'allocations.receptionAntenna',
        'allocations.receptionAntenna.station',
        'allocations.transmissionConnectivity',
        'allocations.receptionConnectivity',
        'allocations.subAllocations',
        'allocations.subAllocations.terminal',
        'allocations.subAllocations.terminal.station',
        'allocations.subAllocations.transmissionSatellite',
        'allocations.subAllocations.receptionSatellite',
        'allocations.subAllocations.transmissionAntenna',
        'allocations.subAllocations.transmissionAntenna.station',
        'allocations.subAllocations.receptionAntenna',
        'allocations.subAllocations.receptionAntenna.station',
        'allocations.subAllocations.transmissionConnectivity',
        'allocations.subAllocations.receptionConnectivity',
      ],
    });
  }

  async update(id: number, updateDto: UpdateOperationOrderDto): Promise<OperationOrder> {
    const order = await this.operationOrdersRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!order) {
      throw new NotFoundException(`Operation order with ID ${id} not found`);
    }

    Object.assign(order, updateDto);
    await this.operationOrdersRepository.save(order);

    const result = await this.findOne(id);
    if (!result) {
      throw new NotFoundException(`Failed to retrieve updated operation order`);
    }
    return result;
  }

  async remove(id: number): Promise<void> {
    const order = await this.operationOrdersRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!order) {
      throw new NotFoundException(`Operation order with ID ${id} not found`);
    }

    order.isDeleted = true;
    await this.operationOrdersRepository.save(order);

    await this.allocationsRepository.update(
      { operationOrderId: id },
      { isDeleted: true },
    );
  }

  async addAllocation(
    operationOrderId: number,
    createDto: CreateAllocationDto,
  ): Promise<Allocation> {
    const order = await this.operationOrdersRepository.findOne({
      where: { id: operationOrderId, isDeleted: false },
    });

    if (!order) {
      throw new NotFoundException(`Operation order with ID ${operationOrderId} not found`);
    }

    let orderNumber: number;
    let subOrderNumber: number | null = null;

    if (createDto.parentAllocationId) {
      const parentAllocation = await this.allocationsRepository.findOne({
        where: { id: createDto.parentAllocationId, isDeleted: false },
      });

      if (!parentAllocation) {
        throw new NotFoundException(`Parent allocation with ID ${createDto.parentAllocationId} not found`);
      }

      orderNumber = parentAllocation.orderNumber;

      const maxSubOrder = await this.allocationsRepository
        .createQueryBuilder('allocation')
        .where('allocation.parent_allocation_id = :parentId', { parentId: createDto.parentAllocationId })
        .andWhere('allocation.is_deleted = false')
        .select('MAX(allocation.sub_order_number)', 'max')
        .getRawOne();

      subOrderNumber = (maxSubOrder?.max || 0) + 1;
    } else {
      const maxOrder = await this.allocationsRepository
        .createQueryBuilder('allocation')
        .where('allocation.operation_order_id = :orderId', { orderId: operationOrderId })
        .andWhere('allocation.parent_allocation_id IS NULL')
        .andWhere('allocation.is_deleted = false')
        .select('MAX(allocation.order_number)', 'max')
        .getRawOne();

      orderNumber = (maxOrder?.max || 0) + 1;
    }

    const allocation = this.allocationsRepository.create({
      ...createDto,
      operationOrderId,
      orderNumber,
      subOrderNumber,
    });

    const saved = await this.allocationsRepository.save(allocation);
    return this.findAllocationById(saved.id);
  }

  async updateAllocation(id: number, updateDto: UpdateAllocationDto): Promise<Allocation> {
    const allocation = await this.allocationsRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!allocation) {
      throw new NotFoundException(`Allocation with ID ${id} not found`);
    }

    Object.assign(allocation, updateDto);
    await this.allocationsRepository.save(allocation);

    return this.findAllocationById(id);
  }

  async removeAllocation(id: number): Promise<void> {
    const allocation = await this.allocationsRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!allocation) {
      throw new NotFoundException(`Allocation with ID ${id} not found`);
    }

    allocation.isDeleted = true;
    await this.allocationsRepository.save(allocation);

    await this.allocationsRepository.update(
      { parentAllocationId: id },
      { isDeleted: true },
    );

    if (allocation.parentAllocationId) {
      const siblingSubAllocations = await this.allocationsRepository.find({
        where: {
          parentAllocationId: allocation.parentAllocationId,
          isDeleted: false,
        },
        order: { subOrderNumber: 'ASC' },
      });

      for (let i = 0; i < siblingSubAllocations.length; i++) {
        if (siblingSubAllocations[i].subOrderNumber !== i + 1) {
          siblingSubAllocations[i].subOrderNumber = i + 1;
          await this.allocationsRepository.save(siblingSubAllocations[i]);
        }
      }
    } else {
      const siblingAllocations = await this.allocationsRepository.find({
        where: {
          operationOrderId: allocation.operationOrderId,
          parentAllocationId: null as unknown as number,
          isDeleted: false,
        },
        order: { orderNumber: 'ASC' },
      });

      for (let i = 0; i < siblingAllocations.length; i++) {
        if (siblingAllocations[i].orderNumber !== i + 1) {
          const oldOrderNumber = siblingAllocations[i].orderNumber;
          siblingAllocations[i].orderNumber = i + 1;
          await this.allocationsRepository.save(siblingAllocations[i]);

          await this.allocationsRepository.update(
            {
              parentAllocationId: siblingAllocations[i].id,
              isDeleted: false,
            },
            { orderNumber: i + 1 },
          );
        }
      }
    }
  }

  async addSubAllocation(
    parentAllocationId: number,
    createDto: CreateAllocationDto,
  ): Promise<Allocation> {
    const parentAllocation = await this.allocationsRepository.findOne({
      where: { id: parentAllocationId, isDeleted: false },
    });

    if (!parentAllocation) {
      throw new NotFoundException(`Parent allocation with ID ${parentAllocationId} not found`);
    }

    return this.addAllocation(parentAllocation.operationOrderId, {
      ...createDto,
      parentAllocationId,
    });
  }

  private async findAllocationById(id: number): Promise<Allocation> {
    const allocation = await this.allocationsRepository.findOne({
      where: { id, isDeleted: false },
      relations: [
        'terminal',
        'terminal.station',
        'transmissionSatellite',
        'receptionSatellite',
        'transmissionAntenna',
        'transmissionAntenna.station',
        'receptionAntenna',
        'receptionAntenna.station',
        'transmissionConnectivity',
        'receptionConnectivity',
        'subAllocations',
      ],
    });

    if (!allocation) {
      throw new NotFoundException(`Allocation with ID ${id} not found`);
    }

    return allocation;
  }

  async validateConnectivity(
    terminalId: number,
    antennaId: number,
    operationOrderId: number,
    excludeAllocationId?: number,
  ): Promise<{
    connectivityRequired: boolean;
    availableConnectivities: StationConnectivity[];
    availableChannels: Record<number, number[]>;
    error?: string;
    message?: string;
  }> {
    const terminal = await this.terminalRepository.findOne({
      where: { id: terminalId },
      relations: ['station'],
    });

    const antenna = await this.antennaRepository.findOne({
      where: { id: antennaId },
      relations: ['station'],
    });

    if (!terminal || !antenna) {
      return {
        connectivityRequired: false,
        availableConnectivities: [],
        availableChannels: {},
        error: 'not_found',
        message: 'Terminal or antenna not found',
      };
    }

    if (terminal.stationId === antenna.stationId) {
      return {
        connectivityRequired: false,
        availableConnectivities: [],
        availableChannels: {},
      };
    }

    const connectivities = await this.connectivityRepository.find({
      where: [
        { stationId: terminal.stationId, connectedStationId: antenna.stationId },
        { stationId: antenna.stationId, connectedStationId: terminal.stationId },
      ],
      relations: ['station', 'connectedStation'],
    });

    if (connectivities.length === 0) {
      return {
        connectivityRequired: true,
        availableConnectivities: [],
        availableChannels: {},
        error: 'no_connectivity',
        message: 'לא נמצאה קישוריות בין התחנות',
      };
    }

    const overlappingOrderIds = await this.getOverlappingOperationOrderIds(operationOrderId);

    const availableChannels = new Map<number, number[]>();

    for (const connectivity of connectivities) {
      const usedChannelsQuery = this.allocationsRepository
        .createQueryBuilder('allocation')
        .where('allocation.operation_order_id IN (:...orderIds)', { orderIds: overlappingOrderIds })
        .andWhere('allocation.is_deleted = false')
        .andWhere(
          '(allocation.transmission_connectivity_id = :connId OR allocation.reception_connectivity_id = :connId)',
          { connId: connectivity.id },
        );

      if (excludeAllocationId) {
        usedChannelsQuery.andWhere('allocation.id != :excludeId', { excludeId: excludeAllocationId });
      }

      const usedAllocations = await usedChannelsQuery.getMany();

      const usedChannelNumbers = new Set<number>();
      usedAllocations.forEach((alloc) => {
        if (alloc.transmissionConnectivityId === connectivity.id && alloc.transmissionChannelNumber) {
          usedChannelNumbers.add(alloc.transmissionChannelNumber);
        }
        if (alloc.receptionConnectivityId === connectivity.id && alloc.receptionChannelNumber) {
          usedChannelNumbers.add(alloc.receptionChannelNumber);
        }
      });

      const totalChannels = connectivity.channelCount;
      const available: number[] = [];
      for (let i = 1; i <= totalChannels; i++) {
        if (!usedChannelNumbers.has(i)) {
          available.push(i);
        }
      }

      availableChannels.set(connectivity.id, available);
    }

    const hasAvailableChannels = Array.from(availableChannels.values()).some(
      (channels) => channels.length > 0,
    );

    const availableChannelsObj: Record<number, number[]> = {};
    availableChannels.forEach((channels, connId) => {
      availableChannelsObj[connId] = channels;
    });

    if (!hasAvailableChannels) {
      return {
        connectivityRequired: true,
        availableConnectivities: connectivities,
        availableChannels: availableChannelsObj,
        error: 'channels_full',
        message: 'אין ערוצים פנויים בין התחנות הקרקעיות',
      };
    }

    return {
      connectivityRequired: true,
      availableConnectivities: connectivities,
      availableChannels: availableChannelsObj,
    };
  }

  private async getOverlappingOperationOrderIds(operationOrderId: number): Promise<number[]> {
    const currentOrder = await this.operationOrdersRepository.findOne({
      where: { id: operationOrderId, isDeleted: false },
    });

    if (!currentOrder) {
      return [operationOrderId];
    }

    const allOrders = await this.operationOrdersRepository.find({
      where: { isDeleted: false },
    });

    const currentStartDate = typeof currentOrder.startDate === 'string'
      ? currentOrder.startDate
      : new Date(currentOrder.startDate).toISOString().split('T')[0];
    const currentEndDate = typeof currentOrder.endDate === 'string'
      ? currentOrder.endDate
      : new Date(currentOrder.endDate).toISOString().split('T')[0];
    const currentStartTime = currentOrder.startTime.toString().substring(0, 5);
    const currentEndTime = currentOrder.endTime.toString().substring(0, 5);
    const currentStartDateTime = `${currentStartDate} ${currentStartTime}`;
    const currentEndDateTime = `${currentEndDate} ${currentEndTime}`;

    return allOrders
      .filter((order) => {
        const orderStartDate = typeof order.startDate === 'string'
          ? order.startDate
          : new Date(order.startDate).toISOString().split('T')[0];
        const orderEndDate = typeof order.endDate === 'string'
          ? order.endDate
          : new Date(order.endDate).toISOString().split('T')[0];
        const orderStartTime = order.startTime.toString().substring(0, 5);
        const orderEndTime = order.endTime.toString().substring(0, 5);
        const orderStartDateTime = `${orderStartDate} ${orderStartTime}`;
        const orderEndDateTime = `${orderEndDate} ${orderEndTime}`;

        return orderEndDateTime >= currentStartDateTime && orderStartDateTime <= currentEndDateTime;
      })
      .map((o) => o.id);
  }

  async getAntennasWithStationInfo(): Promise<
    Array<{
      id: number;
      size: number;
      frequencyBand: string;
      stationId: number;
      stationName: string;
      displayName: string;
      isDeleted: boolean;
    }>
  > {
    const antennas = await this.antennaRepository.find({
      relations: ['station'],
    });

    return antennas.map((antenna) => ({
      id: antenna.id,
      size: antenna.size,
      frequencyBand: antenna.frequencyBand,
      stationId: antenna.stationId,
      stationName: antenna.station?.name || '',
      displayName: `${antenna.station?.name || ''} - ${antenna.frequencyBand.toUpperCase()} - ${antenna.size}m`,
      isDeleted: antenna.station?.isDeleted || false,
    }));
  }

  async reorderAllocations(updates: Array<{ id: number; orderNumber: number; subOrderNumber: number | null }>): Promise<void> {
    for (const update of updates) {
      await this.allocationsRepository.update(update.id, {
        orderNumber: update.orderNumber,
        subOrderNumber: update.subOrderNumber,
      });
    }
  }

  async validateAntennaSatelliteConflicts(
    operationOrderId: number,
    transmissionAntennaId: number | null,
    transmissionSatelliteId: number | null,
    receptionAntennaId: number | null,
    receptionSatelliteId: number | null,
    excludeAllocationId?: number,
  ): Promise<{
    hasConflicts: boolean;
    conflicts: Array<{
      direction: 'transmission' | 'reception';
      antennaId: number;
      antennaName: string;
      conflictingSatelliteId: number;
      conflictingSatelliteName: string;
      requestedSatelliteId: number;
      requestedSatelliteName: string;
      operationOrderId: number;
      operationOrderName: string;
    }>;
  }> {
    const conflicts: Array<{
      direction: 'transmission' | 'reception';
      antennaId: number;
      antennaName: string;
      conflictingSatelliteId: number;
      conflictingSatelliteName: string;
      requestedSatelliteId: number;
      requestedSatelliteName: string;
      operationOrderId: number;
      operationOrderName: string;
    }> = [];

    const overlappingOrderIds = await this.getOverlappingOperationOrderIds(operationOrderId);

    if (overlappingOrderIds.length === 0) {
      return { hasConflicts: false, conflicts: [] };
    }

    const allocationsInOverlappingOrders = await this.allocationsRepository.find({
      where: {
        operationOrderId: In(overlappingOrderIds),
        isDeleted: false,
      },
      relations: [
        'operationOrder',
        'transmissionAntenna',
        'transmissionAntenna.station',
        'receptionAntenna',
        'receptionAntenna.station',
        'transmissionSatellite',
        'receptionSatellite',
      ],
    });

    const filteredAllocations = allocationsInOverlappingOrders.filter(
      (alloc) => !excludeAllocationId || alloc.id !== excludeAllocationId,
    );

    if (transmissionAntennaId && transmissionSatelliteId) {
      for (const alloc of filteredAllocations) {
        if (
          alloc.transmissionAntennaId === transmissionAntennaId &&
          alloc.transmissionSatelliteId !== transmissionSatelliteId
        ) {
          const antenna = await this.antennaRepository.findOne({
            where: { id: transmissionAntennaId },
            relations: ['station'],
          });
          const requestedSatellite = await this.operationOrdersRepository.manager
            .getRepository('Satellite')
            .findOne({ where: { id: transmissionSatelliteId } });

          conflicts.push({
            direction: 'transmission',
            antennaId: transmissionAntennaId,
            antennaName: antenna
              ? `${antenna.station?.name || ''} - ${antenna.frequencyBand.toUpperCase()} - ${antenna.size}m`
              : `אנטנה ${transmissionAntennaId}`,
            conflictingSatelliteId: alloc.transmissionSatelliteId,
            conflictingSatelliteName: alloc.transmissionSatellite?.name || `לוויין ${alloc.transmissionSatelliteId}`,
            requestedSatelliteId: transmissionSatelliteId,
            requestedSatelliteName: (requestedSatellite as { name: string } | null)?.name || `לוויין ${transmissionSatelliteId}`,
            operationOrderId: alloc.operationOrderId,
            operationOrderName: alloc.operationOrder?.name || `פקודה ${alloc.operationOrderId}`,
          });
          break;
        }

        if (
          alloc.receptionAntennaId === transmissionAntennaId &&
          alloc.receptionSatelliteId !== transmissionSatelliteId
        ) {
          const antenna = await this.antennaRepository.findOne({
            where: { id: transmissionAntennaId },
            relations: ['station'],
          });
          const requestedSatellite = await this.operationOrdersRepository.manager
            .getRepository('Satellite')
            .findOne({ where: { id: transmissionSatelliteId } });

          conflicts.push({
            direction: 'transmission',
            antennaId: transmissionAntennaId,
            antennaName: antenna
              ? `${antenna.station?.name || ''} - ${antenna.frequencyBand.toUpperCase()} - ${antenna.size}m`
              : `אנטנה ${transmissionAntennaId}`,
            conflictingSatelliteId: alloc.receptionSatelliteId,
            conflictingSatelliteName: alloc.receptionSatellite?.name || `לוויין ${alloc.receptionSatelliteId}`,
            requestedSatelliteId: transmissionSatelliteId,
            requestedSatelliteName: (requestedSatellite as { name: string } | null)?.name || `לוויין ${transmissionSatelliteId}`,
            operationOrderId: alloc.operationOrderId,
            operationOrderName: alloc.operationOrder?.name || `פקודה ${alloc.operationOrderId}`,
          });
          break;
        }
      }
    }

    if (receptionAntennaId && receptionSatelliteId) {
      for (const alloc of filteredAllocations) {
        if (
          alloc.receptionAntennaId === receptionAntennaId &&
          alloc.receptionSatelliteId !== receptionSatelliteId
        ) {
          const antenna = await this.antennaRepository.findOne({
            where: { id: receptionAntennaId },
            relations: ['station'],
          });
          const requestedSatellite = await this.operationOrdersRepository.manager
            .getRepository('Satellite')
            .findOne({ where: { id: receptionSatelliteId } });

          conflicts.push({
            direction: 'reception',
            antennaId: receptionAntennaId,
            antennaName: antenna
              ? `${antenna.station?.name || ''} - ${antenna.frequencyBand.toUpperCase()} - ${antenna.size}m`
              : `אנטנה ${receptionAntennaId}`,
            conflictingSatelliteId: alloc.receptionSatelliteId,
            conflictingSatelliteName: alloc.receptionSatellite?.name || `לוויין ${alloc.receptionSatelliteId}`,
            requestedSatelliteId: receptionSatelliteId,
            requestedSatelliteName: (requestedSatellite as { name: string } | null)?.name || `לוויין ${receptionSatelliteId}`,
            operationOrderId: alloc.operationOrderId,
            operationOrderName: alloc.operationOrder?.name || `פקודה ${alloc.operationOrderId}`,
          });
          break;
        }

        if (
          alloc.transmissionAntennaId === receptionAntennaId &&
          alloc.transmissionSatelliteId !== receptionSatelliteId
        ) {
          const antenna = await this.antennaRepository.findOne({
            where: { id: receptionAntennaId },
            relations: ['station'],
          });
          const requestedSatellite = await this.operationOrdersRepository.manager
            .getRepository('Satellite')
            .findOne({ where: { id: receptionSatelliteId } });

          conflicts.push({
            direction: 'reception',
            antennaId: receptionAntennaId,
            antennaName: antenna
              ? `${antenna.station?.name || ''} - ${antenna.frequencyBand.toUpperCase()} - ${antenna.size}m`
              : `אנטנה ${receptionAntennaId}`,
            conflictingSatelliteId: alloc.transmissionSatelliteId,
            conflictingSatelliteName: alloc.transmissionSatellite?.name || `לוויין ${alloc.transmissionSatelliteId}`,
            requestedSatelliteId: receptionSatelliteId,
            requestedSatelliteName: (requestedSatellite as { name: string } | null)?.name || `לוויין ${receptionSatelliteId}`,
            operationOrderId: alloc.operationOrderId,
            operationOrderName: alloc.operationOrder?.name || `פקודה ${alloc.operationOrderId}`,
          });
          break;
        }
      }
    }

    return { hasConflicts: conflicts.length > 0, conflicts };
  }

  async validateChannelConflicts(
    operationOrderId: number,
    transmissionConnectivityId: number | null,
    transmissionChannelNumber: number | null,
    receptionConnectivityId: number | null,
    receptionChannelNumber: number | null,
    excludeAllocationId?: number,
  ): Promise<{
    hasConflicts: boolean;
    conflicts: Array<{
      direction: 'transmission' | 'reception';
      connectivityId: number;
      channelNumber: number;
      operationOrderId: number;
      operationOrderName: string;
    }>;
  }> {
    const conflicts: Array<{
      direction: 'transmission' | 'reception';
      connectivityId: number;
      channelNumber: number;
      operationOrderId: number;
      operationOrderName: string;
    }> = [];

    const overlappingOrderIds = await this.getOverlappingOperationOrderIds(operationOrderId);

    if (overlappingOrderIds.length === 0) {
      return { hasConflicts: false, conflicts: [] };
    }

    const allocationsInOverlappingOrders = await this.allocationsRepository.find({
      where: {
        operationOrderId: In(overlappingOrderIds),
        isDeleted: false,
      },
      relations: ['operationOrder'],
    });

    const filteredAllocations = allocationsInOverlappingOrders.filter(
      (alloc) => !excludeAllocationId || alloc.id !== excludeAllocationId,
    );

    if (transmissionConnectivityId && transmissionChannelNumber) {
      for (const alloc of filteredAllocations) {
        if (
          (alloc.transmissionConnectivityId === transmissionConnectivityId &&
            alloc.transmissionChannelNumber === transmissionChannelNumber) ||
          (alloc.receptionConnectivityId === transmissionConnectivityId &&
            alloc.receptionChannelNumber === transmissionChannelNumber)
        ) {
          conflicts.push({
            direction: 'transmission',
            connectivityId: transmissionConnectivityId,
            channelNumber: transmissionChannelNumber,
            operationOrderId: alloc.operationOrderId,
            operationOrderName: alloc.operationOrder?.name || `פקודה ${alloc.operationOrderId}`,
          });
          break;
        }
      }
    }

    if (receptionConnectivityId && receptionChannelNumber) {
      for (const alloc of filteredAllocations) {
        if (
          (alloc.receptionConnectivityId === receptionConnectivityId &&
            alloc.receptionChannelNumber === receptionChannelNumber) ||
          (alloc.transmissionConnectivityId === receptionConnectivityId &&
            alloc.transmissionChannelNumber === receptionChannelNumber)
        ) {
          conflicts.push({
            direction: 'reception',
            connectivityId: receptionConnectivityId,
            channelNumber: receptionChannelNumber,
            operationOrderId: alloc.operationOrderId,
            operationOrderName: alloc.operationOrder?.name || `פקודה ${alloc.operationOrderId}`,
          });
          break;
        }
      }
    }

    return { hasConflicts: conflicts.length > 0, conflicts };
  }
}
