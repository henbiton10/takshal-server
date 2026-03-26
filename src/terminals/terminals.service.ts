import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Terminal } from './entities/terminal.entity';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';

@Injectable()
export class TerminalsService {
  constructor(
    @InjectRepository(Terminal)
    private terminalsRepository: Repository<Terminal>,
  ) {}

  async create(createTerminalDto: CreateTerminalDto): Promise<Terminal> {
    // For now, we'll use terminal_type_id as 1 (will implement dynamic types later)
    const terminal = this.terminalsRepository.create({
      ...createTerminalDto,
      terminalTypeId: 1, // Placeholder
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
      relations: ['station'],
    });
  }

  async update(id: number, updateTerminalDto: UpdateTerminalDto): Promise<Terminal> {
    const terminal = await this.findOne(id);
    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${id} not found`);
    }
    Object.assign(terminal, updateTerminalDto);
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
