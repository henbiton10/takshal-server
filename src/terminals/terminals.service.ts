import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Terminal } from './entities/terminal.entity';
import { TerminalType } from '../terminal-types/entities/terminal-type.entity';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';

@Injectable()
export class TerminalsService {
  constructor(
    @InjectRepository(Terminal)
    private terminalsRepository: Repository<Terminal>,
    @InjectRepository(TerminalType)
    private terminalTypesRepository: Repository<TerminalType>,
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

  async create(createTerminalDto: CreateTerminalDto): Promise<Terminal> {
    const terminalTypeId = await this.getOrCreateTerminalType(createTerminalDto.terminalType);
    
    const terminal = this.terminalsRepository.create({
      ...createTerminalDto,
      terminalTypeId,
    });
    return this.terminalsRepository.save(terminal);
  }

  async findAll(): Promise<Terminal[]> {
    return this.terminalsRepository.find({
      where: { isDeleted: false },
      relations: ['station'],
    });
  }

  async findAllSummary(): Promise<Array<{ id: number; name: string }>> {
    return this.terminalsRepository.find({
      select: ['id', 'name'],
      where: { isDeleted: false },
    });
  }

  async findOne(id: number): Promise<Terminal | null> {
    return this.terminalsRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['station', 'terminalType'],
    });
  }

  async update(id: number, updateTerminalDto: UpdateTerminalDto): Promise<Terminal> {
    const terminal = await this.findOne(id);
    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${id} not found`);
    }

    if (updateTerminalDto.terminalType) {
      const terminalTypeId = await this.getOrCreateTerminalType(updateTerminalDto.terminalType);
      terminal.terminalTypeId = terminalTypeId;
    }

    const { terminalType, ...restDto } = updateTerminalDto;
    Object.assign(terminal, restDto);
    return this.terminalsRepository.save(terminal);
  }

  async remove(id: number): Promise<void> {
    const terminal = await this.findOne(id);
    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${id} not found`);
    }

    terminal.isDeleted = true;
    await this.terminalsRepository.save(terminal);
  }
}
