import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDataSchema1711021513955 implements MigrationInterface {
  name = 'InitDataSchema1711021513955';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "provider" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                CONSTRAINT "PK_6ab2f66d8987bf1bfdd6136a2d5" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "client" (
                "id" SERIAL NOT NULL,
                "email" character varying NOT NULL,
                CONSTRAINT "PK_96da49381769303a6515a8785c7" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "appointment" (
                "id" SERIAL NOT NULL,
                "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
                "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
                "time_slot_id" integer NOT NULL,
                "client_id" integer NOT NULL,
                CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "time_slot" (
                "id" SERIAL NOT NULL,
                "week_day" character varying NOT NULL,
                "date" date,
                "start_time" TIME NOT NULL,
                "end_time" TIME NOT NULL,
                "type" character varying NOT NULL,
                "recurrence_rule" character varying NOT NULL,
                "provider_id" integer NOT NULL,
                CONSTRAINT "PK_03f782f8c4af029253f6ad5bacf" PRIMARY KEY ("id")
            )
        `);
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
            CREATE TABLE "attachment" (
                "id" SERIAL NOT NULL,
                "original_name" character varying NOT NULL,
                "path" character varying NOT NULL,
                "appointment_id" integer NOT NULL,
                CONSTRAINT "PK_d2a80c3a8d467f08a750ac4b420" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            ALTER TABLE "appointment"
            ADD CONSTRAINT "FK_e0b33b07a7c731e82a1d9772244" FOREIGN KEY ("time_slot_id") REFERENCES "time_slot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "appointment"
            ADD CONSTRAINT "FK_86361ca7754614e2602af531c74" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slot"
            ADD CONSTRAINT "FK_3a26fe357f3d0685241e857097f" FOREIGN KEY ("provider_id") REFERENCES "provider"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slot_commute_method"
            ADD CONSTRAINT "FK_50d6b398db726283fefe5f949c2" FOREIGN KEY ("time_slot_id") REFERENCES "time_slot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE "attachment"
            ADD CONSTRAINT "FK_a0f636d120d727501e5e9c52ebd" FOREIGN KEY ("appointment_id") REFERENCES "appointment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "attachment" DROP CONSTRAINT "FK_a0f636d120d727501e5e9c52ebd"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slot_commute_method" DROP CONSTRAINT "FK_50d6b398db726283fefe5f949c2"
        `);
    await queryRunner.query(`
            ALTER TABLE "time_slot" DROP CONSTRAINT "FK_3a26fe357f3d0685241e857097f"
        `);
    await queryRunner.query(`
            ALTER TABLE "appointment" DROP CONSTRAINT "FK_86361ca7754614e2602af531c74"
        `);
    await queryRunner.query(`
            ALTER TABLE "appointment" DROP CONSTRAINT "FK_e0b33b07a7c731e82a1d9772244"
        `);
    await queryRunner.query(`
            DROP TABLE "attachment"
        `);
    await queryRunner.query(`
            DROP TABLE "time_slot_commute_method"
        `);
    await queryRunner.query(`
            DROP TABLE "time_slot"
        `);
    await queryRunner.query(`
            DROP TABLE "appointment"
        `);
    await queryRunner.query(`
            DROP TABLE "client"
        `);
    await queryRunner.query(`
            DROP TABLE "provider"
        `);
  }
}
