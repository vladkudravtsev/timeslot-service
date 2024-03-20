import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRecurrenceRule1710942227102 implements MigrationInterface {
  name = 'AddRecurrenceRule1710942227102';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_slot"
            ADD "recurrence_rule" character varying NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_slot" DROP COLUMN "recurrence_rule"
        `);
  }
}
