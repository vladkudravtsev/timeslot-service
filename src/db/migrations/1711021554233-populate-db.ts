import { MigrationInterface, QueryRunner } from 'typeorm';
import { ProviderEntity } from '../../modules/provider/provider.entity';
import { ClientEntity } from '../../modules/client/client.entity';
import { TIME_SLOT_TYPE } from '../../shared/constants';
import { TimeSlotEntity } from '../../modules/time-slot/time-slot.entity';
import { TimeSlotCommuteMethodEntity } from '../../modules/time-slot-commute-method/time-slot-commute-method.entity';

const timeSlots = [
  {
    type: TIME_SLOT_TYPE.SINGLE,
    weekDay: 'MONDAY',
    date: '2024-03-20',
    recurrenceRule:
      'DTSTART:20240320T100000Z RRULE:FREQ=MINUTELY;UNTIL=20240320T200000Z;INTERVAL=60;WKST=WE;BYHOUR=10,11,12,13,14,15,16,17,18,19',
    provider: {
      id: 1,
    },
    startTime: '10:00:00',
    endTime: '19:00:00',
  },
  {
    type: TIME_SLOT_TYPE.RECURRING,
    weekDay: 'WEDNESDAY',
    provider: {
      id: 1,
    },
    recurrenceRule:
      'DTSTART:20240318T100000Z RRULE:FREQ=MINUTELY;UNTIL=20250317T200000Z;INTERVAL=60;WKST=WE;BYDAY=WE;BYHOUR=10,11,12,13,14,15,16,17,18,19',
    startTime: '10:00:00',
    endTime: '19:00:00',
  },
];

export class PopulateDb1711021554233 implements MigrationInterface {
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
