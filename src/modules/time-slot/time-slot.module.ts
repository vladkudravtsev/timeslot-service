import { Module } from '@nestjs/common';
import { TimeSlotController } from './time-slot.controller';
import { TimeSlotService } from './time-slot.service';
import { TimeSlotRepository } from './time-slot.repository';
import { TimeSlotAvailabilityService } from './time-slot-availability.service';

@Module({
  providers: [TimeSlotService, TimeSlotRepository, TimeSlotAvailabilityService],
  controllers: [TimeSlotController],
  exports: [TimeSlotAvailabilityService],
})
export class TimeSlotModule {}
