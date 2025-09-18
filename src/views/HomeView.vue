<template>
  <div class="home">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用采购管理系统</span>
        </div>
      </template>
      <div class="welcome-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="stat-card">
              <div class="stat-icon el-icon-document">
                <i class="el-icon-document"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ totalOrders }}</div>
                <div class="stat-label">采购订单总数</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <div class="stat-icon el-icon-loading">
                <i class="el-icon-loading"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ pendingOrders }}</div>
                <div class="stat-label">待处理订单</div>
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <div class="stat-icon el-icon-circle-check">
                <i class="el-icon-circle-check"></i>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ completedOrders }}</div>
                <div class="stat-label">已完成订单</div>
              </div>
            </div>
          </el-col>
        </el-row>
        
        <div class="recent-orders">
          <h3>最近订单</h3>
          <el-table :data="recentOrders" stripe style="width: 100%">
            <el-table-column prop="order_number" label="订单编号" width="180" />
            <el-table-column prop="supplier" label="供应商" width="180" />
            <el-table-column prop="order_date" label="下单日期" width="120" />
            <el-table-column prop="total_amount" label="订单金额" width="120" formatter="formatCurrency" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="80">
              <template #default="scope">
                <el-button type="text" @click="viewOrderDetail(scope.row.id)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 订单统计数据
const totalOrders = ref(0)
const pendingOrders = ref(0)
const completedOrders = ref(0)
const recentOrders = ref<any[]>([])

// 获取订单统计信息
const fetchOrderStats = async () => {
  try {
    // 在实际项目中，这里应该调用API获取真实数据
    // 由于是模拟环境，我们使用模拟数据
    totalOrders.value = 156
    pendingOrders.value = 23
    completedOrders.value = 124
    
    // 模拟最近订单数据
    recentOrders.value = [
      {
        id: 1,
        order_number: 'PO-2023-001',
        supplier: '供应商A',
        order_date: '2023-09-15',
        total_amount: 15000.00,
        status: 'completed'
      },
      {
        id: 2,
        order_number: 'PO-2023-002',
        supplier: '供应商B',
        order_date: '2023-09-14',
        total_amount: 25000.00,
        status: 'pending'
      },
      {
        id: 3,
        order_number: 'PO-2023-003',
        supplier: '供应商C',
        order_date: '2023-09-13',
        total_amount: 18000.00,
        status: 'processing'
      },
      {
        id: 4,
        order_number: 'PO-2023-004',
        supplier: '供应商A',
        order_date: '2023-09-12',
        total_amount: 32000.00,
        status: 'completed'
      }
    ]
  } catch (error) {
    ElMessage.error('获取订单统计信息失败')
    console.error('获取订单统计信息失败:', error)
  }
}

// 格式化金额
const formatCurrency = (row: any, column: any, cellValue: any) => {
  return '¥' + cellValue.toFixed(2)
}

// 获取状态对应的标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'processing':
      return 'primary'
    case 'cancelled':
      return 'danger'
    default:
      return 'info'
  }
}

// 查看订单详情
const viewOrderDetail = (id: number) => {
  router.push({ path: `/purchase`, query: { orderId: id } })
}

// 组件挂载时获取数据
onMounted(() => {
  fetchOrderStats()
})
</script>

<style scoped>
.home {
  padding: 20px;
}

.welcome-card {
  width: 100%;
}

.welcome-content {
  padding: 20px 0;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.el-icon-document {
  background-color: #e6f7ff;
  color: #1890ff;
}

.el-icon-loading {
  background-color: #fff7e6;
  color: #fa8c16;
}

.el-icon-circle-check {
  background-color: #f6ffed;
  color: #52c41a;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.recent-orders {
  margin-top: 30px;
}

.recent-orders h3 {
  font-size: 16px;
  margin-bottom: 16px;
  color: #303133;
}
</style>