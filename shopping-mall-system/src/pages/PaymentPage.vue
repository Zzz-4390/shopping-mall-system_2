<template>
  <div class="payment-page">
    <div class="payment-container">
      <el-page-header title="返回" content="订单支付" @back="goBack" />

      <div class="payment-card">
        <h2>确认订单信息</h2>

        <div class="order-summary">
          <!-- 单件模式 -->
          <div class="order-item" v-if="!isCartMode && productInfo">
            <div class="item-image">
              <img :src="productInfo.photo" :alt="productInfo.title" />
            </div>
            <div class="item-details">
              <div class="item-name">{{ productInfo.title }}</div>
              <div class="item-price">¥{{ productInfo.price }} × {{ quantity }}</div>
            </div>
            <div class="item-total">¥{{ (productInfo.price * quantity).toFixed(2) }}</div>
          </div>
          <!-- 购物车模式 -->
          <div class="order-item" v-else v-for="it in cartPayItems" :key="it.productid">
            <div class="item-image">
              <img :src="it.photo" :alt="it.title" />
            </div>
            <div class="item-details">
              <div class="item-name">{{ it.title }}</div>
              <div class="item-price">¥{{ it.price }} × {{ it.quantity }}</div>
            </div>
            <div class="item-total">¥{{ (it.price * it.quantity).toFixed(2) }}</div>
          </div>
        </div>

        <div class="order-total">
          <div class="total-label">应付总额:</div>
          <div class="total-amount">¥{{ totalAmount.toFixed(2) }}</div>
        </div>

        <div class="payment-methods">
          <h3>支付方式</h3>
          <el-radio-group v-model="paymentMethod">
            <el-radio label="balance" border>账户余额</el-radio>
            <el-radio label="credit" border disabled>信用卡(暂未开通)</el-radio>
            <el-radio label="alipay" border disabled>支付宝(暂未开通)</el-radio>
            <el-radio label="wechat" border disabled>微信支付(暂未开通)</el-radio>
          </el-radio-group>

          <div class="account-info" v-if="paymentMethod === 'balance'">
            <div class="balance-info">
              <span>账户余额：</span>
              <span class="balance-amount">∞ (无限余额)</span>
            </div>
          </div>
        </div>

        <div class="payment-actions">
          <el-button
            type="primary"
            size="large"
            @click="handlePayment"
            :loading="isPaying"
            :disabled="isCartMode ? cartPayItems.length === 0 : !productInfo"
          >
            确认支付
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProductById } from '@/apis/product'
import { getCartItems } from '@/apis/cart'
import { createOrder, completeOrder } from '@/apis'
import { useUserStore } from '@/stores/user'
import type { CartItemDetail } from '@/types'

interface Product {
  productid: string
  sellerid: string
  title: string
  content: string
  price: number
  photo: string
  status: string
  publishtime: string
  category: string
}

// 路由实例
const route = useRoute()
const router = useRouter()

// 支付状态
const isPaying = ref(false)

// 支付方式
const paymentMethod = ref('balance')

// 商品数量（单件）
const quantity = ref(Number(route.params.quantity) || 1)

// 商品信息（单件）
const productInfo = ref<Product | null>(null)

// 购物车模式判断
const isCartMode = computed(() => !route.params.productid)

// 选择的商品ID（逗号分隔）
const selectedIds = computed(() => {
  const raw = route.query.selected as string | undefined
  return raw ? raw.split(',').filter(Boolean) : []
})

// 购物车商品（多件）
type CartPayItem = {
  productid: string
  sellerid: string
  title: string
  price: number
  photo: string
  quantity: number
}
const cartPayItems = ref<CartPayItem[]>([])
const userStore = useUserStore()

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 获取商品信息（单件）
const fetchProductInfo = async () => {
  try {
    const productId = route.params.productid as string
    if (productId) {
      const res = await getProductById(productId)
      productInfo.value = res.data.data
    }
  } catch (error) {
    ElMessage.error('获取商品信息失败')
    console.error(error)
  }
}

