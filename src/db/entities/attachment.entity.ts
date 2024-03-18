import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AppointmentEntity } from './appointment.entity';

@Entity({ name: 'attachment' })
export class AttachmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column()
  path: string;

  @ManyToOne(() => AppointmentEntity)
  @JoinColumn({ name: 'appointment_id' })
  appointment: AppointmentEntity;
}
