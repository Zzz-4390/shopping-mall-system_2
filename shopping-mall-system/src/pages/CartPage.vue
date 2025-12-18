<template>
  <div class="cart-page">
    <div class="container">
      <el-page-header title="继续购物" content="购物车" @back="goBack" class="page-header" />

      <div class="cart-content" v-if="cartItems.length > 0">
        <el-table
          ref="tableRef"
          :data="cartItems"
          :style="{ width: '100%' }"
          class="cart-table"
          row-key="cartitemid"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="商品信息">
            <template #default="scope">
              <div class="product-info">
                <el-image
                  :src="scope.row.product_photo || ''"
                  class="product-image"
                  fit="cover"
                  :preview-src-list="[scope.row.product_photo || '']"
                  hide-on-click-modal
                />
                <div class="product-details">
                  <div class="product-name">{{ scope.row.product_title }}</div>
                  <div class="product-spec">{{ scope.row.product_content }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="单价" width="150">
            <template #default="scope"> ¥{{ scope.row.product_price?.toFixed(2) }} </template>
          </el-table-column>

          <el-table-column label="数量" width="200">
            <template #default="scope">
              <el-input-number v-model="scope.row.quantity" :min="1" readonly />
            </template>
          </el-table-column>

          <el-table-column label="小计" width="150">
            <template #default="scope">
              ¥{{ (scope.row.product_price * (scope.row.quantity || 1)).toFixed(2) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button type="danger" icon="Delete" circle @click="removeItem(scope.row)" />
            </template>
          </el-table-column>
        </el-table>

        <div class="cart-footer">
          <div class="cart-summary">
            <span>共 {{ totalItems }} 件商品</span>
            <span class="total-price">总计: ¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <div class="cart-actions">
            <el-button size="large" @click="clearCart">清空购物车</el-button>
            <el-button type="primary" size="large" @click="checkout">去结算</el-button>
          </div>
        </div>
      </div>

      <div class="empty-cart" v-else>
        <el-empty description="购物车为空">
          <el-button type="primary" @click="goShopping">去逛逛</el-button>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  ElTable,
  ElTableColumn,
  ElImage,
  ElInputNumber,
  ElButton,
  ElEmpty,
  ElMessageBox,
  ElMessage,
  ElPageHeader,
} from 'element-plus'
import { getCartItems, deleteCartItem } from '@/apis'
import { useUserStore } from '@/stores/user'
import type { CartItemDetail } from '@/types'

// 扩展 CartItemDetail 类型以包含 quantity 字段
interface CartItemWithQuantity extends CartItemDetail {
  quantity: number
}

const userStore = useUserStore()

onMounted(() => {
  getCart()
})

// 使用正确的类型
const cartItems = ref<CartItemWithQuantity[]>([])
const selectedItems = ref<CartItemWithQuantity[]>([])
const tableRef = ref<InstanceType<typeof ElTable> | null>(null)

const router = useRouter()

// 计算总数量（仅已选）
const totalItems = computed(() => {
  return selectedItems.value.reduce((total, item) => total + (item.quantity || 1), 0)
})

// 计算总价（仅已选）
const totalPrice = computed(() => {
  return selectedItems.value.reduce(
    (total, item) => total + (item.product_price || 0) * (item.quantity || 1),
    0,
  )
})

// 监听表格选择
const handleSelectionChange = (rows: CartItemWithQuantity[]) => {
  selectedItems.value = rows
}

// 获取购物车数据
const getCart = async () => {
  const cartid = userStore.cartid
  if (!cartid) {
    ElMessage.error('未获取到购物车ID')
    return
  }
  try {
    const res = await getCartItems(cartid)
    // 显式指定类型
    cartItems.value = (res.data.data as CartItemDetail[]).map((item) => ({
      ...item,
      quantity: 1,
    }))
    selectedItems.value = [...cartItems.value]
    await nextTick()
    tableRef.value?.toggleAllSelection?.()
  } catch (error) {
    ElMessage.error('获取购物车数据失败')
    console.error(error)
  }
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 去购物
const goShopping = () => {
  router.push('/')
}

// 删除商品
const removeItem = (item: CartItemWithQuantity) => {
  ElMessageBox.confirm(`确定要删除 ${item.product_title} 吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        // 调用API删除购物车项，传入cartitemid
        await deleteCartItem(item.cartitemid)

        // 从本地数组中移除该项
        const index = cartItems.value.findIndex((i) => i.cartitemid === item.cartitemid)
        if (index !== -1) {
          cartItems.value.splice(index, 1)
        }
        selectedItems.value = selectedItems.value.filter((i) => i.cartitemid !== item.cartitemid)
        await userStore.fetchCartItems()
        ElMessage.success('删除成功')
      } catch (error) {
        ElMessage.error('删除失败')
        console.error(error)
      }
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 清空购物车
const clearCart = () => {
  ElMessageBox.confirm('确定要清空购物车吗？', '确认清空', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await userStore.clearCartItems()
        // 重新获取购物车数据
        await getCart()
        ElMessage.success('购物车已清空')
      } catch (error) {
        ElMessage.error('清空购物车失败')
        console.error(error)
      }
    })
    .catch(() => {
      // 用户取消清空
    })
}

// 去结算：跳转到支付页并在支付页加载购物车
const checkout = () => {
  if (!cartItems.value.length) {
    ElMessage.warning('购物车为空')
    return
  }
  if (!selectedItems.value.length) {
    ElMessage.warning('请先选择要结算的商品')
    return
  }
  const selectedIds = selectedItems.value.map((i) => i.productid).filter(Boolean)
  router.push({ path: '/payment', query: { selected: selectedIds.join(',') } })
}
</script>

<style scoped>
/* 样式部分保持不变 */
.cart-page {
  padding: 20px 0;
  min-height: calc(100vh - 120px);
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.cart-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.cart-table :deep(.el-table__row) {
  height: 120px;
}

.product-info {
  display: flex;
  align-items: center;
  height: 100%;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  margin-right: 15px;
  border: 1px solid #eee;
}

.product-details {
  flex: 1;
}

.product-name {
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.product-spec {
  font-size: 12px;
  color: #999;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-top: 1px solid #eee;
  background-color: #fafafa;
}

.cart-summary {
  font-size: 16px;
  color: #666;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #ff6600;
  margin-left: 20px;
}

.cart-actions {
  display: flex;
  gap: 15px;
}

.empty-cart {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 50px 0;
}

@media (max-width: 768px) {
  .cart-footer {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .cart-summary {
    order: 2;
  }

  .cart-actions {
    order: 1;
    width: 100%;
    justify-content: center;
  }

  .cart-table :deep(.el-table__row) {
    height: auto;
    padding: 15px 0;
  }
}
</style>
