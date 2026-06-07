import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Station } from '../../stations/entities/station.entity';
import { StationAntenna } from '../../stations/entities/station-antenna.entity';
import { Terminal } from './terminal.entity';

@Entity('terminal_connectivities')
export class TerminalConnectivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'terminal_id', type: 'integer' })
  terminalId: number;

  @Column({ name: 'order_index', type: 'integer', default: 0 })
  orderIndex: number;

  // --- Terminal side (צד טרמינל) ---
  @Column({ name: 'station_id', type: 'integer', nullable: true })
  stationId: number | null;

  @Column({ name: 'antenna_id', type: 'integer', nullable: true })
  antennaId: number | null;

  @Column({ name: 'connection_type', type: 'varchar', length: 255, nullable: true })
  connectionType: string | null;

  @Column({ name: 'transit_network', type: 'varchar', length: 255, nullable: true })
  transitNetwork: string | null;

  @Column({ name: 'cratos_number', type: 'integer', nullable: true })
  cratosNumber: number | null;

  // --- Antenna side (צד אנטנה, optional) ---
  @Column({ name: 'antenna_side_station_id', type: 'integer', nullable: true })
  antennaSideStationId: number | null;

  @Column({ name: 'antenna_side_antenna_id', type: 'integer', nullable: true })
  antennaSideAntennaId: number | null;

  @Column({ name: 'antenna_side_cratos_number', type: 'integer', nullable: true })
  antennaSideCratosNumber: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Terminal, (terminal) => terminal.connectivities)
  @JoinColumn({ name: 'terminal_id' })
  terminal: Terminal;

  @ManyToOne(() => Station)
  @JoinColumn({ name: 'station_id' })
  station: Station | null;

  @ManyToOne(() => StationAntenna)
  @JoinColumn({ name: 'antenna_id' })
  antenna: StationAntenna | null;

  @ManyToOne(() => Station)
  @JoinColumn({ name: 'antenna_side_station_id' })
  antennaSideStation: Station | null;

  @ManyToOne(() => StationAntenna)
  @JoinColumn({ name: 'antenna_side_antenna_id' })
  antennaSideAntenna: StationAntenna | null;
}
