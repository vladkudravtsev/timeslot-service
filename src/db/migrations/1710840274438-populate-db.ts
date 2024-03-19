import { MigrationInterface, QueryRunner } from 'typeorm';
import { ProviderEntity } from '../entities/provider.entity';
import { ClientEntity } from '../entities/client.entity';
import { TimeSlotEntity } from '../entities/time-slot.entity';
import { TIME_SLOT_TYPE } from '../../shared/constants';

const timeSlots = [
  {
    type: TIME_SLOT_TYPE.SINGLE,
    weekDay: 'MONDAY',
    date: '2024-03-18',
    provider: {
      id: 1,
    },
    startTime: '09:00:00',
    endTime: '15:00:00',
  },
  {
    type: TIME_SLOT_TYPE.RECURRING,
    weekDay: 'WEDNESDAY',
    provider: {
      id: 1,
    },
    startTime: '10:00:00',
    endTime: '18:00:00',
  },
];

export class PopulateDb1710840274438 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.save(ProviderEntity, {
      name: 'test-provider',
    });

    await queryRunner.manager.save(ClientEntity, {
      email: 'testemail@gmail.com',
    });

    await queryRunner.manager.save(TimeSlotEntity, timeSlots);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE TABLE time_slot CASCADE');
  }
}
