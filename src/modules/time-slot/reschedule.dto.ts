import { Expose, Transform } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class RescheduleDTO {
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @Expose({ name: 'new_date' })
  newDate: Date;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @Expose({ name: 'time_slot_date' })
  timeSlotDate?: Date;
}
