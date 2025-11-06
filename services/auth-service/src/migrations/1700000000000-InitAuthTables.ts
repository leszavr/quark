import { MigrationInterface, QueryRunner } from "typeorm";

export class InitAuthTables1700000000000 implements MigrationInterface {
    name = 'InitAuthTables1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "avatar" character varying, "isActive" boolean NOT NULL DEFAULT true, "lastLogin" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "device" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "fingerprint" character varying NOT NULL, "userAgent" character varying NOT NULL, "ipAddress" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2dc1553d3e428848133565810b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "refreshToken" character varying NOT NULL, "ipAddress" character varying NOT NULL, "userAgent" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_522c088216153f39810991fa9a3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f6983b39182599e16eb09727a8" ON "device" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_4d9452bf038c7cb010a9d036a3" ON "user_session" ("userId")`);
        await queryRunner.query(`ALTER TABLE "device" ADD CONSTRAINT "FK_f6983b39182599e16eb09727a8d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_session" ADD CONSTRAINT "FK_4d9452bf038c7cb010a9d036a35" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_session" DROP CONSTRAINT "FK_4d9452bf038c7cb010a9d036a35"`);
        await queryRunner.query(`ALTER TABLE "device" DROP CONSTRAINT "FK_f6983b39182599e16eb09727a8d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4d9452bf038c7cb010a9d036a3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f6983b39182599e16eb09727a8"`);
        await queryRunner.query(`DROP TABLE "user_session"`);
        await queryRunner.query(`DROP TABLE "device"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }
}