import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Station } from './station.entity';

@Entity('station_connectivities')
export class StationConnectivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'station_id', type: 'integer' })
  stationId: number;

  @Column({ name: 'connected_station_id', type: 'integer' })
  connectedStationId: number;

  @Column({ name: 'communication_type', type: 'varchar', length: 255 })
  communicationType: string;

  @Column({ name: 'channel_count', type: 'integer', default: 1 })
  channelCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Station)
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @ManyToOne(() => Station)
  @JoinColumn({ name: 'connected_station_id' })
  connectedStation: Station;
}
