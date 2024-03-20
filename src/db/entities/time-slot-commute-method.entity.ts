import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { TimeSlotEntity } from './time-slot.entity';

@Entity({ name: 'time_slot_commute_method' })
@Unique(['timeSlot', 'timeSlotDate'])
export class TimeSlotCommuteMethodEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'commute_method' })
  commuteMethod: string;

  @Column({ name: 'time_slot_date', type: 'date' })
  timeSlotDate: Date;

  @ManyToOne(() => TimeSlotEntity, (timeSlot) => timeSlot.commuteMethods, {
    nullable: false,
  })
  @JoinColumn({ name: 'time_slot_id' })
  timeSlot: TimeSlotEntity;
}
