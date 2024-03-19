import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TimeSlotEntity } from '../../db/entities/time-slot.entity';

@Injectable()
export class AppointmentRepository {
  constructor(private readonly dataSource: DataSource) {}

  public get getDataSource() {
    return this.dataSource;
  }

  public async getTimeSlot(id: number) {
    return this.getDataSource.getRepository(TimeSlotEntity).findOne({
      where: { id },
      relations: ['appointments', 'reschedules'],
    });
  }
}
