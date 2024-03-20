import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/data-source';
import { TimeSlotModule } from './modules/time-slot/time-slot.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { ProviderModule } from './modules/provider/provider.module';
import { ClientModule } from './modules/client/client.module';
import { TimeSlotCommuteMethodModule } from './modules/time-slot-commute-method/time-slot-commute-method.module';
import { AttachmentModule } from './modules/attachment/attachment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/db/migrations/*{.ts,.js}'],
      migrationsRun: true,
    }),
    TimeSlotModule,
    AppointmentModule,
    ProviderModule,
    ClientModule,
    TimeSlotCommuteMethodModule,
    AttachmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
