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

  @Column({ name: 'cr_number', type: 'varchar', length: 255, nullable: true })
  crNumber: string | null;

  @Column({ name: 'transit_network', type: 'varchar', length: 255, nullable: true })
  transitNetwork: string | null;

  @Column({ name: 'link_station_id', type: 'integer', nullable: true })
  linkStationId: number | null;

  @Column({ name: 'link_cr_number', type: 'varchar', length: 255, nullable: true })
  linkCrNumber: string | null;

  @Column({ name: 'link_antenna_size', type: 'decimal', precision: 10, scale: 2, nullable: true })
  linkAntennaSize: number | null;

  @Column({ name: 'link_frequency_band', type: 'varchar', length: 255, nullable: true })
  linkFrequencyBand: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Station)
  @JoinColumn({ name: 'station_id' })
  station: Station;

  @ManyToOne(() => Station)
  @JoinColumn({ name: 'connected_station_id' })
  connectedStation: Station;

  @ManyToOne(() => Station)
  @JoinColumn({ name: 'link_station_id' })
  linkStation: Station;
}
