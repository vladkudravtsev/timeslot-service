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

        // Reschedule all appointments that belong to the specific date
        await Promise.all(
          timeSlot.appointments
            .filter((appointment) =>
              moment(appointment.startDate).isSame(
                moment(rescheduleDto.timeSlotDate),
                'day',
              ),
            )
            .map(async (appointment) => {
              const startDate = this.addTimeFromDate(
                rescheduleDto.newDate,
                appointment.startDate,
              );
              const endDate = this.addTimeFromDate(
                rescheduleDto.newDate,
                appointment.endDate,
              );

              // add the new date to exdates
              newRrule.exdate(startDate);

              return manager.save(AppointmentEntity, {
                ...appointment,
                startDate,
                endDate,
              });
            }),
        );

        await manager.update(TimeSlotEntity, id, {
          recurrenceRule: newRrule.toString(),
        });
      } else if (timeSlot.type === TIME_SLOT_TYPE.SINGLE) {
        const newRrule = this.createSingleRule(rruleSet, rescheduleDto);

        await manager.update(TimeSlotEntity, id, {
          recurrenceRule: newRrule,
          date: rescheduleDto.newDate,
        });

        // update all appointments that belong to the time slot
        await Promise.all(
          timeSlot.appointments.map(async (appointment) => {
            appointment.startDate = this.addTimeFromDate(
              rescheduleDto.newDate,
              appointment.startDate,
            );

            appointment.endDate = this.addTimeFromDate(
              rescheduleDto.newDate,
              appointment.endDate,
            );

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

    return rruleClone;
  }

  private createSingleRule(rruleSet: RRuleSet, rescheduleDate: RescheduleDTO) {
    const [rrule] = rruleSet.rrules();
    const newDate = moment(rescheduleDate.newDate);

    const newRruleSet = new RRuleSet();
    // exclude all appointments with new dates
    rruleSet.exdates().forEach((exdate) => {
      newRruleSet.exdate(
        moment(exdate)
          .set({
            year: newDate.year(),
            month: newDate.month(),
            date: newDate.date(),
          })
          .toDate(),
      );
    });

    const newRrule = new RRule({
      ...rrule.options,
      dtstart: newDate.startOf('day').toDate(),
      until: newDate.endOf('day').toDate(),
    });
    newRruleSet.rrule(newRrule);

    return newRruleSet.toString();
  }

  private addTimeFromDate(date: Date, time: Date) {
    return moment(date)
      .set('hours', time.getHours())
      .set('minutes', time.getMinutes())
      .toDate();
  }
}
