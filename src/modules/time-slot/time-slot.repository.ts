import { Injectable } from '@nestjs/common';
import { TimeSlotEntity } from '../../db/entities/time-slot.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class TimeSlotRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repository() {
    return this.dataSource.getRepository(TimeSlotEntity);
  }

  public async getTimeSlots(): Promise<TimeSlotEntity[]> {
    return this.repository.find();
  }
}
