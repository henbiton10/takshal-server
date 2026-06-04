import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DB_SCHEMA } from '../database/schema.constants';
import { Station } from './entities/station.entity';
import { StationConnectivity } from './entities/station-connectivity.entity';
import { StationAntenna } from './entities/station-antenna.entity';
import { StationCratos } from './entities/station-cratos.entity';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

@Injectable()
export class StationsService {
  constructor(
    @InjectRepository(Station)
    private stationsRepository: Repository<Station>,
    @InjectRepository(StationConnectivity)
    private connectivityRepository: Repository<StationConnectivity>,
    @InjectRepository(StationAntenna)
    private antennaRepository: Repository<StationAntenna>,
    @InjectRepository(StationCratos)
    private cratosRepository: Repository<StationCratos>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createStationDto: CreateStationDto): Promise<Station> {
    const station = this.stationsRepository.create({
      name: createStationDto.name,
      organizationalAffiliation: createStationDto.organizationalAffiliation,
      readinessStatus: createStationDto.readinessStatus,
      notes: createStationDto.notes,
    });
    
    const savedStation = await this.stationsRepository.save(station);

    if (createStationDto.connectivities && createStationDto.connectivities.length > 0) {
      const connectivities = createStationDto.connectivities.map((conn) =>
        this.connectivityRepository.create({
          stationId: savedStation.id,
          connectedStationId: conn.connectedStationId,
          communicationType: conn.communicationType,
          channelCount: conn.channelCount,
          crNumber: conn.crNumber || null,
          transitNetwork: conn.transitNetwork || null,
          linkStationId: conn.linkStationId || null,
          linkCrNumber: conn.linkCrNumber || null,
          linkAntennaSize: conn.linkAntennaSize || null,
          linkFrequencyBand: conn.linkFrequencyBand || null,
        }),
      );
      await this.connectivityRepository.save(connectivities);
    }

    if (createStationDto.antennas && createStationDto.antennas.length > 0) {
      const antennas = createStationDto.antennas.map((ant) =>
        this.antennaRepository.create({
          stationId: savedStation.id,
          size: ant.size,
          frequencyBand: ant.frequencyBand,
        }),
      );
      await this.antennaRepository.save(antennas);
    }

    if (createStationDto.cratoses && createStationDto.cratoses.length > 0) {
      const cratoses = createStationDto.cratoses.map((cratos) =>
        this.cratosRepository.create({
          stationId: savedStation.id,
          number: cratos.number,
        }),
      );
      await this.cratosRepository.save(cratoses);
    }

    const result = await this.findOne(savedStation.id);
    if (!result) {
      throw new NotFoundException(`Failed to retrieve created station`);
    }

    this.eventEmitter.emit('entity.created', {
      entity: 'station',
      id: result.id,
      data: result,
    });

    return result;
  }

  async findAll(): Promise<Station[]> {
    const stations = await this.stationsRepository.find({
      where: { isDeleted: false },
      relations: [
        'connectivities', 'connectivities.connectedStation',
        'reverseConnectivities', 'reverseConnectivities.station',
        'antennas',
        'cratoses',
        'terminals',
      ],
    });

    for (const station of stations) {
      this.mergeReverseConnectivities(station);
    }

    return stations;
  }

  async findAllSummary(): Promise<Array<{ id: number; name: string }>> {
    return this.stationsRepository.find({
      select: ['id', 'name'],
      where: { isDeleted: false },
    });
  }

  async findOne(id: number): Promise<Station | null> {
    const station = await this.stationsRepository.findOne({
      where: { id, isDeleted: false },
      relations: [
        'connectivities', 'connectivities.connectedStation', 'connectivities.linkStation',
        'reverseConnectivities', 'reverseConnectivities.station', 'reverseConnectivities.linkStation',
        'antennas',
        'cratoses',
        'terminals',
      ],
    });

    if (station) {
      this.mergeReverseConnectivities(station);
    }

    return station;
  }

  private mergeReverseConnectivities(station: Station): void {
    const reverseAsForward = (station.reverseConnectivities || []).map((rc) => {
      const flipped = new StationConnectivity();
      flipped.id = rc.id;
      flipped.stationId = rc.connectedStationId;
      flipped.connectedStationId = rc.stationId;
      flipped.communicationType = rc.communicationType;
      flipped.channelCount = rc.channelCount;
      flipped.crNumber = rc.crNumber;
      flipped.transitNetwork = rc.transitNetwork;
      flipped.linkStationId = rc.linkStationId;
      flipped.linkCrNumber = rc.linkCrNumber;
      flipped.linkAntennaSize = rc.linkAntennaSize;
      flipped.linkFrequencyBand = rc.linkFrequencyBand;
      flipped.createdAt = rc.createdAt;
      flipped.connectedStation = rc.station;
      flipped.linkStation = rc.linkStation;
      return flipped;
    });

    station.connectivities = [
      ...(station.connectivities || []),
      ...reverseAsForward,
    ];

    delete (station as any).reverseConnectivities;
  }

  async update(id: number, updateStationDto: UpdateStationDto): Promise<Station> {
    const station = await this.stationsRepository.findOne({
      where: { id, isDeleted: false },
    });
    
    if (!station) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }

