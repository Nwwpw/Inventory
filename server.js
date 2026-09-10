require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3041;

// 🟢 อนุญาตทุก Origin ให้เข้าถึง API ได้สะดวก
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

const authUsername = process.env.AUTH_USERNAME || 'admin';
const authPassword = process.env.AUTH_PASSWORD || 'admin123';

// 🟢 ตั้งค่า Secret สำหรับ JWT ให้ถาวร
const jwtSecret = process.env.JWT_SECRET || 'inventory-secret-key-2026';

let dbConnected = false;
let dbLastError = null;

// 🟢 Middleware ตรวจสอบ Token (ปรับแก้ให้รองรับกรณีเปิดผ่าน Browser และป้องกัน Crash)
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

  if (!token) {
    console.warn('⚠️ Authentication Notice: No Token Provided');
    return res.status(401).json({
      error: 'Unauthorized: No Token Provided'
    });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.error('❌ JWT Verify Error:', err.message);
      return res.status(403).json({
        error: 'Invalid token',
        details: err.message
      });
    }

    req.user = user;
    next();
  });
}

// 🟢 Middleware ตรวจสอบสิทธิ์ Admin (ยืดหยุ่น ตรวจสอบแบบ Case-insensitive)
function requireAdmin(req, res, next) {
  const userRole = (req.user?.role || '').toLowerCase();

  if (userRole !== 'admin') {
    console.warn(`⚠️ Access Denied for Role: ${req.user?.role}`);
    return res.status(403).json({
      error: 'Admin only'
    });
  }

  next();
}

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

// 📌 API LOGIN: ออก Token สำหรับใช้งาน
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid username or password'
      });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.status(401).json({
        error: 'Invalid username or password'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      jwtSecret,
      {
        expiresIn: '24h'
      }
    );

    console.log('✅ LOGIN SUCCESSFUL:', user.username, '| Role:', user.role);

    return res.json({
      token,
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({
      error: 'Login failed'
    });
  }
});

// 📌 1. GET ALL PRODUCTS (ปลดล็อกให้เปิดบน Browser ตรงๆ ได้ทันที)
app.get('/api/products', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  try {
    if (!dbConnected) {
      const products = getProductsFromJSON();
      const filteredProducts = search
        ? products.filter((product) => {
            const haystack = `${product.name || ''} ${product.category || ''}`.toLowerCase();
            return haystack.includes(search.toLowerCase());
          })
        : products;
      return res.json(filteredProducts);
    }

    if (search) {
      const like = `%${search}%`;
      const [rows] = await pool.query(
        'SELECT * FROM products WHERE name LIKE ? OR category LIKE ? ORDER BY id DESC',
        [like, like]
      );
      return res.json(rows);
    }

    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(rows);
  } catch (e) {
    console.error('Products Error:', e.message);
    try {
      const products = getProductsFromJSON();
      const filteredProducts = search
        ? products.filter((product) => {
            const haystack = `${product.name || ''} ${product.category || ''}`.toLowerCase();
            return haystack.includes(search.toLowerCase());
          })
        : products;
      res.json(filteredProducts);
    } catch {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }
});

// 📌 2. ADD PRODUCT (เพิ่มสินค้า - ปลดล็อกให้ทดสอบได้ง่ายขึ้น)
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
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        image: image || null
      };
      products.unshift(newProduct);
      saveProductsToJSON(products);
      return res.status(201).json(newProduct);
    }

    const [result] = await pool.query(
      'INSERT INTO products (name, category, price, stock, image) VALUES (?, ?, ?, ?, ?)',
      [name, category, Number(price) || 0, Number(stock) || 0, image || null]
    );
    res.status(201).json({ id: result.insertId, name, category, price: Number(price) || 0, stock, image });
  } catch (e) {
    console.error('Insert Error:', e.message);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// 📌 3. EDIT PRODUCT (แก้ไขสินค้า)
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category, price, stock, image } = req.body;

  try {
    if (!dbConnected) {
      let products = getProductsFromJSON();
      const index = products.findIndex(p => p.id == id);

      if (index !== -1) {
        products[index] = {
          ...products[index],
          ...(name && { name }),
          ...(category && { category }),
          ...(price !== undefined && { price: Number(price) }),
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

// 📌 4. DELETE PRODUCT (ลบสินค้า)
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

// 📌 REGISTER USER
app.post('/api/register', async (req, res) => {
  const { username, email, password, profile_image } = req.body;

  try {
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const [existingEmail] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const [result] = await pool.query(
      `
      INSERT INTO users (username, email, password, role, profile_image)
      VALUES (?, ?, ?, 'staff', ?)
      `,
      [username, email, password, profile_image || null]
    );

    res.status(201).json({
      id: result.insertId,
      username,
      email
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Register failed' });
  }
});

// 📌 GET USER PROFILE
app.get('/api/profile/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, profile_image FROM users WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('PROFILE ERROR =', err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 UPDATE USER PROFILE
app.put('/api/profile/:id', async (req, res) => {
  const { user_name, email, password } = req.body;

  try {
    await pool.query(
      'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?',
      [user_name, email, password, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 📌 UPDATE PROFILE IMAGE
app.put('/api/profile/:id/image', async (req, res) => {
  const { user_img } = req.body;

  try {
    await pool.query(
      'UPDATE users SET profile_image = ? WHERE id = ?',
      [user_img, req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('IMAGE ERROR =', err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 VERIFY PASSWORD
app.post('/api/verify-password', async (req, res) => {
  const { password } = req.body;

  try {
    const userId = req.user?.id || req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const [rows] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (rows[0].password !== password) {
      return res.status(401).json({ error: 'Password incorrect' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('VERIFY PASSWORD ERROR =', err);
    return res.status(500).json({ error: 'Verify failed' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 API running on port ${port}`);
});