<template>
  <div class="category-page">
    <div class="container">
      <div class="header">
        <h1 class="title">分类：{{ displayName }}</h1>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </div>

      <el-empty v-if="loading && products.length === 0" description="加载中..." />
      <el-empty v-else-if="!loading && products.length === 0" description="暂无该分类商品" />

      <div v-else class="products-grid">
        <ProductCard
          v-for="product in products"
          :key="product.productid"
          :product="product"
          class="product-item"
          @click="router.push('/product/' + product.productid)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import type { Product } from '@/types'
import { getProductsByCategory } from '@/apis'
import { categories } from '@/types'

const route = useRoute()
const router = useRouter()
const products = ref<Product[]>([])
const loading = ref(false)

const categoryParam = ref('')
const displayName = ref('')

const resolveDisplayName = (id: string) => {
  const found = categories.find((c) => c.id === id)
  return found ? found.name : id
}

const fetchByCategory = async (id: string) => {
  loading.value = true
  try {
    const res = await getProductsByCategory(id)
    const r: unknown = res
    if (r && typeof r === 'object' && 'code' in r) {
      const api = r as { code?: number; data?: Product[] }
      products.value =
        api.code === 200 ? (api.data || []).filter((p) => p.status === 'ON_SALE') : []
    } else if (r && typeof r === 'object' && 'data' in r) {
      const apiContainer = r as { data?: { code?: number; data?: Product[] } }
      const api = apiContainer.data
      products.value =
        api?.code === 200 ? (api.data || []).filter((p) => p.status === 'ON_SALE') : []
    } else if (Array.isArray(res)) {
      products.value = (res as Product[]).filter((p) => p.status === 'ON_SALE')
    } else {
      products.value = []
    }
  } catch (e) {
    products.value = []
    console.error(e)
  } finally {
    loading.value = false
  }
}

const init = async () => {
  const id = String(route.params.category || '')
  categoryParam.value = id
  displayName.value = resolveDisplayName(id)
  await fetchByCategory(id)
}

watch(
  () => route.params.category,
  async (val) => {
    if (!val) return
    await init()
  },
)

onMounted(init)

const goHome = () => router.push('/')
</script>

<style scoped>
.category-page {
  padding: 20px 0;
  background-color: #f5f7fa;
  min-height: 100vh;
}
.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title {
  margin: 0;
  font-size: 24px;
  color: #333;
}
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.product-item {
  cursor: pointer;
}
</style>