    station.name = updateStationDto.name;
    station.organizationalAffiliation = updateStationDto.organizationalAffiliation;
    station.readinessStatus = updateStationDto.readinessStatus;
    station.notes = updateStationDto.notes || '';
    
    await this.stationsRepository.save(station);

    // 1. Update Connectivities
    if (updateStationDto.connectivities) {
      const existingConnectivities = await this.connectivityRepository.find({
        where: [{ stationId: id }, { connectedStationId: id }],
      });

      // Simple comparison: check if the new list matches the old list by properties
      const isConnectivityChanged = updateStationDto.connectivities.length !== existingConnectivities.length ||
        updateStationDto.connectivities.some(nc => !existingConnectivities.some(ec => 
          ec.connectedStationId === nc.connectedStationId && 
          ec.communicationType === nc.communicationType && 
          ec.channelCount === nc.channelCount &&
          ec.crNumber === nc.crNumber &&
          ec.transitNetwork === nc.transitNetwork &&
          ec.linkStationId === nc.linkStationId &&
          ec.linkCrNumber === nc.linkCrNumber &&
          ec.linkAntennaSize === nc.linkAntennaSize &&
          ec.linkFrequencyBand === nc.linkFrequencyBand
        ));

      if (isConnectivityChanged) {
        const connectivityIdsToDelete = existingConnectivities.map((c) => c.id);
        if (connectivityIdsToDelete.length > 0) {
          await this.connectivityRepository.manager.query(
            `UPDATE "${DB_SCHEMA}".allocations SET transmission_connectivity_id = NULL WHERE transmission_connectivity_id = ANY($1)`,
            [connectivityIdsToDelete],
          );
          await this.connectivityRepository.manager.query(
            `UPDATE "${DB_SCHEMA}".allocations SET reception_connectivity_id = NULL WHERE reception_connectivity_id = ANY($1)`,
            [connectivityIdsToDelete],
          );
        }
        await this.connectivityRepository.delete({ stationId: id });
        await this.connectivityRepository.delete({ connectedStationId: id });

        const connectivities = updateStationDto.connectivities.map((conn) =>
          this.connectivityRepository.create({
            stationId: id,
            connectedStationId: conn.connectedStationId,
            communicationType: conn.communicationType,
            channelCount: conn.channelCount,
            crNumber: conn.crNumber || null,
            transitNetwork: conn.transitNetwork || null,
            linkStationId: conn.linkStationId || null,
            linkCrNumber: conn.linkCrNumber || null,
            linkAntennaSize: conn.linkAntennaSize || null,
            linkFrequencyBand: conn.linkFrequencyBand || null,
          }),
        );
        await this.connectivityRepository.save(connectivities);
      }
    }

    // 2. Update Antennas
    if (updateStationDto.antennas) {
      const existingAntennas = await this.antennaRepository.find({
        where: { stationId: id },
      });

      // Check if antennas actually changed (size and band)
      const isAntennasChanged = updateStationDto.antennas.length !== existingAntennas.length ||
        updateStationDto.antennas.some(na => !existingAntennas.some(ea =>
          Number(ea.size) === Number(na.size) &&
          ea.frequencyBand === na.frequencyBand
        ));

      if (isAntennasChanged) {
        const antennaIdsToDelete = existingAntennas.map((a) => a.id);
        if (antennaIdsToDelete.length > 0) {
          await this.antennaRepository.manager.query(
            `DELETE FROM "${DB_SCHEMA}".allocations WHERE transmission_antenna_id = ANY($1) OR reception_antenna_id = ANY($1)`,
            [antennaIdsToDelete],
          );
        }
        await this.antennaRepository.delete({ stationId: id });

        const antennas = updateStationDto.antennas.map((ant) =>
          this.antennaRepository.create({
            stationId: id,
            size: ant.size,
            frequencyBand: ant.frequencyBand,
          }),
        );
        await this.antennaRepository.save(antennas);
      }
    }

    // 3. Update Cratoses
    if (updateStationDto.cratoses) {
      const existingCratoses = await this.cratosRepository.find({
        where: { stationId: id },
      });

      const newNumbers = updateStationDto.cratoses.map((c) => c.number);
      const existingNumbers = existingCratoses.map((c) => c.number);
      const isCratosesChanged = newNumbers.length !== existingNumbers.length ||
        newNumbers.some((n) => !existingNumbers.includes(n));

      if (isCratosesChanged) {
        await this.cratosRepository.delete({ stationId: id });

        const cratoses = updateStationDto.cratoses.map((cratos) =>
          this.cratosRepository.create({
            stationId: id,
            number: cratos.number,
          }),
        );
        await this.cratosRepository.save(cratoses);
      }
    }


    const result = await this.findOne(id);
    if (!result) {
      throw new NotFoundException(`Failed to retrieve updated station`);
    }

    this.eventEmitter.emit('entity.updated', {
      entity: 'station',
      id: result.id,
      data: result,
    });

    return result;
  }

  async remove(id: number): Promise<void> {
    const station = await this.stationsRepository.findOne({
      where: { id, isDeleted: false },
    });
    
    if (!station) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }

    station.isDeleted = true;
    await this.stationsRepository.save(station);

    this.eventEmitter.emit('entity.deleted', {
      entity: 'station',
      id,
    });
  }
}
