import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommuteMethod1710922705751 implements MigrationInterface {
  name = 'AddCommuteMethod1710922705751';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "time_slot_commute_method" (
                "id" SERIAL NOT NULL,
                "commute_method" character varying NOT NULL,
                "time_slot_date" date NOT NULL,
                "time_slot_id" integer NOT NULL,
                CONSTRAINT "UQ_dd676ab101ac93162742d6ba71e" UNIQUE ("time_slot_id", "time_slot_date"),
                CONSTRAINT "PK_f23398b6d67bc2cd317957d4925" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slot_commute_method"
            ADD CONSTRAINT "FK_50d6b398db726283fefe5f949c2" FOREIGN KEY ("time_slot_id") REFERENCES "time_slot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "time_slot_commute_method" DROP CONSTRAINT "FK_50d6b398db726283fefe5f949c2"
        `);
    await queryRunner.query(`
            DROP TABLE "time_slot_commute_method"
        `);
  }
}
