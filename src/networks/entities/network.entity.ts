import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('networks')
export class Network {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'terminal_type_id', type: 'integer' })
  terminalTypeId: number;

  @Column({ name: 'connectivity_type_id', type: 'integer' })
  connectivityTypeId: number;

  @Column({
    name: 'readiness_status',
    type: 'enum',
    enum: ['ready', 'partly_ready', 'damaged'],
  })
  readinessStatus: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
