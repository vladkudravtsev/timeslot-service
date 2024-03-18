import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateAppointmentDTO } from './create-appointment.dto';
import { AppointmentService } from './appointment.service';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly service: AppointmentService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('attachments', 5))
  public async createAppointment(
    @UploadedFiles()
    attachments: Express.Multer.File[],
    @Body() createDto: CreateAppointmentDTO,
  ) {
    await this.service.create(attachments, createDto);

    return true;
  }
}
