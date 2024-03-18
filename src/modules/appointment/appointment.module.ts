import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { AppointmentRepository } from './appointment.repository';

@Module({
  providers: [AppointmentService, AppointmentRepository],
  controllers: [AppointmentController],
})
export class AppointmentModule {}
