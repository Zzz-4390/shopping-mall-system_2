<template>
  <div class="search-page">
    <div class="result-count" v-if="filteredProducts.length">
      共找到 {{ filteredProducts.length }} 件相关商品
    </div>
    <div class="products-grid" v-if="filteredProducts.length">
      <div
        v-for="product in filteredProducts"
        :key="product.productid"
        class="product-card-wrap"
        @click="router.push('/product/' + product.productid)"
      >
        <ProductCard :product="product" />
      </div>
    </div>
    <div class="empty" v-else>
      <el-empty description="未找到匹配的商品" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElEmpty } from 'element-plus'
import ProductCard from '@/components/ProductCard.vue'
import { getAllProducts } from '@/apis'
import type { Product } from '@/types'

const route = useRoute()
const router = useRouter()

const allProducts = ref<Product[]>([])
const searchKeyword = ref('')

const keywordFromRoute = computed(() => String(route.query.key || ''))

const filteredProducts = computed(() => {
  const key = searchKeyword.value.trim().toLowerCase()
  const list = allProducts.value.filter((p) => p.status === 'ON_SALE')
  if (!key) return list
  return list.filter((p) => {
    const title = p.title?.toLowerCase() || ''
    const content = p.content?.toLowerCase() || ''
    const category = p.category?.toLowerCase() || ''
    return title.includes(key) || content.includes(key) || category.includes(key)
  })
})

const fetchAllProducts = async () => {
  try {
    const res = await getAllProducts()
    const r: unknown = res
    if (r && typeof r === 'object' && 'code' in r) {
      const api = r as { code?: number; data?: Product[] }
      allProducts.value = api.code === 200 ? api.data || [] : []
    } else if (r && typeof r === 'object' && 'data' in r) {
      const apiContainer = r as { data?: { code?: number; data?: Product[] } }
      const api = apiContainer.data
      allProducts.value = api?.code === 200 ? api.data || [] : []
    } else if (Array.isArray(res)) {
      allProducts.value = res
    } else {
      allProducts.value = []
    }
  } catch (error) {
    console.error('获取商品数据失败:', error)
    allProducts.value = []
  }
}

onMounted(async () => {
  await fetchAllProducts()
  searchKeyword.value = keywordFromRoute.value
})

watch(
  () => keywordFromRoute.value,
  (val) => {
    searchKeyword.value = val
  },
)
</script>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.search-bar {
  flex: 1;
}

.result-count {
  margin-bottom: 16px;
  font-size: 16px;
  color: #666;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 28px;
}

.product-card-wrap {
  cursor: pointer;
}

.empty {
  margin-top: 40px;
}
</style>
