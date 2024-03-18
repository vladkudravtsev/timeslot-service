import { Controller, Get } from '@nestjs/common';
import { TimeSlotEntity } from '../../db/entities/time-slot.entity';
import { TimeSlotService } from './time-slot.service';

@Controller('time-slots')
export class TimeSlotController {
  constructor(private readonly service: TimeSlotService) {}

  @Get()
  public async getTimeSlots(): Promise<TimeSlotEntity[]> {
    return this.service.getTimeSlots();
  }
}
