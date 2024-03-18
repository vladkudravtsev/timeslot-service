import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAppointmentDate1710764047785 implements MigrationInterface {
  name = 'AddAppointmentDate1710764047785';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "appointment"
            ADD "date" date NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "appointment" DROP COLUMN "date"
        `);
  }
}
