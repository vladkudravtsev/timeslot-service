import { Injectable } from '@nestjs/common';
import { AppointmentRepository } from './appointment.repository';
import { CreateAppointmentDTO } from './create-appointment.dto';
import { ClientEntity } from '../../db/entities/client.entity';
import { TimeSlotEntity } from '../../db/entities/time-slot.entity';
import { writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { extname, resolve } from 'node:path';
import { AppointmentEntity } from '../../db/entities/appointment.entity';
import { AttachmentEntity } from '../../db/entities/attachment.entity';

@Injectable()
export class AppointmentService {
  constructor(private readonly repository: AppointmentRepository) {}
  public async create(
    attachments: Express.Multer.File[],
    body: CreateAppointmentDTO,
  ) {
    const client = new ClientEntity();
    client.id = body.clientId;

    const timeSlot = new TimeSlotEntity();
    timeSlot.id = body.timeSlotId;

    await this.repository.getDataSource.transaction(async (manager) => {
      const newAppointment = await manager.save(AppointmentEntity, {
        ...body,
        client,
        timeSlot,
      });

      await Promise.all(
        attachments.map(async (attachment) => {
          const suffix = randomUUID();
          const extension = extname(attachment.originalname);
          const filename = `${suffix}${extension}`;
          const destination = `./uploads/${filename}`;

          await manager.insert(AttachmentEntity, {
            originalName: attachment.originalname,
            path: resolve(__dirname, destination),
            appointment: newAppointment,
          });
          return writeFile(destination, attachment.buffer);
        }),
      );
    });
  }
}
