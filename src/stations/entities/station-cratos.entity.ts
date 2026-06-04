import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Station } from './station.entity';

@Entity('station_cratoses')
export class StationCratos {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'station_id', type: 'integer' })
  stationId: number;

  @Column({ type: 'integer' })
  number: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Station)
  @JoinColumn({ name: 'station_id' })
  station: Station;
}
