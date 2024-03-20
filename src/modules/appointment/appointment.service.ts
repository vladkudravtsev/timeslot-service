import { BadRequestException, Injectable } from '@nestjs/common';
import { AppointmentRepository } from './appointment.repository';
import { CreateAppointmentDTO } from './create-appointment.dto';
import { ClientEntity } from '../client/client.entity';
import { unlink, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { AppointmentEntity } from './appointment.entity';
import { AttachmentEntity } from '../attachment/attachment.entity';
import * as moment from 'moment';
import { TIME_FORMAT } from '../../shared/constants';
import { ConfigService } from '@nestjs/config';
import { RRuleSet, rrulestr } from 'rrule';
import { TimeSlotEntity } from '../time-slot/time-slot.entity';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly repository: AppointmentRepository,
    private readonly configService: ConfigService,
  ) {}
  public async create(
    attachments: Express.Multer.File[],
    body: CreateAppointmentDTO,
  ) {
    const timeSlot = await this.repository.getTimeSlot(body.timeSlotId);
    if (timeSlot == null) {
      throw new BadRequestException('Time slot not found');
    }

    const rrule = rrulestr(timeSlot.recurrenceRule, {
      forceset: true,
    }) as RRuleSet;

    const ruleDates = rrule.all().map((d) => d.getTime());

    if (!ruleDates.includes(body.date.getTime())) {
      throw new BadRequestException('Invalid appointment date');
    }

    await this.repository.getDataSource.transaction(async (manager) => {
      const client = new ClientEntity();
      client.id = body.clientId;

      // exclude appointment date from rrule
      const rruleClone = rrule.clone();
      rruleClone.exdate(body.date);

      await manager.update(TimeSlotEntity, timeSlot.id, {
        recurrenceRule: rruleClone.toString(),
      });

      // TODO: save datetime as one property
      const newAppointment = await manager.save(AppointmentEntity, {
        ...body,
        client,
        startTime: moment(body.startTime, TIME_FORMAT).format(TIME_FORMAT),
        endTime: moment(body.endTime, TIME_FORMAT).format(TIME_FORMAT),
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
