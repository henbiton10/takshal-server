import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Terminal } from './entities/terminal.entity';
import { TerminalConnectivity } from './entities/terminal-connectivity.entity';
import { TerminalType } from '../terminal-types/entities/terminal-type.entity';
import { CreateTerminalDto, TerminalConnectivityDto } from './dto/create-terminal.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';

const TERMINAL_RELATIONS = [
  'station',
  'secondStation',
  'terminalType',
  'satellite',
  'connectivities',
  'connectivities.station',
  'connectivities.antenna',
  'connectivities.antennaSideStation',
  'connectivities.antennaSideAntenna',
];

export interface CratosUsageEntry {
  stationId: number;
  cratosNumber: number;
  terminalId: number;
  terminalName: string;
  side: 'terminal' | 'antenna';
  connectedStationId: number | null;
  connectedStationName: string | null;
}

@Injectable()
export class TerminalsService {
  constructor(
    @InjectRepository(Terminal)
    private terminalsRepository: Repository<Terminal>,
    @InjectRepository(TerminalConnectivity)
    private connectivityRepository: Repository<TerminalConnectivity>,
    @InjectRepository(TerminalType)
    private terminalTypesRepository: Repository<TerminalType>,
    private eventEmitter: EventEmitter2,
  ) {}

  private async getOrCreateTerminalType(typeName: string): Promise<number> {
    let terminalType = await this.terminalTypesRepository.findOne({
      where: { name: typeName },
    });

    if (!terminalType) {
      terminalType = this.terminalTypesRepository.create({ name: typeName });
      terminalType = await this.terminalTypesRepository.save(terminalType);
    }

    return terminalType.id;
  }

  /** The terminal's own station mirrors the first connectivity's terminal-side station. */
  private deriveStationId(
    connectivities: TerminalConnectivityDto[] | undefined,
    fallback: number | null,
  ): number | null {
    if (connectivities && connectivities.length > 0) {
      return connectivities[0].stationId ?? null;
    }
    return fallback ?? null;
  }

  private async replaceConnectivities(
    terminalId: number,
    connectivities: TerminalConnectivityDto[],
  ): Promise<void> {
    await this.connectivityRepository.delete({ terminalId });
    if (!connectivities.length) return;

    const rows = connectivities.map((conn, index) =>
      this.connectivityRepository.create({
        terminalId,
        orderIndex: index,
        stationId: conn.stationId ?? null,
        antennaId: conn.antennaId ?? null,
        connectionType: conn.connectionType ?? null,
        transitNetwork: conn.transitNetwork ?? null,
        cratosNumber: conn.cratosNumber ?? null,
        antennaSideStationId: conn.antennaSideStationId ?? null,
        antennaSideAntennaId: conn.antennaSideAntennaId ?? null,
        antennaSideCratosNumber: conn.antennaSideCratosNumber ?? null,
      }),
    );
    await this.connectivityRepository.save(rows);
  }

  async create(createTerminalDto: CreateTerminalDto): Promise<Terminal> {
    const terminalTypeId = await this.getOrCreateTerminalType(createTerminalDto.terminalType);
    const connectivities = createTerminalDto.connectivities || [];

    const terminal = this.terminalsRepository.create({
      name: createTerminalDto.name,
      stationId: this.deriveStationId(connectivities, createTerminalDto.stationId ?? null),
      secondStationId:
        createTerminalDto.frequencyBand === 'cb'
          ? createTerminalDto.secondStationId ?? null
          : null,
      bandwidth: createTerminalDto.bandwidth ?? 0,
      satelliteId: createTerminalDto.satelliteId ?? null,
      frequencyBand: createTerminalDto.frequencyBand,
      terminalTypeId,
      readinessStatus: createTerminalDto.readinessStatus,
      notes: createTerminalDto.notes,
    });
    const saved = await this.terminalsRepository.save(terminal);

    await this.replaceConnectivities(saved.id, connectivities);

    const result = await this.findOne(saved.id);
    if (!result) {
      throw new NotFoundException('Failed to retrieve created terminal');
    }

    this.eventEmitter.emit('entity.created', {
      entity: 'terminal',
      id: result.id,
      data: result,
    });

    return result;
  }

