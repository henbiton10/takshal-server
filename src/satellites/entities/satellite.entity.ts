import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('satellites')
export class Satellite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: ['israeli', 'international'],
  })
  affiliation: string;

  @Column({ type: 'boolean', name: 'has_frequency_converter' })
  hasFrequencyConverter: boolean;

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
