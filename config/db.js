import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'psbi_db',
    port: process.env.DB_PORT || 3306, // TAMBAHAN 1: Membaca port dari Vercel
    ssl: {                             // TAMBAHAN 2: Wajib untuk Aiven Cloud
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool.promise();