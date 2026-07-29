require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3085;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' }));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+07:00"
});

let dbConnected = false;

(async function testMySQL() {
  try {
    const conn = await pool.getConnection();
    console.log('Connected to MySQL:', process.env.DB_NAME);
    dbConnected = true;
    conn.release();
  } catch (err) {
    console.error('MySQL Failed:', err.message);
    console.log('Using fallback: products.json');
  }
})();

function getProductsFromJSON() {
  const jsonPath = path.join(__dirname, '..', 'products.json');
  const data = fs.readFileSync(jsonPath, 'utf-8');
  return JSON.parse(data);
}

app.get('/api/products', async (req, res) => {
  try {
    if (!dbConnected) {
      const products = getProductsFromJSON();
      return res.json(products);
    }
    
    const [rows] = await pool.query(
      'SELECT * FROM products ORDER BY id DESC'
    );
    res.json(rows);
  } catch (e) {
    console.error('Products Error:', e.message);
    try {
      const products = getProductsFromJSON();
      res.json(products);
    } catch {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, category, stock, image } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'name and category are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO products (name, category, stock, image) VALUES (?, ?, ?, ?)',
      [name, category, stock || 0, image || null]
    );
    res.status(201).json({ id: result.insertId, name, category, stock, image });
  } catch (e) {
    console.error('Insert Error:', e.message);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

app.get('/api', (req, res) => {
  res.send('API is running');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 API running on port ${port}`);
});