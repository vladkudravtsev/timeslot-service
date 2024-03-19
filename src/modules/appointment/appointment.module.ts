import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { AppointmentRepository } from './appointment.repository';
import { TimeSlotModule } from '../time-slot/time-slot.module';

@Module({
  imports: [TimeSlotModule],
  providers: [AppointmentService, AppointmentRepository],
  controllers: [AppointmentController],
})
export class AppointmentModule {}
