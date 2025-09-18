const mysql = require('mysql2/promise');

// 创建数据库连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'myvue3_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 封装查询方法
const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

// 封装事务方法
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// 测试连接
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
};

// 导出方法
exports.query = query;
exports.transaction = transaction;
exports.testConnection = testConnection;
exports.pool = pool;