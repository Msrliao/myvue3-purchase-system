const db = require('../mysql/db');
const bcrypt = require('bcryptjs');

// 用户服务模块
const userService = {
  // 用户登录
  async login(username, password) {
    try {
      // 查找用户
      const users = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      
      if (users.length === 0) {
        throw new Error('用户不存在');
      }
      
      const user = users[0];
      
      // 验证密码
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        throw new Error('密码错误');
      }
      
      // 返回用户信息（不包含密码）
      const { password: _, ...userInfo } = user;
      return userInfo;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取用户列表
  async getUsers(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const users = await db.query('SELECT id, username, role, created_at, updated_at FROM users LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)]);
      
      // 获取总数
      const [{ total }] = await db.query('SELECT COUNT(*) as total FROM users');
      
      return {
        list: users,
        pagination: {
          total,
          page: parseInt(page),
          pageSize: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  },
  
  // 创建用户
  async createUser(username, password, role = 'user') {
    try {
      // 检查用户是否已存在
      const existingUsers = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      
      if (existingUsers.length > 0) {
        throw new Error('用户名已存在');
      }
      
      // 加密密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // 创建用户
      const result = await db.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role]
      );
      
      // 返回创建的用户信息
      const [newUser] = await db.query('SELECT id, username, role, created_at FROM users WHERE id = ?', [result.insertId]);
      return newUser;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新用户
  async updateUser(id, data) {
    try {
      // 检查用户是否存在
      const existingUsers = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      
      if (existingUsers.length === 0) {
        throw new Error('用户不存在');
      }
      
      const userData = {};
      
      // 构建更新数据
      if (data.username) {
        // 检查新用户名是否已存在
        const nameCheck = await db.query('SELECT * FROM users WHERE username = ? AND id != ?', [data.username, id]);
        if (nameCheck.length > 0) {
          throw new Error('用户名已存在');
        }
        userData.username = data.username;
      }
      
      if (data.password) {
        // 加密新密码
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(data.password, salt);
      }
      
      if (data.role) {
        userData.role = data.role;
      }
      
      // 执行更新
      if (Object.keys(userData).length > 0) {
        const updateFields = Object.keys(userData).map(key => `${key} = ?`).join(', ');
        const updateValues = Object.values(userData);
        updateValues.push(id);
        
        await db.query(`UPDATE users SET ${updateFields} WHERE id = ?`, updateValues);
      }
      
      // 返回更新后的用户信息
      const [updatedUser] = await db.query('SELECT id, username, role, created_at, updated_at FROM users WHERE id = ?', [id]);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除用户
  async deleteUser(id) {
    try {
      // 检查用户是否存在
      const existingUsers = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      
      if (existingUsers.length === 0) {
        throw new Error('用户不存在');
      }
      
      // 执行删除
      await db.query('DELETE FROM users WHERE id = ?', [id]);
      
      return { success: true, message: '用户删除成功' };
    } catch (error) {
      throw error;
    }
  },
  
  // 根据ID获取用户信息
  async getUserById(id) {
    try {
      const users = await db.query('SELECT id, username, role, created_at, updated_at FROM users WHERE id = ?', [id]);
      
      if (users.length === 0) {
        throw new Error('用户不存在');
      }
      
      return users[0];
    } catch (error) {
      throw error;
    }
  }
};

export default userService;