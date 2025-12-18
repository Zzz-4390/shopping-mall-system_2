<template>
  <div class="filter-bar">
    <div class="filter-row">
      <el-input
        v-model="local.keyword"
        placeholder="搜索关键词"
        clearable
        class="filter-item"
        @input="emitChange()"
      />

      <el-select
        v-model="local.category"
        placeholder="选择分类"
        clearable
        class="filter-item"
        @change="emitChange()"
      >
        <el-option label="全部分类" value="" />
        <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>

      <el-input-number
        v-model="local.minPrice"
        :min="0"
        :precision="2"
        controls-position="right"
        class="filter-item price-input"
        placeholder="最低价"
        @change="emitChange()"
      />
      <span class="price-sep">—</span>
      <el-input-number
        v-model="local.maxPrice"
        :min="0"
        :precision="2"
        controls-position="right"
        class="filter-item price-input"
        placeholder="最高价"
        @change="emitChange()"
      />

      <el-select v-model="local.sort" placeholder="排序" class="filter-item" @change="emitChange()">
        <el-option label="综合" value="composite" />
        <el-option label="最新上架" value="latest" />
        <el-option label="价格升序" value="price-asc" />
        <el-option label="价格降序" value="price-desc" />
      </el-select>

      <el-button type="primary" @click="emitChange()">应用筛选</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { categories } from '@/types'

export type Filters = {
  keyword: string
  category: string
  minPrice: number | null
  maxPrice: number | null
  sort: 'composite' | 'latest' | 'price-asc' | 'price-desc'
}

const props = defineProps<{
  modelValue?: Filters
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: Filters): void
  (e: 'change', v: Filters): void
}>()

const local = reactive<Filters>({
  keyword: props.modelValue?.keyword ?? '',
  category: props.modelValue?.category ?? '',
  minPrice: props.modelValue?.minPrice ?? null,
  maxPrice: props.modelValue?.maxPrice ?? null,
  sort: props.modelValue?.sort ?? 'composite',
})

const emitChange = () => {
  emit('update:modelValue', { ...local })
  emit('change', { ...local })
}

watch(
  () => props.modelValue,
  (v) => {
    if (!v) return
    local.keyword = v.keyword ?? ''
    local.category = v.category ?? ''
    local.minPrice = v.minPrice ?? null
    local.maxPrice = v.maxPrice ?? null
    local.sort = v.sort ?? 'composite'
  },
)
</script>

<style scoped>
.filter-bar {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  padding: 16px;
  margin: 20px auto;
}

.filter-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 180px;
}

.price-input {
  min-width: 140px;
}

.price-sep {
  color: #999;
}
</style>
