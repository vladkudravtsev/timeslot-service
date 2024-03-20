import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimeSlotEntity } from '../time-slot/time-slot.entity';
import { ClientEntity } from '../client/client.entity';

@Entity({ name: 'appointment' })
export class AppointmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'time', name: 'start_time' })
  startTime: string;

  @Column({ type: 'time', name: 'end_time' })
  endTime: string;

  @ManyToOne(() => TimeSlotEntity, (timeSlot) => timeSlot.appointments, {
    nullable: false,
  })
  @JoinColumn({ name: 'time_slot_id' })
  timeSlot: TimeSlotEntity;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne(() => ClientEntity, (client) => client.appointments, {
    nullable: false,
  })
  @JoinColumn({ name: 'client_id' })
  client: ClientEntity;
}
