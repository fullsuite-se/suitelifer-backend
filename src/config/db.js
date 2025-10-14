import mysql from "mysql2";
import knex from "knex";
import dotenv from "dotenv";
import { knexconfig } from '../config/knexConfig.js';

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

export const db = knex(knexconfig);



db.raw("SELECT 1")
  .then(() => {
    console.log(`Database CONNECTED successfully: ${DB_DATABASE} @ ${DB_HOST}`);
  })
  .catch((err) => {
    console.error("Database connection FAILED:", err.message);
  });
