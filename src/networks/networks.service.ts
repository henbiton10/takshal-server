import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Network } from './entities/network.entity';
import { CreateNetworkDto } from './dto/create-network.dto';
import { UpdateNetworkDto } from './dto/update-network.dto';

@Injectable()
export class NetworksService {
  constructor(
    @InjectRepository(Network)
    private networksRepository: Repository<Network>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createNetworkDto: CreateNetworkDto): Promise<Network> {
    const network = this.networksRepository.create(createNetworkDto);
    const saved = await this.networksRepository.save(network);

    this.eventEmitter.emit('entity.created', {
      entity: 'network',
      id: saved.id,
      data: saved,
    });

    return saved;
  }

  async findAll(): Promise<Network[]> {
    return await this.networksRepository.find({
      where: { isDeleted: false },
    });
  }

  async findAllSummary(): Promise<Array<{ id: number; name: string }>> {
    return await this.networksRepository.find({
      where: { isDeleted: false },
      select: ['id', 'name'],
    });
  }

  async findOne(id: number): Promise<Network | null> {
    return await this.networksRepository.findOne({
      where: { id, isDeleted: false },
    });
  }

  async update(id: number, updateNetworkDto: UpdateNetworkDto): Promise<Network> {
    const network = await this.findOne(id);
    if (!network) {
      throw new NotFoundException(`Network with ID ${id} not found`);
    }
    
    Object.assign(network, updateNetworkDto);
    const saved = await this.networksRepository.save(network);

    this.eventEmitter.emit('entity.updated', {
      entity: 'network',
      id: saved.id,
      data: saved,
    });

    return saved;
  }

  async remove(id: number): Promise<void> {
    const network = await this.findOne(id);
    if (!network) {
      throw new NotFoundException(`Network with ID ${id} not found`);
    }

    network.isDeleted = true;
    await this.networksRepository.save(network);

    this.eventEmitter.emit('entity.deleted', {
      entity: 'network',
      id,
    });
  }
}
