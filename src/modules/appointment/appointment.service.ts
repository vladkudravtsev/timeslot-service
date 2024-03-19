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
import { TIME_FORMAT, TIME_SLOT_TYPE, WEEK_DAYS } from '../../shared/constants';
import { TimeSlotEntity } from '../../db/entities/time-slot.entity';
import { TimeRange } from '../../shared/types';
import { ConfigService } from '@nestjs/config';

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

    const isAvailable = this.checkTimeSlotAvailability(body, timeSlot);
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

  private checkTimeSlotAvailability(
    body: CreateAppointmentDTO,
    timeSlot: TimeSlotEntity,
  ) {
    const appointmentTime = {
      start: moment(body.startTime, TIME_FORMAT),
      end: moment(body.endTime, TIME_FORMAT),
    };
    const timeSlotTime = {
      start: moment(timeSlot.startTime, TIME_FORMAT),
      end: moment(timeSlot.endTime, TIME_FORMAT),
    };

    const isValidTime = this.validateTime(appointmentTime, timeSlotTime);
    if (!isValidTime) {
      throw new BadRequestException('Time slot is not available');
    }

    // check if time slot is not reserved
    const isReserved = this.isTimeSlotReserved(
      timeSlot.appointments,
      appointmentTime,
      body.date,
    );
    if (isReserved) {
      throw new BadRequestException('Time slot is reserved');
    }

    if (timeSlot.type === TIME_SLOT_TYPE.SINGLE) {
      const isSameDate = moment(body.date).isSame(moment(timeSlot.date));
      if (!isSameDate) {
        throw new BadRequestException('Time slot is not available');
      }
    } else if (timeSlot.type === TIME_SLOT_TYPE.RECURRING) {
      const weekDay = moment(body.date).day();

      const isRescheduledDate = timeSlot.reschedules.some((reschedule) =>
        moment(reschedule.newDate).isSame(moment(body.date)),
      );

      if (WEEK_DAYS[weekDay] !== timeSlot.weekDay && !isRescheduledDate) {
        throw new BadRequestException('Time slot is not available');
      }

      timeSlot.reschedules.forEach((reschedule) => {
        const rescheduleDate = moment(reschedule.rescheduleDate);
        const appointmentDate = moment(body.date);
        const isSameDate = rescheduleDate.isSame(appointmentDate);
        if (isSameDate) {
          throw new BadRequestException(
            `Time slot for ${appointmentDate.format('YYYY-MM-DD')} was rescheduled to ${reschedule.newDate}`,
          );
        }
      });
    }

    return true;
  }

  private validateTime(appointmentTime: TimeRange, timeSlotTime: TimeRange) {
    return (
      appointmentTime.start.isBefore(appointmentTime.end) &&
      appointmentTime.start.isSameOrAfter(timeSlotTime.start) &&
      appointmentTime.start.isBefore(timeSlotTime.end) &&
      appointmentTime.end.isSameOrBefore(timeSlotTime.end) &&
      appointmentTime.end.isAfter(timeSlotTime.start)
    );
  }

  private isTimeSlotReserved(
    appointments: AppointmentEntity[],
    appointmentTime: TimeRange,
    appointmentDate: Date,
  ) {
    return appointments.some((appointment) => {
      const startTime = moment(appointment.startTime, TIME_FORMAT);
      const endTime = moment(appointment.endTime, TIME_FORMAT);
      return (
        moment(appointmentDate).isSame(moment(appointment.date)) &&
        (startTime.isSame(appointmentTime.start) ||
          endTime.isSame(appointmentTime.end) ||
          startTime.isBetween(appointmentTime.start, appointmentTime.end) ||
          endTime.isBetween(appointmentTime.start, appointmentTime.end) ||
          appointmentTime.start.isBetween(startTime, endTime) ||
          appointmentTime.end.isBetween(startTime, endTime))
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
