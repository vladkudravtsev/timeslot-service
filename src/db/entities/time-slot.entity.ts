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

@Entity({ name: 'time_slot' })
export class TimeSlotEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  week_day: string;

  @Column({ type: 'date', nullable: true })
  date: Date | null;

  @Column({ type: 'timetz' })
  start_time: Date;

  @Column({ type: 'timetz' })
  end_time: Date;

  @Column()
  type: string;

  @ManyToOne(() => ProviderEntity, (provider) => provider.timeSlots)
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderEntity;

  @OneToMany(() => AppointmentEntity, (appointment) => appointment.timeSlot)
  appointments: AppointmentEntity[];
}
