import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthTokens1793465265278 implements MigrationInterface {
  name = 'CreateAuthTokens1793465265278';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."auth_token_type" AS ENUM('setup', 'reset')`);
    await queryRunner.query(
      `CREATE TABLE "auth_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" "public"."auth_token_type" NOT NULL, "token_hash" character varying(64) NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_41e9ddfbb32da18c4e85e45c2fd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9691367d446cd8b18f462c191b" ON "auth_tokens"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3a94cfa1eada85ac2bf6f3016b" ON "auth_tokens"  ("token_hash") `,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_tokens" ADD CONSTRAINT "FK_9691367d446cd8b18f462c191b3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_tokens" DROP CONSTRAINT "FK_9691367d446cd8b18f462c191b3"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_3a94cfa1eada85ac2bf6f3016b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9691367d446cd8b18f462c191b"`);
    await queryRunner.query(`DROP TABLE "auth_tokens"`);
    await queryRunner.query(`DROP TYPE "public"."auth_token_type"`);
  }
}
