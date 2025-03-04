import mysql from "mysql2";
import { knex }from "knex";
import { knexconfig } from "./knexconfig";

import dotenv from "dotenv";
dotenv.config();

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;

export const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
});

console.log(process.env.PORT);

export const db = knex(knexconfig);
