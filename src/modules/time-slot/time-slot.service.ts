import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TimeSlotEntity } from './time-slot.entity';
import { TimeSlotRepository } from './time-slot.repository';
import { AppointmentEntity } from '../appointment/appointment.entity';
import { RescheduleDTO } from './reschedule.dto';
import * as moment from 'moment';
import { TIME_SLOT_TYPE } from '../../shared/constants';
import { RRule, RRuleSet, rrulestr } from 'rrule';

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

      const rruleSet = rrulestr(timeSlot.recurrenceRule, {
        forceset: true,
      }) as RRuleSet;

      if (timeSlot.type === TIME_SLOT_TYPE.RECURRING) {
        if (!rescheduleDto.timeSlotDate) {
          throw new BadRequestException(
            'Time slot date for recurring time slot is required',
          );
        }

        const newRrule = this.createRecurringRules(rruleSet, rescheduleDto);

        await manager.update(TimeSlotEntity, id, {
          recurrenceRule: newRrule,
        });

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
        const newRrule = this.createSingleRule(rruleSet, rescheduleDto);

        await manager.update(TimeSlotEntity, id, {
          recurrenceRule: newRrule,
        });

        // update all appointments that belong to the time slot
        await Promise.all(
          timeSlot.appointments.map(async (appointment) => {
            appointment.date = rescheduleDto.newDate;

            return manager.save(AppointmentEntity, {
              ...appointment,
            });
          }),
        );
      }
    });
  }

  private createRecurringRules(
    rruleSet: RRuleSet,
    rescheduleDate: RescheduleDTO,
  ) {
    const rruleClone = rruleSet.clone();
    const [rrule] = rruleClone.rrules();

    const timeSlotDate = moment(rescheduleDate.timeSlotDate);
    const newDate = moment(rescheduleDate.newDate);

    // exclude all datetimes for specific day
    rruleClone.exrule(
      new RRule({
        interval: rrule.options.interval,
        until: timeSlotDate.endOf('day').toDate(),
        freq: rrule.options.freq,
        bymonth: timeSlotDate.month() + 1,
        bymonthday: timeSlotDate.date(),
      }),
    );

    // include new date
    rruleClone.rrule(
      new RRule({
        interval: rrule.options.interval,
        until: newDate.endOf('day').toDate(),
        byhour: rrule.options.byhour,
        bymonth: newDate.month() + 1,
        bymonthday: newDate.date(),
        freq: rrule.options.freq,
      }),
    );

    return rruleClone.toString();
  }

  private createSingleRule(rruleSet: RRuleSet, rescheduleDate: RescheduleDTO) {
    const [rrule] = rruleSet.rrules();
    const newDate = moment(rescheduleDate.newDate);
    const newRrule = new RRule({
      ...rrule.options,
      dtstart: newDate.startOf('day').toDate(),
      until: newDate.endOf('day').toDate(),
    });

    return newRrule.toString();
  }
}
