import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProviderEntity } from './provider.entity';
import { AppointmentEntity } from './appointment.entity';
import { TimeSlotRescheduleEntity } from './time-slot-reschedule.entity';

@Entity({ name: 'time_slot' })
export class TimeSlotEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'week_day' })
  weekDay: string;

  @Column({ type: 'date', nullable: true })
  date: Date | null;

  @Column({ type: 'timetz', name: 'start_time' })
  startTime: Date;

  @Column({ type: 'timetz', name: 'end_time' })
  endTime: Date;

  @Column()
  type: string;

  @ManyToOne(() => ProviderEntity, (provider) => provider.timeSlots)
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderEntity;

  @OneToMany(() => AppointmentEntity, (appointment) => appointment.timeSlot)
  appointments: AppointmentEntity[];

  @OneToMany(
    () => TimeSlotRescheduleEntity,
    (reschedule) => reschedule.timeSlot,
  )
  reschedules: TimeSlotRescheduleEntity[];
}
