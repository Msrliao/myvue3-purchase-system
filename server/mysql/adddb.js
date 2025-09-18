const db = require('./db');

// 创建数据库表结构
const createTables = async () => {
  try {
    // 用户表
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // 采购订单表
    await db.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        supplier VARCHAR(100) NOT NULL,
        order_date DATE NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    
    // 采购订单详情表
    await db.query(`
      CREATE TABLE IF NOT EXISTS purchase_order_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_name VARCHAR(100) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10, 2) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE
      )
    `);
    
    // 供应商表
    await db.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        contact VARCHAR(50),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Tables created successfully');
    
    // 初始化管理员用户
    await initializeAdminUser();
    
    // 插入示例数据
    await insertSampleData();
    
  } catch (error) {
    console.error('Error creating tables:', error.message);
  } finally {
    // 关闭连接池
    db.pool.end();
  }
};

// 初始化管理员用户
const initializeAdminUser = async () => {
  try {
    // 检查是否已存在管理员用户
    const existingAdmin = await db.query('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (existingAdmin.length === 0) {
      // 密码: admin123
      const hashedPassword = '$2b$10$5QJZ0yQ4Z0yQ4Z0yQ4Z0yO.5QJZ0yQ4Z0yQ4Z0yQ4Z0yQ4Z0yQ4Z';
      await db.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['admin', hashedPassword, 'admin']
      );
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
};

// 插入示例数据
const insertSampleData = async () => {
  try {
    // 检查是否已有示例数据
    const existingOrders = await db.query('SELECT COUNT(*) as count FROM purchase_orders');
    
    if (existingOrders[0].count === 0) {
      // 插入示例订单
      const orderResults = await db.query(
        'INSERT INTO purchase_orders (order_number, supplier, order_date, total_amount, status) VALUES ?',
        [
          [
            ['PO-2023-001', '供应商A', '2023-01-15', 15000.00, 'completed'],
            ['PO-2023-002', '供应商B', '2023-01-20', 25000.00, 'pending'],
            ['PO-2023-003', '供应商C', '2023-02-01', 18000.00, 'completed'],
            ['PO-2023-004', '供应商A', '2023-02-10', 32000.00, 'processing'],
            ['PO-2023-005', '供应商B', '2023-02-15', 12000.00, 'completed']
          ]
        ]
      );
      
      // 插入订单详情
      for (let i = 0; i < 5; i++) {
        const orderId = orderResults.insertId + i;
        const orderNumber = `PO-2023-${String(i + 1).padStart(3, '0')}`;
        
        // 为每个订单插入2-4个商品
        const itemCount = Math.floor(Math.random() * 3) + 2;
        const items = [];
        
        for (let j = 0; j < itemCount; j++) {
          const productName = `产品${String(j + 1).padStart(2, '0')}`;
          const quantity = Math.floor(Math.random() * 10) + 1;
          const unitPrice = Math.floor(Math.random() * 1000) + 100;
          const amount = quantity * unitPrice;
          
          items.push([orderId, productName, quantity, unitPrice, amount]);
        }
        
        await db.query(
          'INSERT INTO purchase_order_details (order_id, product_name, quantity, unit_price, amount) VALUES ?',
          [items]
        );
      }
      
      console.log('Sample data inserted successfully');
    }
  } catch (error) {
    console.error('Error inserting sample data:', error.message);
  }
};

// 执行创建表结构
createTables();