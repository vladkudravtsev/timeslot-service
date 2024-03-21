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

  @Column({ type: 'timestamptz', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'timestamptz', name: 'end_date' })
  endDate: Date;

  @ManyToOne(() => TimeSlotEntity, (timeSlot) => timeSlot.appointments, {
    nullable: false,
  })
  @JoinColumn({ name: 'time_slot_id' })
  timeSlot: TimeSlotEntity;

  @ManyToOne(() => ClientEntity, (client) => client.appointments, {
    nullable: false,
  })
  @JoinColumn({ name: 'client_id' })
  client: ClientEntity;
}
