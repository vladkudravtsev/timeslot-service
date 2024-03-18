import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

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

  @IsNumber()
  @Transform(({ value }) => Number(value))
  @Expose({ name: 'time_slot_id' })
  public timeSlotId: number;
}
