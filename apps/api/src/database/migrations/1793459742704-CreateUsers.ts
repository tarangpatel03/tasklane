import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1793459742704 implements MigrationInterface {
  name = 'CreateUsers1793459742704';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'MANAGER', 'EMPLOYEE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_status" AS ENUM('invited', 'active', 'deactivated')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120) NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying, "role" "public"."user_role" NOT NULL, "status" "public"."user_status" NOT NULL DEFAULT 'invited', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    // Added by hand: TypeORM cannot generate expression indexes. Makes email unique case-insensitively.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_email_lower" ON "users" (lower("email"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_users_email_lower"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."user_status"`);
    await queryRunner.query(`DROP TYPE "public"."user_role"`);
  }
}
