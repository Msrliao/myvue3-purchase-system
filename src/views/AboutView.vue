<template>
  <div class="about">
    <el-card class="about-card">
      <template #header>
        <div class="card-header">
          <span>关于系统</span>
        </div>
      </template>
      <div class="about-content">
        <div class="about-section">
          <h2>采购管理系统</h2>
          <p>版本: 1.0.0</p>
          <p>一个基于Vue 3和TypeScript的现代化采购管理系统，提供高效的采购订单管理、查询和统计功能。</p>
        </div>
        
        <div class="features-section">
          <h3>系统特点</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="feature-item">
                <i class="el-icon-check-circle"></i>
                <span>完整的采购订单生命周期管理</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check-circle"></i>
                <span>强大的订单查询和过滤功能</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check-circle"></i>
                <span>直观的数据统计和可视化</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="feature-item">
                <i class="el-icon-check-circle"></i>
                <span>多级用户权限管理</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check-circle"></i>
                <span>响应式设计，适配多种设备</span>
              </div>
              <div class="feature-item">
                <i class="el-icon-check-circle"></i>
                <span>数据导出和报表生成</span>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <div class="tech-stack">
          <h3>技术栈</h3>
          <div class="tech-items">
            <el-tag>Vue 3</el-tag>
            <el-tag>TypeScript</el-tag>
            <el-tag>Vite</el-tag>
            <el-tag>Element Plus</el-tag>
            <el-tag>Express.js</el-tag>
            <el-tag>MySQL</el-tag>
          </div>
        </div>
        
        <div class="contact-info">
          <h3>联系我们</h3>
          <p>如有任何问题或建议，请联系系统管理员。</p>
          <p>Email: admin@example.com</p>
          <p>Phone: 123-456-7890</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 系统信息
const systemInfo = ref({
  version: '1.0.0',
  buildDate: '2023-09-18',
  lastUpdate: '2023-09-18'
})

// 加载系统信息
const loadSystemInfo = async () => {
  try {
    // 在实际项目中，这里应该调用API获取真实的系统信息
    // 由于是模拟环境，我们使用预设的信息
    console.log('系统信息已加载')
  } catch (error) {
    ElMessage.error('加载系统信息失败')
    console.error('加载系统信息失败:', error)
  }
}

// 组件挂载时加载信息
onMounted(() => {
  loadSystemInfo()
})
</script>

<style scoped>
.about {
  padding: 20px;
}

.about-card {
  width: 100%;
}

.about-content {
  padding: 20px 0;
}

.about-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.about-section h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 10px;
}

.about-section p {
  font-size: 16px;
  color: #606266;
  margin: 5px 0;
}

.features-section,
.tech-stack,
.contact-info {
  margin-bottom: 30px;
}

.features-section h3,
.tech-stack h3,
.contact-info h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  color: #606266;
}

.feature-item i {
  color: #409eff;
  margin-right: 10px;
  font-size: 18px;
}

.tech-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tech-items .el-tag {
  margin-bottom: 10px;
}

.contact-info p {
  color: #606266;
  margin: 8px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about {
    padding: 10px;
  }
  
  .el-col {
    width: 100% !important;
  }
  
  .about-section h2 {
    font-size: 20px;
  }
  
  .about-section p {
    font-size: 14px;
  }
}
</style>