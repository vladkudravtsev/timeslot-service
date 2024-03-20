import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { TimeSlotEntity } from './time-slot.entity';

@Entity({ name: 'time_slot_reschedule' })
@Unique(['timeSlot', 'rescheduleDate'])
@Unique(['timeSlot', 'newDate'])
export class TimeSlotRescheduleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', name: 'new_date' })
  newDate: Date | null;

  @Column({ type: 'date', name: 'reschedule_date' })
  rescheduleDate: Date;

  @ManyToOne(() => TimeSlotEntity, (timeSlot) => timeSlot.reschedules, {
    nullable: false,
  })
  @JoinColumn({ name: 'time_slot_id' })
  timeSlot: TimeSlotEntity;
}
