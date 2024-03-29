import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProviderEntity } from '../provider/provider.entity';
import { AppointmentEntity } from '../appointment/appointment.entity';
import { TimeSlotCommuteMethodEntity } from '../time-slot-commute-method/time-slot-commute-method.entity';

@Entity({ name: 'time_slot' })
export class TimeSlotEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'week_day' })
  weekDay: string;

  @Column({ type: 'date', nullable: true })
  date: Date | null;

  @Column({ type: 'time', name: 'start_time' })
  startTime: Date;

  @Column({ type: 'time', name: 'end_time' })
  endTime: Date;

  @Column()
  type: string;

  @ManyToOne(() => ProviderEntity, (provider) => provider.timeSlots, {
    nullable: false,
  })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderEntity;

  @OneToMany(() => AppointmentEntity, (appointment) => appointment.timeSlot)
  appointments: AppointmentEntity[];

  @OneToMany(
    () => TimeSlotCommuteMethodEntity,
    (commuteMethod) => commuteMethod.timeSlot,
  )
  commuteMethods: TimeSlotCommuteMethodEntity[];

  @Column({ name: 'recurrence_rule' })
  recurrenceRule: string;
}
