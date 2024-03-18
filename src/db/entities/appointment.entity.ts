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

  @Column({ type: 'timetz', name: 'start_time' })
  startTime: string;

  @Column({ type: 'timetz', name: 'end_time' })
  endTime: string;

  @ManyToOne(() => TimeSlotEntity, (timeSlot) => timeSlot.appointments)
  @JoinColumn({ name: 'time_slot_id' })
  timeSlot: TimeSlotEntity;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne(() => ClientEntity, (client) => client.appointments)
  @JoinColumn({ name: 'client_id' })
  client: ClientEntity;
}
