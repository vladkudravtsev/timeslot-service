import { BadRequestException, Injectable } from '@nestjs/common';
import { AppointmentRepository } from './appointment.repository';
import { CreateAppointmentDTO } from './create-appointment.dto';
import { ClientEntity } from '../../db/entities/client.entity';
import { unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { AppointmentEntity } from '../../db/entities/appointment.entity';
import { AttachmentEntity } from '../../db/entities/attachment.entity';
import * as moment from 'moment';
import { TIME_FORMAT } from '../../shared/constants';
import { ConfigService } from '@nestjs/config';
import { TimeSlotAvailabilityService } from '../time-slot/time-slot-availability.service';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly repository: AppointmentRepository,
    private readonly configService: ConfigService,
    private readonly timeSlotAvailabilityService: TimeSlotAvailabilityService,
  ) {}
  public async create(
    attachments: Express.Multer.File[],
    body: CreateAppointmentDTO,
  ) {
    const timeSlot = await this.repository.getTimeSlot(body.timeSlotId);
    if (timeSlot == null) {
      throw new BadRequestException('Time slot not found');
    }

    const isAvailable =
      this.timeSlotAvailabilityService.checkTimeSlotAvailability(
        { startTime: body.startTime, endTime: body.endTime, date: body.date },
        timeSlot,
      );
    if (!isAvailable) {
      throw new BadRequestException('Time slot is not available');
    }

    const client = new ClientEntity();
    client.id = body.clientId;

    await this.repository.getDataSource.transaction(async (manager) => {
      const newAppointment = await manager.save(AppointmentEntity, {
        ...body,
        client,
        startTime: moment(body.startTime, TIME_FORMAT).format('HH:mm:Z'),
        endTime: moment(body.endTime, TIME_FORMAT).format('HH:mm:Z'),
        timeSlot,
      });

      await Promise.all(
        attachments.map(async (attachment) => {
          const suffix = randomUUID();
          const extension = extname(attachment.originalname);
          const filename = `${suffix}${extension}`;
          const destination = `${this.configService.get('ATTACHMENTS_PATH')}/${filename}`;

          await manager.insert(AttachmentEntity, {
            originalName: attachment.originalname,
            path: destination,
            appointment: newAppointment,
          });
          return writeFile(destination, attachment.buffer);
        }),
      );
    });
  }

  public async delete(id: number) {
    await this.repository.getDataSource.transaction(async (manager) => {
      const attachments = await manager.find(AttachmentEntity, {
        where: { appointment: { id } },
      });

      await manager.delete(AttachmentEntity, { appointment: { id } });
      await manager.delete(AppointmentEntity, { id });

      await Promise.all(
        attachments.map(async (attachment) => {
          await unlink(attachment.path);
        }),
      );
    });
  }
}
