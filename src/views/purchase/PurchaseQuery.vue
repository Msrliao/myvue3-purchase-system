<template>
  <div class="purchase-query-container">
    <div class="query-header">
      <el-card class="query-card">
        <el-form :inline="true" :model="purchaseData" class="demo-form-inline">
          <el-form-item label="供货商">
            <el-input v-model="purchaseData.GHS" placeholder="请输入供货商名称"></el-input>
          </el-form-item>
          <el-form-item label="日期区间">
            <el-date-picker
              v-model="purchaseData.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']"
            />
          </el-form-item>
          <el-form-item label="单据编号">
            <el-input v-model="purchaseData.DJBH" placeholder="请输入单据编号"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    
    <div class="table-container">
      <el-table ref="oneTableRef" :data="oneTableData" style="width: 100%">
        <el-table-column prop="DJBH" label="单据编号" width="180" />
        <el-table-column prop="GHS" label="供货商" width="180" />
        <el-table-column prop="RQ" label="日期" width="180" />
        <el-table-column prop="JE" label="金额" width="120" />
        <el-table-column prop="YSHJE" label="已审核金额" width="150" />
        <el-table-column prop="WSHJE" label="未审核金额" width="150" />
        <el-table-column prop="ZDR" label="制单人" width="120" />
        <el-table-column prop="SHR" label="审核人" width="120" />
        <el-table-column prop="ZT" label="状态" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.ZT === '已审核'" type="success">{{ scope.row.ZT }}</el-tag>
            <el-tag v-else-if="scope.row.ZT === '未审核'" type="warning">{{ scope.row.ZT }}</el-tag>
            <el-tag v-else>{{ scope.row.ZT }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleViewDetail(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 采购详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="采购详情" width="70%" :before-close="handleClose">
      <div class="detail-content">
        <div class="detail-header">
          <div class="detail-info">
            <span class="detail-item"><strong>单据编号：</strong>{{ currentDetail?.DJBH }}</span>
            <span class="detail-item"><strong>供货商：</strong>{{ currentDetail?.GHS }}</span>
            <span class="detail-item"><strong>日期：</strong>{{ currentDetail?.RQ }}</span>
            <span class="detail-item"><strong>制单人：</strong>{{ currentDetail?.ZDR }}</span>
            <span class="detail-item"><strong>状态：</strong>
              <el-tag v-if="currentDetail?.ZT === '已审核'" type="success">{{ currentDetail?.ZT }}</el-tag>
              <el-tag v-else-if="currentDetail?.ZT === '未审核'" type="warning">{{ currentDetail?.ZT }}</el-tag>
              <el-tag v-else>{{ currentDetail?.ZT }}</el-tag>
            </span>
          </div>
        </div>
        
        <div class="detail-table">
          <el-table :data="detailItems" style="width: 100%">
            <el-table-column prop="WZBH" label="物资编号" width="120" />
            <el-table-column prop="WZMC" label="物资名称" width="180" />
            <el-table-column prop="GG" label="规格" width="120" />
            <el-table-column prop="DW" label="单位" width="80" />
            <el-table-column prop="SL" label="数量" width="100" />
            <el-table-column prop="DJ" label="单价" width="100" />
            <el-table-column prop="JE" label="金额" width="120" />
          </el-table>
        </div>
        
        <div class="detail-footer">
          <div class="total-amount">
            <strong>总金额：</strong>{{ currentDetail?.JE }}
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { TableInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash-es'
import { useTableColumnsStore } from '@/store/modules/tableColumns'
import { storeToRefs } from 'pinia'
import PurchaseDataTableColumns from './columns/PurchaseDataTableColumns'

// 采购数据
const purchaseData = reactive({
  GHS: '',
  dateRange: null as [Date, Date] | null,
  DJBH: ''
})

// 表格相关
const oneTableRef = ref<TableInstance>()
const oneTableData = ref<any[]>([])
const selectedData = ref<any[]>([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 详情弹窗相关
const dialogVisible = ref(false)
const currentDetail = ref<any>(null)
const detailItems = ref<any[]>([])

// 模拟数据
const mockPurchaseData = [
  {
    DJBH: 'CG20230601001',
    GHS: '北京供应商A',
    RQ: '2023-06-01',
    JE: 12500.00,
    YSHJE: 12500.00,
    WSHJE: 0.00,
    ZDR: '张三',
    SHR: '李四',
    ZT: '已审核'
  },
  {
    DJBH: 'CG20230602001',
    GHS: '上海供应商B',
    RQ: '2023-06-02',
    JE: 8900.00,
    YSHJE: 0.00,
    WSHJE: 8900.00,
    ZDR: '王五',
    SHR: '',
    ZT: '未审核'
  },
  {
    DJBH: 'CG20230603001',
    GHS: '广州供应商C',
    RQ: '2023-06-03',
    JE: 15600.50,
    YSHJE: 15600.50,
    WSHJE: 0.00,
    ZDR: '赵六',
    SHR: '钱七',
    ZT: '已审核'
  }
]

// 模拟详情数据
const mockDetailData = {
  'CG20230601001': {
    DJBH: 'CG20230601001',
    GHS: '北京供应商A',
    RQ: '2023-06-01',
    JE: 12500.00,
    ZDR: '张三',
    SHR: '李四',
    ZT: '已审核',
    items: [
      {
        WZBH: 'WZ001',
        WZMC: '产品A',
        GG: '标准型',
        DW: '个',
        SL: 100,
        DJ: 50.00,
        JE: 5000.00
      },
      {
        WZBH: 'WZ002',
        WZMC: '产品B',
        GG: '加强型',
        DW: '个',
        SL: 150,
        DJ: 50.00,
        JE: 7500.00
      }
    ]
  },
  'CG20230602001': {
    DJBH: 'CG20230602001',
    GHS: '上海供应商B',
    RQ: '2023-06-02',
    JE: 8900.00,
    ZDR: '王五',
    SHR: '',
    ZT: '未审核',
    items: [
      {
        WZBH: 'WZ003',
        WZMC: '产品C',
        GG: '经济型',
        DW: '个',
        SL: 200,
        DJ: 44.50,
        JE: 8900.00
      }
    ]
  },
  'CG20230603001': {
    DJBH: 'CG20230603001',
    GHS: '广州供应商C',
    RQ: '2023-06-03',
    JE: 15600.50,
    ZDR: '赵六',
    SHR: '钱七',
    ZT: '已审核',
    items: [
      {
        WZBH: 'WZ004',
        WZMC: '产品D',
        GG: '高级型',
        DW: '套',
        SL: 50,
        DJ: 250.00,
        JE: 12500.00
      },
      {
        WZBH: 'WZ005',
        WZMC: '配件E',
        GG: '通用型',
        DW: '个',
        SL: 3100.5,
        DJ: 1.00,
        JE: 3100.50
      }
    ]
  }
}

// 初始化数据
const initData = () => {
  oneTableData.value = mockPurchaseData
  total.value = mockPurchaseData.length
}

// 查询处理
const handleQuery = debounce(() => {
  // 这里是查询逻辑，根据实际情况实现
  let filteredData = [...mockPurchaseData]
  
  // 根据供货商筛选
  if (purchaseData.GHS) {
    filteredData = filteredData.filter(item => 
      item.GHS.includes(purchaseData.GHS)
    )
  }
  
  // 根据日期区间筛选
  if (purchaseData.dateRange) {
    const [startDate, endDate] = purchaseData.dateRange
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.RQ)
      return itemDate >= startDate && itemDate <= endDate
    })
  }
  
  // 根据单据编号筛选
  if (purchaseData.DJBH) {
    filteredData = filteredData.filter(item => 
      item.DJBH.includes(purchaseData.DJBH)
    )
  }
  
  oneTableData.value = filteredData
  total.value = filteredData.length
  currentPage.value = 1
  
  ElMessage.success('查询成功')
}, 500)

// 重置处理
const handleReset = () => {
  purchaseData.GHS = ''
  purchaseData.dateRange = null
  purchaseData.DJBH = ''
  
  initData()
  ElMessage.success('重置成功')
}

// 查看详情
const handleViewDetail = (row: any) => {
  const detail = mockDetailData[row.DJBH]
  if (detail) {
    currentDetail.value = detail
    detailItems.value = detail.items
    dialogVisible.value = true
  }
}

// 关闭详情弹窗
const handleClose = () => {
  dialogVisible.value = false
  currentDetail.value = null
  detailItems.value = []
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
}

// 页码变化
const handleCurrentChange = (current: number) => {
  currentPage.value = current
}

// 组件挂载时初始化
onMounted(() => {
  initData()
})
</script>

<style scoped>
.purchase-query-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.query-header {
  margin-bottom: 20px;
}

.query-card {
  background-color: #fff;
  border-radius: 8px;
}

.demo-form-inline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.table-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-content {
  padding: 10px 0;
}

.detail-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.detail-info {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.detail-item {
  min-width: 200px;
}

.detail-table {
  margin: 20px 0;
}

.detail-footer {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #e6e6e6;
  text-align: right;
}

.total-amount {
  font-size: 16px;
}
</style>