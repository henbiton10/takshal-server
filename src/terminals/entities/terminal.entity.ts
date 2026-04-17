import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Station } from '../../stations/entities/station.entity';
import { TerminalType } from '../../terminal-types/entities/terminal-type.entity';

@Entity('terminals')
export class Terminal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'integer', name: 'station_id' })
  stationId: number;

  @ManyToOne(() => Station, station => station.terminals)
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @Column({
    type: 'enum',
    enum: ['ka', 'ku'],
    name: 'frequency_band',
  })
  frequencyBand: string;

  @Column({ type: 'integer', name: 'terminal_type_id' })
  terminalTypeId: number;

  @ManyToOne(() => TerminalType)
  @JoinColumn({ name: 'terminal_type_id' })
  terminalType: TerminalType;

  @Column({
    type: 'enum',
    enum: ['ready', 'partly_ready', 'damaged'],
    name: 'readiness_status',
  })
  readinessStatus: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
