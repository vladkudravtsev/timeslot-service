import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppointmentRepository {
  constructor(private readonly dataSource: DataSource) {}

  public get getDataSource() {
    return this.dataSource;
  }
}
