export const knexconfig = {
  client: "mysql2",
  connection: {
    host: DB_HOST,
    port: 3306,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    connectTimeout: 60000,
  },
  pool: { min: 2, max: 10 },
};