require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3041;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' }));

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00',
};

const pool = mysql.createPool(dbConfig);

let dbConnected = false;
let dbLastError = null;

async function testMySQL() {
  try {
    const conn = await pool.getConnection();
    console.log('Connected to MySQL:', process.env.DB_NAME);
    dbConnected = true;
    dbLastError = null;
    conn.release();
  } catch (err) {
    dbConnected = false;
    dbLastError = err;
    console.error('MySQL Failed:', err.message);
    console.log('Using fallback: products.json');
  }
}

async function ensureDbConnection() {
  if (dbConnected) return true;
  await testMySQL();
  return dbConnected;
}

(async function initializeDb() {
  await testMySQL();
})();

// Helper อ่านไฟล์ JSON
function getJSONPath() {
  const localPath = path.join(__dirname, 'products.json');
  if (fs.existsSync(localPath)) return localPath;
  return path.join(__dirname, '..', 'products.json');
}

function getProductsFromJSON() {
  const jsonPath = getJSONPath();
  const data = fs.readFileSync(jsonPath, 'utf-8');
  return JSON.parse(data);
}

function saveProductsToJSON(products) {
  const jsonPath = getJSONPath();
  fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), 'utf-8');
}

// 📌 1. GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    if (!dbConnected) {
      const products = getProductsFromJSON();
      return res.json(products);
    }
    
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
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

// 📌 2. ADD PRODUCT (POST) - 🟢 เพิ่ม price แล้ว
app.post('/api/products', async (req, res) => {
  const { name, category, price, stock, image } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: 'name and category are required' });
  }

  try {
    if (!dbConnected) {
      const products = getProductsFromJSON();
      const newProduct = {
        id: Date.now(),
        name,
        category,
        price: Number(price) || 0, // 👈 เพิ่ม price
        stock: Number(stock) || 0,
        image: image || null
      };
      products.unshift(newProduct);
      saveProductsToJSON(products);
      return res.status(201).json(newProduct);
    }

    const [result] = await pool.query(
      'INSERT INTO products (name, category, price, stock, image) VALUES (?, ?, ?, ?, ?)',
      [name, category, Number(price) || 0, Number(stock) || 0, image || null] // 👈 เพิ่ม price
    );
    res.status(201).json({ id: result.insertId, name, category, price: Number(price) || 0, stock, image });
  } catch (e) {
    console.error('Insert Error:', e.message);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// 📌 3. EDIT PRODUCT (PUT) - 🟢 เพิ่ม price แล้ว
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, price, stock, image } = req.body; // 👈 1. เพิ่มรับค่า price

  try {
    if (!dbConnected) {
      let products = getProductsFromJSON();
      const index = products.findIndex(p => p.id == id);

      if (index !== -1) {
        products[index] = {
          ...products[index],
          ...(name && { name }),
          ...(category && { category }),
          ...(price !== undefined && { price: Number(price) }), // 👈 2. อัปเดต price ใน JSON
          ...(stock !== undefined && { stock: Number(stock) }),
          ...(image !== undefined && { image })
        };
        saveProductsToJSON(products);
        console.log(`✅ Updated ID: ${id} in JSON`);
        return res.json(products[index]);
      } else {
        return res.status(404).json({ error: 'Product not found' });
      }
    }

    // 👈 3. อัปเดต price ใน SQL Query
    await pool.query(
      'UPDATE products SET name = ?, category = ?, price = ?, stock = ?, image = ? WHERE id = ?',
      [name, category, Number(price) || 0, stock, image, id]
    );
    res.json({ id, name, category, price, stock, image });
  } catch (e) {
    console.error('Update Error Detail:', e);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// 📌 4. DELETE PRODUCT (DELETE)
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (!dbConnected) {
      let products = getProductsFromJSON();
      products = products.filter(p => p.id != id);
      saveProductsToJSON(products);
      return res.json({ message: 'Deleted successfully' });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Deleted successfully' });
  } catch (e) {
    console.error('Delete Error:', e.message);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.get('/api/status', async (req, res) => {
  await ensureDbConnection();
  res.json({
    dbConnected,
    dbName: process.env.DB_NAME,
    error: dbLastError ? dbLastError.message : null,
  });
});

app.get('/api', (req, res) => {
  res.send('API is running');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 API running on port ${port}`);
});