// 获取购物车商品（多件）
const fetchCartForPayment = async () => {
  try {
    const cartid = userStore.cartid
    if (!cartid) throw new Error('未获取到购物车ID')
    const res = await getCartItems(cartid)
    const rows = (res?.data?.data || []) as CartItemDetail[]
    const filtered = selectedIds.value.length
      ? rows.filter((r) => selectedIds.value.includes(r.productid))
      : rows
    cartPayItems.value = filtered.map((r) => ({
      productid: r.productid,
      sellerid: String(r.product_sellerid || ''),
      title: r.product_title || '',
      price: r.product_price || 0,
      photo: r.product_photo || '',
      quantity: 1,
    }))
    if (!cartPayItems.value.length) {
      ElMessage.warning('未找到要结算的商品')
    }
  } catch (error) {
    ElMessage.error('获取购物车商品失败')
    console.error(error)
  }
}

// 合计
const totalAmount = computed(() => {
  if (isCartMode.value) {
    return cartPayItems.value.reduce((sum, it) => sum + it.price * it.quantity, 0)
  }
  return productInfo.value ? productInfo.value.price * quantity.value : 0
})

// 处理支付
const handlePayment = async () => {
  if (paymentMethod.value !== 'balance') {
    ElMessage.warning('目前仅支持账户余额支付')
    return
  }

  isPaying.value = true
  try {
    const buyerid = userStore.userInfo.userid
    if (!buyerid) throw new Error('未登录或缺少用户信息')

    if (isCartMode.value) {
      // 多件：逐件下单并完成
      const created: Array<{ orderid?: string }> = []
      for (const it of cartPayItems.value) {
        if (!it.sellerid || !it.productid) continue
        const res = await createOrder(buyerid, {
          sellerid: it.sellerid,
          productid: it.productid,
        })
        if (res.data?.code !== 200) throw new Error(res.data?.message || '下单失败')
        created.push({ orderid: res.data?.data?.orderid })
      }
      for (const o of created) {
        if (!o.orderid) continue
        const payRes = await completeOrder(o.orderid)
        if (payRes.data?.code !== 200) throw new Error(payRes.data?.message || '支付失败')
      }
      ElMessage.success('支付成功！')
      try {
        await userStore.clearCartItems?.()
      } catch {}
      router.push({ path: '/payment-success' })
    } else {
      // 单件
      if (!productInfo.value) {
        ElMessage.warning('商品信息加载中，请稍候...')
        return
      }
      const sellerid = String(route.params.sellerid || productInfo.value.sellerid)
      const productid = String(route.params.productid || productInfo.value.productid)
      const res = await createOrder(buyerid, { sellerid, productid })
      if (res.data?.code !== 200) throw new Error(res.data?.message || '下单失败')
      const orderid = res.data?.data?.orderid
      if (orderid) {
        const payRes = await completeOrder(orderid)
        if (payRes.data?.code !== 200) throw new Error(payRes.data?.message || '支付失败')
      }
      ElMessage.success('支付成功！')
      router.push({
        path: '/payment-success',
        query: {
          sellerid,
          productid,
          quantity: String(quantity.value),
        },
      })
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '支付失败，请稍后重试'
    ElMessage.error(msg)
  } finally {
    isPaying.value = false
  }
}

// 页面加载时获取商品信息
onMounted(() => {
  if (isCartMode.value) {
    fetchCartForPayment()
  } else {
    fetchProductInfo()
  }
})
</script>

<style scoped>
.payment-page {
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
  padding: 20px 0;
}

.payment-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.payment-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.order-summary {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
}

.item-price {
  color: #999;
  font-size: 14px;
}

.item-total {
  font-weight: 500;
  color: #ff0036;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid #eee;
  margin-top: 10px;
}

.total-label {
  font-size: 16px;
  margin-right: 15px;
}

.total-amount {
  font-size: 24px;
  font-weight: bold;
  color: #ff0036;
}

.payment-methods {
  border-top: 1px solid #eee;
  padding-top: 20px;
  margin-top: 20px;
}

.payment-methods h3 {
  margin-bottom: 15px;
}

.account-info {
  margin-top: 15px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.balance-info {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.balance-amount {
  font-weight: bold;
  color: #67c23a;
  margin-left: 10px;
}

.payment-actions {
  text-align: center;
  margin-top: 30px;
}

.payment-actions .el-button {
  width: 200px;
}
</style>
