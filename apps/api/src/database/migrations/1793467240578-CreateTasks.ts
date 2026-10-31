import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasks1793467240578 implements MigrationInterface {
  name = 'CreateTasks1793467240578';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "task_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "task_id" uuid NOT NULL, "author_id" uuid NOT NULL, "body" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_83b99b0b03db29d4cafcb579b77" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_608fdc50eb832e128ac4167078" ON "task_comments"  ("task_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."task_status" AS ENUM('TODO', 'WORKING', 'IN_REVIEW', 'COMPLETED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "task_status_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "task_id" uuid NOT NULL, "from_status" "public"."task_status", "to_status" "public"."task_status" NOT NULL, "actor_id" uuid NOT NULL, "comment" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_09bb53afe7af0749af25fc2b52d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_513f494fa44f600d13dedc0646" ON "task_status_history"  ("task_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."task_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(120) NOT NULL, "description" character varying(2000), "priority" "public"."task_priority" NOT NULL DEFAULT 'MEDIUM', "status" "public"."task_status" NOT NULL DEFAULT 'TODO', "due_date" TIMESTAMP WITH TIME ZONE, "requires_review" boolean NOT NULL DEFAULT true, "manager_id" uuid, "created_by" uuid NOT NULL, "completed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_707cfc415c7c12d38dfc2ec8eb" ON "tasks"  ("due_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9fc727aef9e222ebd09dc8dac0" ON "tasks"  ("created_by") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_47446bfd97f5bf1b666def7d3e" ON "tasks"  ("manager_id", "status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "task_assignees" ("task_id" uuid NOT NULL, "user_id" uuid NOT NULL, "added_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7ae8012667c1cc4ca8266002afc" PRIMARY KEY ("task_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bb8051e376a2b083e074678cb6" ON "task_assignees"  ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD CONSTRAINT "FK_ba9e465cfc707006e60aae59946" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" ADD CONSTRAINT "FK_76901a920ba9ec5be8dbd64d747" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_status_history" ADD CONSTRAINT "FK_984dd79c26d9f7dfec056068176" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_status_history" ADD CONSTRAINT "FK_cb359f43223e7435f9207717946" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_2f08f1ccbb1f500bfb2f863bcce" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_9fc727aef9e222ebd09dc8dac08" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD CONSTRAINT "FK_0141288f2306f20da9a60ec8d69" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" ADD CONSTRAINT "FK_bb8051e376a2b083e074678cb60" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP CONSTRAINT "FK_bb8051e376a2b083e074678cb60"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_assignees" DROP CONSTRAINT "FK_0141288f2306f20da9a60ec8d69"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_9fc727aef9e222ebd09dc8dac08"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_2f08f1ccbb1f500bfb2f863bcce"`);
    await queryRunner.query(
      `ALTER TABLE "task_status_history" DROP CONSTRAINT "FK_cb359f43223e7435f9207717946"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_status_history" DROP CONSTRAINT "FK_984dd79c26d9f7dfec056068176"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP CONSTRAINT "FK_76901a920ba9ec5be8dbd64d747"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_comments" DROP CONSTRAINT "FK_ba9e465cfc707006e60aae59946"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_bb8051e376a2b083e074678cb6"`);
    await queryRunner.query(`DROP TABLE "task_assignees"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_47446bfd97f5bf1b666def7d3e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9fc727aef9e222ebd09dc8dac0"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_707cfc415c7c12d38dfc2ec8eb"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "public"."task_priority"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_513f494fa44f600d13dedc0646"`);
    await queryRunner.query(`DROP TABLE "task_status_history"`);
    await queryRunner.query(`DROP TYPE "public"."task_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_608fdc50eb832e128ac4167078"`);
    await queryRunner.query(`DROP TABLE "task_comments"`);
  }
}
