import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AppointmentEntity } from './appointment.entity';

@Entity({ name: 'client' })
export class ClientEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @OneToMany(() => AppointmentEntity, (appointment) => appointment.client)
  appointments: AppointmentEntity[];
}
