import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { StationConnectivity } from './station-connectivity.entity';
import { StationAntenna } from './station-antenna.entity';

@Entity('stations')
export class Station {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: ['tikshuv', 'airforce'],
    name: 'organizational_affiliation',
  })
  organizationalAffiliation: string;

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

  @OneToMany(() => StationConnectivity, (connectivity) => connectivity.station)
  connectivities: StationConnectivity[];

  @OneToMany(() => StationAntenna, (antenna) => antenna.station)
  antennas: StationAntenna[];
}
