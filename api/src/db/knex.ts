import "dotenv/config";
import { knex as k, Knex } from "knex";

const config: Knex.Config = {
  client: "pg",
  connection: process.env.DATABASE_URL!,
  pool: { min: 1, max: 5 },
};

export const knex = k(config);
