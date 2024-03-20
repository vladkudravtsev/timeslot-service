import { BadRequestException, Injectable } from '@nestjs/common';
import { TimeSlotEntity } from './time-slot.entity';
import * as moment from 'moment';
import { TIME_FORMAT, TIME_SLOT_TYPE, WEEK_DAYS } from '../../shared/constants';
import { TimeRange } from '../../shared/types';
import { AppointmentEntity } from '../appointment/appointment.entity';

type AppointmentDateTime = {
  startTime: string;
  endTime: string;
  date: Date;
};

@Injectable()
export class TimeSlotAvailabilityService {
  /**
   * This function checks if the time slot is available for the given appointment.
   * It does the following validations:
   *   - The appointment time should be within the time slot's time range.
   *   - The appointment time should not be overlapping with any other existing appointments in the time slot.
   *   - If the time slot is of type SINGLE, the appointment date should be the same as the time slot's date.
   *   - If the time slot is of type RECURRING, the appointment date should be one of the week days of the time slot.
   */
  public checkTimeSlotAvailability(
    appointment: AppointmentDateTime,
    timeSlot: TimeSlotEntity,
  ) {
    const appointmentTime = {
      start: moment(appointment.startTime, TIME_FORMAT),
      end: moment(appointment.endTime, TIME_FORMAT),
    };
    const timeSlotTime = {
      start: moment(timeSlot.startTime, TIME_FORMAT),
      end: moment(timeSlot.endTime, TIME_FORMAT),
    };

    // Validate appointment time
    const isValidTime = this.validateTime(appointmentTime, timeSlotTime);
    if (!isValidTime) {
      throw new BadRequestException('Invalid time range');
    }

    // Check if time slot is not reserved
    const isReserved = this.isTimeSlotReserved(
      timeSlot.appointments,
      appointmentTime,
      appointment.date,
    );
    if (isReserved) {
      throw new BadRequestException('Time slot is reserved');
    }

    // Validate appointment date
    if (timeSlot.type === TIME_SLOT_TYPE.SINGLE) {
      const isSameDate = moment(appointment.date).isSame(moment(timeSlot.date));
      if (!isSameDate) {
        throw new BadRequestException('Wrong appointment date');
      }
    } else if (timeSlot.type === TIME_SLOT_TYPE.RECURRING) {
      this.checkRecurringTimeSlot(appointment, timeSlot);
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

  private checkRecurringTimeSlot(
    appointment: AppointmentDateTime,
    timeSlot: TimeSlotEntity,
  ) {
    const weekDay = moment(appointment.date).day();

    const isRescheduledDate = timeSlot.reschedules.some((reschedule) =>
      moment(reschedule.newDate).isSame(moment(appointment.date)),
    );

    if (WEEK_DAYS[weekDay] !== timeSlot.weekDay && !isRescheduledDate) {
      throw new BadRequestException('Wrong appointment date');
    }

    timeSlot.reschedules.forEach((reschedule) => {
      const rescheduleDate = moment(reschedule.rescheduleDate);
      const appointmentDate = moment(appointment.date);
      const isSameDate = rescheduleDate.isSame(appointmentDate);
      if (isSameDate) {
        throw new BadRequestException(
          `Time slot for ${appointmentDate.format('YYYY-MM-DD')} was rescheduled to ${reschedule.newDate}`,
        );
      }
    });
  }
}
