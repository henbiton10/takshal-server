import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Network } from './entities/network.entity';
import { CreateNetworkDto } from './dto/create-network.dto';
import { UpdateNetworkDto } from './dto/update-network.dto';

@Injectable()
export class NetworksService {
  constructor(
    @InjectRepository(Network)
    private networksRepository: Repository<Network>,
  ) {}

  async create(createNetworkDto: CreateNetworkDto): Promise<Network> {
    const network = this.networksRepository.create(createNetworkDto);
    return await this.networksRepository.save(network);
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
    return await this.networksRepository.save(network);
  }

  async remove(id: number): Promise<void> {
    const network = await this.findOne(id);
    if (!network) {
      throw new NotFoundException(`Network with ID ${id} not found`);
    }

    network.isDeleted = true;
    await this.networksRepository.save(network);
  }
}
