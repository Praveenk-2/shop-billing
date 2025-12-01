// // Database connection pool - handles MySQL connections efficiently
// import mysql from 'mysql2/promise';
// import fs from "fs";

// const caCert = fs.readFileSync("./certs/ca.pem");

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   ssl: process.env.DB_SSL === "true" ? {
//     ca: caCert
//   } : null,
// });

// // Test connection on startup
// pool.getConnection()
//   .then(connection => {
//     console.log('✅ Database connected successfully');
//     connection.release();
//   })
//   .catch(err => {
//     console.error('❌ Database connection failed:', err.message);
//   });

// export default pool;
// export const db = pool;


import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync(path.join(process.cwd(), 'certs', 'ca.pem')),
  },
});

export default pool;
