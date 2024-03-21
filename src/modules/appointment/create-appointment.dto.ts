import { Expose, Transform } from 'class-transformer';
import { IsDate, IsNumber } from 'class-validator';

export class CreateAppointmentDTO {
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @Expose({ name: 'client_id' })
  public clientId: number;

  @IsDate()
  @Transform(({ value }) => new Date(value))
  public date: Date;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  @Expose({ name: 'time_slot_id' })
  public timeSlotId: number;
}
