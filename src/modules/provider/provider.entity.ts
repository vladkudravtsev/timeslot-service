import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TimeSlotEntity } from '../time-slot/time-slot.entity';

@Entity({ name: 'provider' })
export class ProviderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => TimeSlotEntity, (timeSlot) => timeSlot.provider)
  timeSlots: TimeSlotEntity[];
}