  async findAll(): Promise<Terminal[]> {
    const terminals = await this.terminalsRepository.find({
      where: { isDeleted: false },
      relations: TERMINAL_RELATIONS,
    });
    terminals.forEach((t) => this.sortConnectivities(t));
    return terminals;
  }

  async findAllSummary(): Promise<Array<{ id: number; name: string }>> {
    return this.terminalsRepository.find({
      select: ['id', 'name'],
      where: { isDeleted: false },
    });
  }

  async findOne(id: number): Promise<Terminal | null> {
    const terminal = await this.terminalsRepository.findOne({
      where: { id, isDeleted: false },
      relations: TERMINAL_RELATIONS,
    });
    if (terminal) this.sortConnectivities(terminal);
    return terminal;
  }

  private sortConnectivities(terminal: Terminal): void {
    if (terminal.connectivities) {
      terminal.connectivities.sort((a, b) => a.orderIndex - b.orderIndex);
    }
  }

  /** Which (station, cratos) pairs are in use across all terminals, and by whom. */
  async getCratosUsage(): Promise<CratosUsageEntry[]> {
    const rows = await this.connectivityRepository.find({
      relations: ['terminal', 'station', 'antennaSideStation'],
    });

    const usage: CratosUsageEntry[] = [];
    for (const r of rows) {
      if (!r.terminal || r.terminal.isDeleted) continue;
      if (r.cratosNumber != null && r.stationId != null) {
        usage.push({
          stationId: r.stationId,
          cratosNumber: r.cratosNumber,
          terminalId: r.terminalId,
          terminalName: r.terminal.name,
          side: 'terminal',
          connectedStationId: r.antennaSideStationId ?? null,
          connectedStationName: r.antennaSideStation?.name ?? null,
        });
      }
      if (r.antennaSideCratosNumber != null && r.antennaSideStationId != null) {
        usage.push({
          stationId: r.antennaSideStationId,
          cratosNumber: r.antennaSideCratosNumber,
          terminalId: r.terminalId,
          terminalName: r.terminal.name,
          side: 'antenna',
          connectedStationId: r.stationId ?? null,
          connectedStationName: r.station?.name ?? null,
        });
      }
    }
    return usage;
  }

  async update(id: number, updateTerminalDto: UpdateTerminalDto): Promise<Terminal> {
    const terminal = await this.terminalsRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${id} not found`);
    }

    const terminalTypeId = await this.getOrCreateTerminalType(updateTerminalDto.terminalType);
    const connectivities = updateTerminalDto.connectivities;

    terminal.name = updateTerminalDto.name;
    terminal.bandwidth = updateTerminalDto.bandwidth ?? 0;
    terminal.satelliteId = updateTerminalDto.satelliteId ?? null;
    terminal.frequencyBand = updateTerminalDto.frequencyBand;
    terminal.terminalTypeId = terminalTypeId;
    terminal.readinessStatus = updateTerminalDto.readinessStatus;
    terminal.notes = updateTerminalDto.notes ?? '';
    terminal.secondStationId =
      updateTerminalDto.frequencyBand === 'cb'
        ? updateTerminalDto.secondStationId ?? null
        : null;
    terminal.stationId = this.deriveStationId(connectivities, terminal.stationId);

    await this.terminalsRepository.save(terminal);

    if (connectivities) {
      await this.replaceConnectivities(id, connectivities);
    }

    const saved = await this.findOne(id);
    if (!saved) {
      throw new NotFoundException(`Terminal with ID ${id} not found after update`);
    }

    this.eventEmitter.emit('entity.updated', {
      entity: 'terminal',
      id: saved.id,
      data: saved,
    });

    return saved;
  }

  async remove(id: number): Promise<void> {
    const terminal = await this.terminalsRepository.findOne({
      where: { id, isDeleted: false },
    });
    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${id} not found`);
    }

    terminal.isDeleted = true;
    await this.terminalsRepository.save(terminal);

    this.eventEmitter.emit('entity.deleted', {
      entity: 'terminal',
      id,
    });
  }
}
