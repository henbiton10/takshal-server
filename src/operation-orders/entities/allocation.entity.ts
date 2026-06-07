import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { OperationOrder } from './operation-order.entity';
import { Terminal } from '../../terminals/entities/terminal.entity';
import { Satellite } from '../../satellites/entities/satellite.entity';
import { StationAntenna } from '../../stations/entities/station-antenna.entity';

@Entity('allocations')
export class Allocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'operation_order_id' })
  operationOrderId: number;

  @ManyToOne(() => OperationOrder, (order) => order.allocations)
  @JoinColumn({ name: 'operation_order_id' })
  operationOrder: OperationOrder;

  @Column({ name: 'parent_allocation_id', type: 'int', nullable: true })
  parentAllocationId: number | null;

  @ManyToOne(() => Allocation, (allocation) => allocation.subAllocations, { nullable: true })
  @JoinColumn({ name: 'parent_allocation_id' })
  parentAllocation: Allocation | null;

  @OneToMany(() => Allocation, (allocation) => allocation.parentAllocation)
  subAllocations: Allocation[];

  @Column({ name: 'order_number' })
  orderNumber: number;

  @Column({ name: 'sub_order_number', type: 'int', nullable: true })
  subOrderNumber: number | null;

  @Column({ name: 'terminal_id' })
  terminalId: number;

  @ManyToOne(() => Terminal)
  @JoinColumn({ name: 'terminal_id' })
  terminal: Terminal;

  @Column({ name: 'transmission_satellite_id' })
  transmissionSatelliteId: number;

  @ManyToOne(() => Satellite)
  @JoinColumn({ name: 'transmission_satellite_id' })
  transmissionSatellite: Satellite;

  @Column({ name: 'transmission_antenna_id' })
  transmissionAntennaId: number;

  @ManyToOne(() => StationAntenna)
  @JoinColumn({ name: 'transmission_antenna_id' })
  transmissionAntenna: StationAntenna;

  @Column({ name: 'transmission_frequency', type: 'decimal', precision: 10, scale: 2 })
  transmissionFrequency: number;

  @Column({ name: 'reception_satellite_id' })
  receptionSatelliteId: number;

  @ManyToOne(() => Satellite)
  @JoinColumn({ name: 'reception_satellite_id' })
  receptionSatellite: Satellite;

  @Column({ name: 'reception_antenna_id' })
  receptionAntennaId: number;

  @ManyToOne(() => StationAntenna)
  @JoinColumn({ name: 'reception_antenna_id' })
  receptionAntenna: StationAntenna;

  @Column({ name: 'reception_frequency', type: 'decimal', precision: 10, scale: 2 })
  receptionFrequency: number;

  @Column({ name: 'tail_numbers', type: 'int', array: true, nullable: true })
  tailNumbers: number[] | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'has_conflict', type: 'boolean', default: false })
  hasConflict: boolean;

  @Column({ name: 'conflict_ignored', type: 'boolean', default: false })
  conflictIgnored: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
