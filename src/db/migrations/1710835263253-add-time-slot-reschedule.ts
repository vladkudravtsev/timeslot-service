import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimeSlotReschedule1710835263253 implements MigrationInterface {
  name = 'AddTimeSlotReschedule1710835263253';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "time_slot_reschedule" (
                "id" SERIAL NOT NULL,
                "new_date" date NOT NULL,
                "reschedule_date" date NOT NULL,
                "time_slot_id" integer,
                CONSTRAINT "UQ_3e20d800757595837b20deeb0fb" UNIQUE ("time_slot_id", "new_date"),
                CONSTRAINT "UQ_38ec04a063087e2ad47a12be809" UNIQUE ("time_slot_id", "reschedule_date"),
                CONSTRAINT "PK_7dcf27df0049de666c7b7734852" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slot_reschedule"
            ADD CONSTRAINT "FK_193b50b76081b6bd3ac5491d696" FOREIGN KEY ("time_slot_id") REFERENCES "time_slot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_slot_reschedule" DROP CONSTRAINT "FK_193b50b76081b6bd3ac5491d696"
        `);
    await queryRunner.query(`
            DROP TABLE "time_slot_reschedule"
        `);
  }
}
