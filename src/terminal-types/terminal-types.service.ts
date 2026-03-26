import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TerminalType } from './entities/terminal-type.entity';

@Injectable()
export class TerminalTypesService {
  constructor(
    @InjectRepository(TerminalType)
    private terminalTypesRepository: Repository<TerminalType>,
  ) {}

  async findAll(): Promise<TerminalType[]> {
    return await this.terminalTypesRepository.find();
  }

  async findAllSummary(): Promise<Array<{ id: number; name: string }>> {
    return await this.terminalTypesRepository.find({
      select: ['id', 'name'],
    });
  }
}
