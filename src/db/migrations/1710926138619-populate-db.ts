import { MigrationInterface, QueryRunner } from 'typeorm';
import { ProviderEntity } from '../entities/provider.entity';
import { ClientEntity } from '../entities/client.entity';
import { TIME_SLOT_TYPE } from '../../shared/constants';
import { TimeSlotEntity } from '../entities/time-slot.entity';
import { TimeSlotCommuteMethodEntity } from '../entities/time-slot-commute-method.entity';

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
export class PopulateDb1710926138619 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.save(ProviderEntity, {
      name: 'test-provider',
    });

    await queryRunner.manager.save(ClientEntity, {
      email: 'testemail@gmail.com',
    });

    const [singleTimeSlot, recurringTimeSlot] = await queryRunner.manager.save(
      TimeSlotEntity,
      timeSlots,
    );

    await queryRunner.manager.save(TimeSlotCommuteMethodEntity, [
      {
        timeSlotDate: singleTimeSlot.date,
        timeSlot: singleTimeSlot,
        commuteMethod: 'DRIVING',
      },
      {
        timeSlotDate: '03-20-2024',
        timeSlot: recurringTimeSlot,
        commuteMethod: 'WALKING',
      },
      {
        timeSlotDate: '03-27-2024',
        timeSlot: recurringTimeSlot,
        commuteMethod: 'DRIVING',
      },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE TABLE time_slot CASCADE');
    await queryRunner.query('TRUNCATE TABLE provider CASCADE');
    await queryRunner.query('TRUNCATE TABLE client CASCADE');
  }
}
