import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConnectivityType } from './entities/connectivity-type.entity';

@Injectable()
export class ConnectivityTypesService {
  constructor(
    @InjectRepository(ConnectivityType)
    private connectivityTypesRepository: Repository<ConnectivityType>,
  ) {}

  async findAll(): Promise<ConnectivityType[]> {
    return await this.connectivityTypesRepository.find();
  }

  async findAllSummary(): Promise<Array<{ id: number; name: string }>> {
    return await this.connectivityTypesRepository.find({
      select: ['id', 'name'],
    });
  }
}
