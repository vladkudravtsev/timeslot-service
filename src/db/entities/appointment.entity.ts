import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimeSlotEntity } from './time-slot.entity';
import { ClientEntity } from './client.entity';

@Entity({ name: 'appointment' })
export class AppointmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timetz' })
  start_time: Date;

  @Column({ type: 'timetz' })
  end_time: Date;

  @ManyToOne(() => TimeSlotEntity, (timeSlot) => timeSlot.appointments)
  @JoinColumn({ name: 'time_slot_id' })
  timeSlot: TimeSlotEntity;

  @ManyToOne(() => ClientEntity, (client) => client.appointments)
  @JoinColumn({ name: 'client_id' })
  client: ClientEntity;
}
