import { Expose, Transform } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateAppointmentDTO {
  @IsString()
  @Expose({ name: 'start_time' })
  public startTime: string;

  @IsString()
  @Expose({ name: 'end_time' })
  public endTime: string;

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
