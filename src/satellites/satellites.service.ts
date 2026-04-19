import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Satellite } from './entities/satellite.entity';
import { CreateSatelliteDto } from './dto/create-satellite.dto';
import { UpdateSatelliteDto } from './dto/update-satellite.dto';

@Injectable()
export class SatellitesService {
  constructor(
    @InjectRepository(Satellite)
    private satellitesRepository: Repository<Satellite>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createSatelliteDto: CreateSatelliteDto): Promise<Satellite> {
    const satellite = this.satellitesRepository.create(createSatelliteDto);
    const saved = await this.satellitesRepository.save(satellite);
    
    this.eventEmitter.emit('entity.created', {
      entity: 'satellite',
      id: saved.id,
      data: saved,
    });
    
    return saved;
  }

  async findAll(): Promise<Satellite[]> {
    return this.satellitesRepository.find({
      where: { isDeleted: false },
    });
  }

  async findAllSummary(): Promise<Array<{ id: number; name: string; isDeleted: boolean }>> {
    return this.satellitesRepository.find({
      select: ['id', 'name', 'isDeleted'],
    });
  }

  async findOne(id: number): Promise<Satellite | null> {
    return this.satellitesRepository.findOne({
      where: { id, isDeleted: false },
    });
  }

  async update(id: number, updateSatelliteDto: UpdateSatelliteDto): Promise<Satellite> {
    const satellite = await this.findOne(id);
    if (!satellite) {
      throw new NotFoundException(`Satellite with ID ${id} not found`);
    }
    
    Object.assign(satellite, updateSatelliteDto);
    const saved = await this.satellitesRepository.save(satellite);

    this.eventEmitter.emit('entity.updated', {
      entity: 'satellite',
      id: saved.id,
      data: saved,
    });

    return saved;
  }

  async remove(id: number): Promise<void> {
    const satellite = await this.findOne(id);
    if (!satellite) {
      throw new NotFoundException(`Satellite with ID ${id} not found`);
    }

    satellite.isDeleted = true;
    await this.satellitesRepository.save(satellite);

    this.eventEmitter.emit('entity.deleted', {
      entity: 'satellite',
      id,
    });
  }
}
