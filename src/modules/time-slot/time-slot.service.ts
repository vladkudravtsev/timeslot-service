import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TimeSlotEntity } from '../../db/entities/time-slot.entity';
import { TimeSlotRepository } from './time-slot.repository';
import { AppointmentEntity } from '../../db/entities/appointment.entity';
import { RescheduleDTO } from './reschedule.dto';
import * as moment from 'moment';
import { TimeSlotRescheduleEntity } from '../../db/entities/time-slot-reschedule.entity';
import { TIME_SLOT_TYPE, WEEK_DAYS } from '../../shared/constants';

@Injectable()
export class TimeSlotService {
  constructor(private readonly repository: TimeSlotRepository) {}

  public async getTimeSlots(): Promise<TimeSlotEntity[]> {
    return this.repository.getTimeSlots();
  }

  public async rescheduleTimeSlot(id: number, rescheduleDto: RescheduleDTO) {
    await this.repository.getDataSource.transaction(async (manager) => {
      const timeSlot = await manager.findOne(TimeSlotEntity, {
        where: { id },
        relations: ['appointments'],
      });

      if (!timeSlot) {
        throw new NotFoundException('Time slot not found');
      }

      if (timeSlot.type === TIME_SLOT_TYPE.RECURRING) {
        const weekDay = moment(rescheduleDto.timeSlotDate).day();

        if (WEEK_DAYS[weekDay] !== timeSlot.weekDay) {
          throw new BadRequestException('Invalid time slot date');
        }

        // Reschedule all appointments that belong to the specific date
        await Promise.all(
          timeSlot.appointments
            .filter((appointment) =>
              moment(appointment.date).isSame(
                moment(rescheduleDto.timeSlotDate),
              ),
            )
            .map((appointment) => {
              return manager.save(AppointmentEntity, {
                ...appointment,
                date: rescheduleDto.newDate,
              });
            }),
        );
      } else if (timeSlot.type === TIME_SLOT_TYPE.SINGLE) {
        if (!moment(rescheduleDto.timeSlotDate).isSame(timeSlot.date)) {
          throw new BadRequestException('Invalid time slot date');
        }

        await Promise.all(
          timeSlot.appointments.map(async (appointment) => {
            appointment.date = rescheduleDto.newDate;

            return manager.save(AppointmentEntity, {
              ...appointment,
            });
          }),
        );

        await manager.save(TimeSlotEntity, {
          ...timeSlot,
          date: rescheduleDto.newDate,
        });
      }

      await manager.insert(TimeSlotRescheduleEntity, {
        newDate: rescheduleDto.newDate,
        rescheduleDate: rescheduleDto.timeSlotDate,
        timeSlot: timeSlot,
      });
    });
  }
}
