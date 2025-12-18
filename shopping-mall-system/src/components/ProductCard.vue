<template>
  <div class="product-card">
    <div class="product-image">
      <img :src="product.photo || defaultImage" :alt="product.title" @error="handleImageError" />
    </div>

    <div class="product-info">
      <h3 class="product-name">{{ product.title }}</h3>

      <div class="product-price">
        <span class="current-price">¥{{ product.price }}</span>
      </div>

      <div class="product-description">
        {{ product.content }}
      </div>

      <div class="product-category" v-if="product.category">
        <span class="category">分类: {{ getCategoryName(product.category) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '@/types/product'

// 定义组件属性
interface Props {
  product: Product
  defaultImage?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultImage: 'https://via.placeholder.com/300x300?text=商品图片',
})

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const imgElement = event.target as HTMLImageElement
  imgElement.src = props.defaultImage
}

// 分类映射关系
const categoryMap: Record<string, string> = {
  electronics: '数码电子',
  clothing: '服装鞋帽',
  books: '图书教材',
  home: '家居用品',
  sports: '运动户外',
  other: '其他',
}

// 获取分类名称
const getCategoryName = (categoryId: string): string => {
  return categoryMap[categoryId] || categoryId
}
</script>

<style scoped>
.product-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.2s ease;
  background: #fff;
  position: relative;
  cursor: pointer;
}

.product-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 8px;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.18), rgba(255, 255, 255, 0));
  opacity: 0;
  transition: opacity 0.25s ease;
}

.product-card:hover {
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.16);
  transform: translateY(-6px) scale(1.01);
}

.product-card:hover::after {
  opacity: 1;
}

.product-image {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f5f7fa;
}

.product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.06);
}

.product-info {
  padding: 16px;
}

.product-name {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  margin-bottom: 10px;
}

.current-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff4444;
}

.product-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-category {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: #999;
}

.category {
  background-color: #f0f2f5;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
