<template>
  <div class="payment-success">
    <div class="success-container">
      <el-result icon="success" title="支付成功" sub-title="您的订单已支付成功，我们将尽快为您发货">
        <template #extra>
          <el-button @click="continueShopping">继续购物</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const continueShopping = () => {
  // 返回首页继续购物
  router.push('/')
}
</script>

<style scoped>
.payment-success {
  background-color: #f5f5f5;
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-container {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 40px 20px;
}
</style>
