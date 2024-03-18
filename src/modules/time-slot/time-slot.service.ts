import { Injectable } from '@nestjs/common';
import { TimeSlotEntity } from '../../db/entities/time-slot.entity';
import { TimeSlotRepository } from './time-slot.repository';

@Injectable()
export class TimeSlotService {
  constructor(private readonly repository: TimeSlotRepository) {}

  getTimeSlots(): Promise<TimeSlotEntity[]> {
    return this.repository.getTimeSlots();
  }
}
