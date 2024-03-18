import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/data-source';
import { TimeSlotModule } from './modules/time-slot/time-slot.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
