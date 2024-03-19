import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TimeSlotEntity } from '../../db/entities/time-slot.entity';
import { TimeSlotService } from './time-slot.service';
import { RescheduleDTO } from './reschedule.dto';

@Controller('time-slots')
export class TimeSlotController {
  constructor(private readonly service: TimeSlotService) {}

  @Get()
  public async getTimeSlots(): Promise<TimeSlotEntity[]> {
    return this.service.getTimeSlots();
  }

  @Post(':id/reschedule')
  public async rescheduleTimeSlot(
    @Param('id') id: number,
    @Body() rescheduleDto: RescheduleDTO,
  ) {
    return this.service.rescheduleTimeSlot(id, rescheduleDto);
  }
}
