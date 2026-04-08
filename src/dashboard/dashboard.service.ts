import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { Station } from '../stations/entities/station.entity';
import { StationAntenna } from '../stations/entities/station-antenna.entity';
import { StationConnectivity } from '../stations/entities/station-connectivity.entity';
import { Terminal } from '../terminals/entities/terminal.entity';
import { Satellite } from '../satellites/entities/satellite.entity';
import { Network } from '../networks/entities/network.entity';
import { Allocation } from '../operation-orders/entities/allocation.entity';
import { OperationOrder } from '../operation-orders/entities/operation-order.entity';
import {
  DashboardDataDto,
  DashboardStationDto,
  DashboardTerminalDto,
  DashboardAntennaDto,
  DashboardSatelliteDto,
  DashboardNetworkDto,
  TerminalAllocationInfoDto,
  SatelliteAllocationDto,
  AntennaChannelStatusDto,
} from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  private activeAllocationsCache: Allocation[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5000; // 5 seconds cache

  constructor(
    @InjectRepository(Station)
    private stationsRepository: Repository<Station>,
    @InjectRepository(Terminal)
    private terminalsRepository: Repository<Terminal>,
    @InjectRepository(Satellite)
    private satellitesRepository: Repository<Satellite>,
    @InjectRepository(Network)
    private networksRepository: Repository<Network>,
    @InjectRepository(StationAntenna)
    private antennasRepository: Repository<StationAntenna>,
    @InjectRepository(StationConnectivity)
    private connectivityRepository: Repository<StationConnectivity>,
    @InjectRepository(Allocation)
    private allocationsRepository: Repository<Allocation>,
    @InjectRepository(OperationOrder)
    private operationOrdersRepository: Repository<OperationOrder>,
  ) {}

  async getDashboardData(
    startDate?: string,
    endDate?: string,
    startTime?: string,
    endTime?: string,
  ): Promise<DashboardDataDto> {
    const [stations, satellites, networks] = await Promise.all([
      this.getStationsWithTerminals(startDate, endDate, startTime, endTime),
      this.getSatellitesWithAllocations(startDate, endDate, startTime, endTime),
      this.getNetworksWithTerminals(startDate, endDate, startTime, endTime),
    ]);

    return {
      stations,
      satellites,
      networks,
      lastUpdated: new Date().toISOString(),
    };
  }

  async getStationsWithTerminals(
    startDate?: string,
    endDate?: string,
    startTime?: string,
    endTime?: string,
  ): Promise<DashboardStationDto[]> {
    const stations = await this.stationsRepository.find({
      where: { isDeleted: false },
      relations: ['antennas'],
      order: { name: 'ASC' },
    });

    const terminals = await this.terminalsRepository.find({
      where: { isDeleted: false },
      relations: ['station'],
    });

    const activeAllocations = await this.getActiveAllocations(
      startDate,
      endDate,
      startTime,
      endTime,
    );
    const activeTerminalIds = new Set(activeAllocations.map((allocation) => allocation.terminalId));

    return stations.map((station) => {
      const stationTerminals = terminals.filter(
        (terminal) => terminal.stationId === station.id,
      );

      const dashboardTerminals: DashboardTerminalDto[] = stationTerminals.map(
        (terminal) => {
          const terminalAllocations = activeAllocations.filter(
            (a) => a.terminalId === terminal.id,
          );

          const allocations: TerminalAllocationInfoDto[] = terminalAllocations.flatMap(
            (alloc) => {
              const results: TerminalAllocationInfoDto[] = [];

                if (alloc.transmissionSatellite) {
                const txAntennaName = alloc.transmissionAntenna?.station?.name || station.name;
                const txAntennaSize = Number(alloc.transmissionAntenna?.size) || '';
                const txFreqBand = ((alloc.transmissionAntenna?.frequencyBand as 'ka' | 'ku') || (terminal.frequencyBand as 'ka' | 'ku') || 'ku').toUpperCase();
                results.push({
                  direction: 'transmission',
                  frequency: Number(alloc.transmissionFrequency),
                  satellite: alloc.transmissionSatellite?.name || '',
                  antenna: `${txAntennaName} ${txAntennaSize}מ' ${txFreqBand}`,
                  antennaSize: Number(alloc.transmissionAntenna?.size) || 0,
                  frequencyBand: (terminal.frequencyBand as 'ka' | 'ku') || 'ku',
                  channel: alloc.transmissionChannelNumber?.toString() || '',
                  connectivity: alloc.transmissionConnectivity?.communicationType,
                });
              }

              if (alloc.receptionSatellite) {
                const rxAntennaName = alloc.receptionAntenna?.station?.name || station.name;
                const rxAntennaSize = Number(alloc.receptionAntenna?.size) || '';
                const rxFreqBand = ((alloc.receptionAntenna?.frequencyBand as 'ka' | 'ku') || (terminal.frequencyBand as 'ka' | 'ku') || 'ku').toUpperCase();
                results.push({
                  direction: 'reception',
                  frequency: Number(alloc.receptionFrequency),
                  satellite: alloc.receptionSatellite?.name || '',
                  antenna: `${rxAntennaName} ${rxAntennaSize}מ' ${rxFreqBand}`,
                  antennaSize: Number(alloc.receptionAntenna?.size) || 0,
                  frequencyBand: (terminal.frequencyBand as 'ka' | 'ku') || 'ku',
                  channel: alloc.receptionChannelNumber?.toString() || '',
                  connectivity: alloc.receptionConnectivity?.communicationType,
                });
              }

              return results;
            },
          );

          return {
            id: terminal.id,
            name: terminal.name,
            stationId: terminal.stationId,
            stationName: station.name,
            frequencyBand: (terminal.frequencyBand as 'ka' | 'ku') || 'ku',
            readinessStatus: terminal.readinessStatus as
              | 'ready'
              | 'partly_ready'
              | 'damaged',
            isAllocated: allocations.length > 0,
            allocations,
          };
        },
      );

      const dashboardAntennas: DashboardAntennaDto[] = (station.antennas || [])
        .filter((antenna) =>
          activeAllocations.some(
            (allocation) =>
              allocation.transmissionAntennaId === antenna.id ||
              allocation.receptionAntennaId === antenna.id,
          ),
        )
        .map((antenna) => {
          const channels = this.computeAntennaChannelUsage(
            antenna.id,
            activeAllocations,
          );

          return {
            id: antenna.id,
            size: Number(antenna.size),
            frequencyBand: (antenna.frequencyBand as 'ka' | 'ku') || 'ku',
            stationId: station.id,
            channels,
          };
        });

      return {
        id: station.id,
        name: station.name,
        organizationalAffiliation: this.mapAffiliation(
          station.organizationalAffiliation,
        ),
        readinessStatus: station.readinessStatus as
          | 'ready'
          | 'partly_ready'
          | 'damaged',
        terminals: dashboardTerminals,
        antennas: dashboardAntennas,
      };
    });
  }

  async getSatellitesWithAllocations(
    startDate?: string,
    endDate?: string,
    startTime?: string,
    endTime?: string,
  ): Promise<DashboardSatelliteDto[]> {
    const satellites = await this.satellitesRepository.find({
      where: { isDeleted: false },
      order: { name: 'ASC' },
    });

    const activeAllocations = await this.getActiveAllocations(
      startDate,
      endDate,
      startTime,
      endTime,
    );

    return satellites
      .map((satellite) => {
      const allocations: SatelliteAllocationDto[] = [];

      activeAllocations.forEach((alloc) => {
        const isTransmissionMatch = alloc.transmissionSatelliteId === satellite.id;
        const isReceptionMatch = alloc.receptionSatelliteId === satellite.id;
        
        if (isTransmissionMatch || isReceptionMatch) {
          const antennaSize = isTransmissionMatch && isReceptionMatch
            ? Number(alloc.transmissionAntenna?.size) || Number(alloc.receptionAntenna?.size) || 0
            : isTransmissionMatch
            ? Number(alloc.transmissionAntenna?.size) || 0
            : Number(alloc.receptionAntenna?.size) || 0;

          const direction = isTransmissionMatch && isReceptionMatch
            ? 'transmission'
            : isTransmissionMatch
            ? 'transmission'
            : 'reception';

          allocations.push({
            stationId: alloc.terminal?.stationId || 0,
            stationName: alloc.terminal?.station?.name || '',
            terminalId: alloc.terminalId,
            terminalName: alloc.terminal?.name || '',
            frequencyBand:
              (alloc.terminal?.frequencyBand as 'ka' | 'ku') || 'ku',
            antennaSize,
            direction,
          });
        }
      });

      return {
        id: satellite.id,
        name: satellite.name,
        affiliation: (
          satellite.affiliation === 'israeli' ? 'local' : 'global'
        ) as 'local' | 'global',
        hasFrequencyConverter: satellite.hasFrequencyConverter,
        readinessStatus: satellite.readinessStatus as
          | 'ready'
          | 'partly_ready'
          | 'damaged',
        allocations,
      };
    })
      .filter((satellite) => satellite.allocations.length > 0);
  }

  async getNetworksWithTerminals(
    startDate?: string,
    endDate?: string,
    startTime?: string,
    endTime?: string,
  ): Promise<DashboardNetworkDto[]> {
    const networks = await this.networksRepository.find({
      where: { isDeleted: false },
      order: { name: 'ASC' },
    });

    const terminals = await this.terminalsRepository.find({
      where: { isDeleted: false },
    });

    const activeAllocations = await this.getActiveAllocations(
      startDate,
      endDate,
      startTime,
      endTime,
    );
    const activeTerminalIds = new Set(activeAllocations.map((allocation) => allocation.terminalId));

    return networks
      .map((network) => {
      const networkTerminals = terminals.filter(
        (terminal) =>
          terminal.terminalTypeId === network.terminalTypeId &&
          activeTerminalIds.has(terminal.id),
      );

      return {
        id: network.id,
        name: network.name,
        terminalTypeId: network.terminalTypeId,
        connectivityTypeId: network.connectivityTypeId,
        terminals: networkTerminals.map((t) => ({ id: t.id, name: t.name })),
      };
    })
      .filter((network) => network.terminals.length > 0);
  }

  private async getActiveAllocations(
    startDate?: string,
    endDate?: string,
    startTime?: string,
    endTime?: string,
  ): Promise<Allocation[]> {
    const useCurrentTime = !startDate || !endDate;
    
    if (useCurrentTime) {
      const now = Date.now();
      if (this.activeAllocationsCache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
        return this.activeAllocationsCache;
      }
    }

    const currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0];
    const currentTime = currentDate.toTimeString().split(' ')[0].substring(0, 5);

    const selectedStartDate = startDate || today;
    const selectedEndDate = endDate || today;
    const selectedStartTime = startTime || '00:00';
    const selectedEndTime = endTime || '23:59';

    const activeOrders = await this.operationOrdersRepository.find({
      where: { isDeleted: false },
    });

    const activeOrderIds = activeOrders
      .filter((order) => {
        const orderStartDate = typeof order.startDate === 'string' 
          ? order.startDate 
          : new Date(order.startDate).toISOString().split('T')[0];
        const orderEndDate = typeof order.endDate === 'string' 
          ? order.endDate 
          : new Date(order.endDate).toISOString().split('T')[0];
        
        const orderStartTime = order.startTime.toString().substring(0, 5);
        const orderEndTime = order.endTime.toString().substring(0, 5);

        if (useCurrentTime) {
          const currentDateTime = `${today} ${currentTime}`;
          const orderStartDateTime = `${orderStartDate} ${orderStartTime}`;
          const orderEndDateTime = `${orderEndDate} ${orderEndTime}`;
          
          return orderStartDateTime <= currentDateTime && orderEndDateTime >= currentDateTime;
        } else {
          const selectedStartDateTime = `${selectedStartDate} ${selectedStartTime}`;
          const selectedEndDateTime = `${selectedEndDate} ${selectedEndTime}`;
          const orderStartDateTime = `${orderStartDate} ${orderStartTime}`;
          const orderEndDateTime = `${orderEndDate} ${orderEndTime}`;
          
          return orderEndDateTime >= selectedStartDateTime && orderStartDateTime <= selectedEndDateTime;
        }
      })
      .map((o) => o.id);

    if (activeOrderIds.length === 0) {
      if (useCurrentTime) {
        this.activeAllocationsCache = [];
        this.cacheTimestamp = Date.now();
      }
      return [];
    }

    const allAllocations = await this.allocationsRepository.find({
      where: {
        operationOrderId: In(activeOrderIds),
        isDeleted: false,
      },
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
      ],
    });

    if (useCurrentTime) {
      this.activeAllocationsCache = allAllocations;
      this.cacheTimestamp = Date.now();
    }
    
    return allAllocations;
  }

  private computeAntennaChannelUsage(
    antennaId: number,
    allocations: Allocation[],
  ): AntennaChannelStatusDto[] {
    const channelTypes = ['RF3', 'RF12', 'RFO'];
    const totalChannelsPerType = 7;

    return channelTypes.map((channelType) => {
      const usedCount = allocations.filter((alloc) => {
        const isTransmissionMatch =
          alloc.transmissionAntennaId === antennaId &&
          alloc.transmissionChannelNumber !== null;
        const isReceptionMatch =
          alloc.receptionAntennaId === antennaId &&
          alloc.receptionChannelNumber !== null;
        return isTransmissionMatch || isReceptionMatch;
      }).length;

      return {
        channelType,
        used: Math.min(usedCount, totalChannelsPerType),
        total: totalChannelsPerType,
      };
    });
  }

  private mapAffiliation(
    affiliation: string,
  ): 'airforce' | 'navy' | 'ground' | 'intelligence' | 'other' {
    switch (affiliation) {
      case 'airforce':
        return 'airforce';
      case 'tikshuv':
        return 'intelligence';
      default:
        return 'other';
    }
  }
}
