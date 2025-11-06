import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT ?? "5432"),
  username: process.env.DB_USER || "quark_user",
  password: process.env.DB_PASSWORD || "quark_password",
  database: process.env.DB_NAME || "quark_auth",
  entities: ["src/**/*.entity{.ts,.js}"],
  migrations: ["src/migrations/**/*{.ts,.js}"],
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
});