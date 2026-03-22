import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Satellite } from './entities/satellite.entity';
import { CreateSatelliteDto } from './dto/create-satellite.dto';
import { UpdateSatelliteDto } from './dto/update-satellite.dto';

@Injectable()
export class SatellitesService {
  constructor(
    @InjectRepository(Satellite)
    private satellitesRepository: Repository<Satellite>,
  ) {}

  async create(createSatelliteDto: CreateSatelliteDto): Promise<Satellite> {
    const satellite = this.satellitesRepository.create(createSatelliteDto);
    return this.satellitesRepository.save(satellite);
  }

  async findAll(): Promise<Satellite[]> {
    return this.satellitesRepository.find({
      where: { isDeleted: false },
    });
  }

  async findAllSummary(): Promise<Array<{ id: number; name: string }>> {
    return this.satellitesRepository.find({
      select: ['id', 'name'],
      where: { isDeleted: false },
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
    return this.satellitesRepository.save(satellite);
  }
}
