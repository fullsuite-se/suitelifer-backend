import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;

console.log(`${PORT}`);
console.log(`${DB_HOST}`);
console.log(`User: ${DB_USER}`);
console.log(`PORT: ${DB_PASSWORD}`);
console.log(`PORT: ${DB_DATABASE}`);
