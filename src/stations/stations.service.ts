import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from './entities/station.entity';
import { StationConnectivity } from './entities/station-connectivity.entity';
import { StationAntenna } from './entities/station-antenna.entity';
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

    const result = await this.findOne(savedStation.id);
    if (!result) {
      throw new NotFoundException(`Failed to retrieve created station`);
    }
    return result;
  }

  async findAll(): Promise<Station[]> {
    const stations = await this.stationsRepository.find({
      where: { isDeleted: false },
      relations: [
        'connectivities', 'connectivities.connectedStation',
        'reverseConnectivities', 'reverseConnectivities.station',
        'antennas',
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
        'connectivities', 'connectivities.connectedStation',
        'reverseConnectivities', 'reverseConnectivities.station',
        'antennas',
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
      flipped.createdAt = rc.createdAt;
      flipped.connectedStation = rc.station;
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

    const existingConnectivities = await this.connectivityRepository.find({
      select: ['id'],
      where: [{ stationId: id }, { connectedStationId: id }],
    });
    const connectivityIdsToDelete = existingConnectivities.map((c) => c.id);

    if (connectivityIdsToDelete.length > 0) {
      await this.connectivityRepository.manager.query(
        `UPDATE allocations SET transmission_connectivity_id = NULL WHERE transmission_connectivity_id = ANY($1)`,
        [connectivityIdsToDelete],
      );
      await this.connectivityRepository.manager.query(
        `UPDATE allocations SET reception_connectivity_id = NULL WHERE reception_connectivity_id = ANY($1)`,
        [connectivityIdsToDelete],
      );
    }

    await this.connectivityRepository.delete({ stationId: id });
    await this.connectivityRepository.delete({ connectedStationId: id });
    if (updateStationDto.connectivities && updateStationDto.connectivities.length > 0) {
      const connectivities = updateStationDto.connectivities.map((conn) =>
        this.connectivityRepository.create({
          stationId: id,
          connectedStationId: conn.connectedStationId,
          communicationType: conn.communicationType,
          channelCount: conn.channelCount,
        }),
      );
      await this.connectivityRepository.save(connectivities);
    }

    const existingAntennas = await this.antennaRepository.find({
      select: ['id'],
      where: { stationId: id },
    });
    const antennaIdsToDelete = existingAntennas.map((a) => a.id);

    if (antennaIdsToDelete.length > 0) {
      await this.antennaRepository.manager.query(
        `DELETE FROM allocations WHERE transmission_antenna_id = ANY($1) OR reception_antenna_id = ANY($1)`,
        [antennaIdsToDelete],
      );
    }

    await this.antennaRepository.delete({ stationId: id });
    if (updateStationDto.antennas && updateStationDto.antennas.length > 0) {
      const antennas = updateStationDto.antennas.map((ant) =>
        this.antennaRepository.create({
          stationId: id,
          size: ant.size,
          frequencyBand: ant.frequencyBand,
        }),
      );
      await this.antennaRepository.save(antennas);
    }

    const result = await this.findOne(id);
    if (!result) {
      throw new NotFoundException(`Failed to retrieve updated station`);
    }
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
  }
}
