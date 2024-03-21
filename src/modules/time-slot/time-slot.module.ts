import { Module } from '@nestjs/common';
import { TimeSlotController } from './time-slot.controller';
import { TimeSlotService } from './time-slot.service';
import { TimeSlotRepository } from './time-slot.repository';

@Module({
  providers: [TimeSlotService, TimeSlotRepository],
  controllers: [TimeSlotController],
  exports: [],
})
export class TimeSlotModule {}
