import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Station } from './station.entity';

@Entity('station_antennas')
export class StationAntenna {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'station_id', type: 'integer' })
  stationId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  size: number;

  @Column({ name: 'frequency_band', type: 'varchar', length: 255 })
  frequencyBand: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Station)
  @JoinColumn({ name: 'station_id' })
  station: Station;
}
