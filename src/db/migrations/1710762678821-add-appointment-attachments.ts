import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAppointmentAttachments1710762678821
  implements MigrationInterface
{
  name = 'AddAppointmentAttachments1710762678821';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "attachment" (
                "id" SERIAL NOT NULL,
                "original_name" character varying NOT NULL,
                "path" character varying NOT NULL,
                "appointment_id" integer,
                CONSTRAINT "PK_d2a80c3a8d467f08a750ac4b420" PRIMARY KEY ("id")
            )
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
            DROP TABLE "attachment"
        `);
  }
}
