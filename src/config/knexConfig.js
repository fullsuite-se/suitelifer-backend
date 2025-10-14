// import dotenv from 'dotenv';
// dotenv.config();

// const PORT = process.env.PORT;
// const DB_HOST = process.env.DB_HOST;
// const DB_USER = process.env.DB_USER;
// const DB_PASSWORD = process.env.DB_PASSWORD;
// const DB_DATABASE = process.env.DB_DATABASE;
// const DB_CA = process.env.DB_CA

// export const knexconfig = {
//   client: "mysql2",
//   connection: {
//     host: DB_HOST,
//     port: PORT,
//     user: DB_USER,
//     password: DB_PASSWORD,
//     database: DB_DATABASE,
//     ssl: { rejectUnauthorized: true, ca:  DB_CA },
//     connectTimeout: 60000,
//   },
//   pool: { min: 2, max: 10 },
// };
import dotenv from 'dotenv';
dotenv.config();

const DB_PORT = process.env.DB_PORT;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_CA  = process.env.DB_CA;

export const knexconfig = {
  client: "mysql2",
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    ssl: { 
      rejectUnauthorized: true,
      ca: DB_CA
    },
    connectTimeout: 60000,
  },
  pool: { 
    min: 0, 
    max: 5,
    acquireTimeoutMillis: 60000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  },
};