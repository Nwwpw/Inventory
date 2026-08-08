require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

(async () => {
  try {
    const sqlPath = path.join(__dirname, '..', 'products.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0,
      multipleStatements: true,
      timezone: '+07:00'
    });

    const conn = await pool.getConnection();
    console.log('Connected, running import...');
    await conn.query('SET FOREIGN_KEY_CHECKS=0;');
    await conn.query(sql);
    await conn.query('SET FOREIGN_KEY_CHECKS=1;');
    conn.release();
    await pool.end();

    console.log('IMPORT_OK');
  } catch (err) {
    console.error('IMPORT_ERR', err && err.code, err && err.message);
    process.exitCode = 1;
  }
})();
