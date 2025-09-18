const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./mysql/db');
const userService = require('./services/userService');

const app = express();
const PORT = 3001;

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 测试数据库连接
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT 1 + 1 AS solution');
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 用户相关接口
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userService.login(username, password);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 采购订单查询接口
app.get('/api/purchase/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10, orderNumber, supplier, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM purchase_orders WHERE 1=1';
    const params = [];
    
    if (orderNumber) {
      query += ' AND order_number LIKE ?';
      params.push(`%${orderNumber}%`);
    }
    
    if (supplier) {
      query += ' AND supplier LIKE ?';
      params.push(`%${supplier}%`);
    }
    
    if (startDate) {
      query += ' AND order_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND order_date <= ?';
      params.push(endDate);
    }
    
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const orders = await db.query(query, params);
    
    // 获取总数
    const countQuery = 'SELECT COUNT(*) as total FROM purchase_orders WHERE 1=1';
    const countParams = params.slice(0, -2); // 移除limit和offset参数
    const [{ total }] = await db.query(countQuery, countParams);
    
    res.json({
      success: true,
      data: {
        list: orders,
        pagination: {
          total: total,
          page: parseInt(page),
          pageSize: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取采购订单详情
app.get('/api/purchase/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await db.query('SELECT * FROM purchase_orders WHERE id = ?', [id]);
    
    if (order.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // 获取订单详情
    const orderDetails = await db.query('SELECT * FROM purchase_order_details WHERE order_id = ?', [id]);
    
    res.json({
      success: true,
      data: {
        ...order[0],
        details: orderDetails
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;