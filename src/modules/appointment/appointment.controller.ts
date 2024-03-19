import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
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
    return this.service.create(attachments, createDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteAppointment(@Param('id') id: number) {
    return this.service.delete(id);
  }
}
