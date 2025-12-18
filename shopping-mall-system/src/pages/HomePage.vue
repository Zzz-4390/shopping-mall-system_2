<template>
  <div class="main-container">
    <!-- 左侧分类区 -->
    <div class="category-section section">
      <h3 class="category-title">商品分类</h3>
      <ul class="category-list">
        <li
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          @click="router.push('/category/' + category.id)"
        >
          <el-icon class="category-icon">
            <Monitor v-if="category.id === 'electronics'" />
            <Goods v-else-if="category.id === 'clothing'" />
            <Reading v-else-if="category.id === 'books'" />
            <House v-else-if="category.id === 'home'" />
            <Basketball v-else-if="category.id === 'sports'" />
            <Star v-else />
          </el-icon>
          <span class="category-name">{{ category.name }}</span>
        </li>
      </ul>
    </div>

    <!-- 中间轮播图 -->
    <div class="carousel-wrapper section">
      <el-carousel
        height="350px"
        trigger="click"
        class="carousel rounded-carousel"
        :interval="1500"
        @mouseenter="handleCarouselHover(true)"
        @mouseleave="handleCarouselHover(false)"
        :class="{ 'carousel-hover': isCarouselHovered }"
      >
        <el-carousel-item v-for="(slide, index) in carouselSlides" :key="slide.categoryId || index">
          <img
            :src="slide.image"
            class="carousel-image"
            @click="router.push('/category/' + slide.categoryId)"
          />
          <div class="home-ad-banner-item-content-container" style="color: rgb(250, 255, 255)">
            <div class="home-ad-banner-item-title-top">{{ slide.description?.[0] }}</div>
            <div class="home-ad-banner-item-title-middle">{{ slide.description?.[1] }}</div>
            <div class="home-ad-banner-item-subtitle">{{ slide.description?.[2] }}</div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 右侧活动位-->
    <div class="promo-section section" @click="router.push('/category/' + promoBanner.categoryId)">
      <div class="promo-banner">
        <img :src="promoBanner.image" class="promo-image" />
        <div class="promo-overlay">
          <div class="promo-title">{{ promoBanner.description[0] }}</div>
          <div class="promo-sub">{{ promoBanner.description[1] }}</div>
          <div class="promo-note">{{ promoBanner.description[2] }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 推荐区 -->
  <div class="home-page">
    <div class="container">
      <div class="recommend-header">
        <el-icon class="recommend-icon"><Star /></el-icon>
        <h1 class="page-title">为你推荐</h1>
      </div>

      <div class="products-grid">
        <div
          v-for="product in displayedProducts"
          :key="product.productid"
          class="product-card-wrap"
          @click="router.push('/product/' + product.productid)"
        >
          <ProductCard :product="product" />
        </div>
      </div>
    </div>
  </div>

  <!-- 底部信息区 -->
  <div class="footer">
    <div class="footer-content">
      <!-- 服务条款 -->
      <div class="footer-section">
        <h3 class="footer-title">购物指南</h3>
        <ul class="footer-links">
          <li><a href="#">购物流程</a></li>
          <li><a href="#">会员介绍</a></li>
          <li><a href="#">生活旅行</a></li>
          <li><a href="#">常见问题</a></li>
          <li><a href="#">联系客服</a></li>
        </ul>
      </div>

      <!-- 配送方式 -->
      <div class="footer-section">
        <h3 class="footer-title">配送方式</h3>
        <ul class="footer-links">
          <li><a href="#">上门自提</a></li>
          <li><a href="#">211限时达</a></li>
          <li><a href="#">配送服务查询</a></li>
          <li><a href="#">配送费收取标准</a></li>
          <li><a href="#">海外配送</a></li>
        </ul>
      </div>

      <!-- 支付方式 -->
      <div class="footer-section">
        <h3 class="footer-title">支付方式</h3>
        <ul class="footer-links">
          <li><a href="#">货到付款</a></li>
          <li><a href="#">在线支付</a></li>
          <li><a href="#">分期付款</a></li>
          <li><a href="#">邮局汇款</a></li>
          <li><a href="#">公司转账</a></li>
        </ul>
      </div>

      <!-- 售后服务 -->
      <div class="footer-section">
        <h3 class="footer-title">售后服务</h3>
        <ul class="footer-links">
          <li><a href="#">售后政策</a></li>
          <li><a href="#">价格保护</a></li>
          <li><a href="#">退款说明</a></li>
          <li><a href="#">返修/退换货</a></li>
          <li><a href="#">取消订单</a></li>
        </ul>
      </div>
    </div>

    <!-- 版权信息 -->
    <div class="copyright">
      <p class="copyright-text">
        Copyright © 2023 商城系统 版权所有 |
        <a href="#">关于我们</a> | <a href="#">联系我们</a> | <a href="#">人才招聘</a> |
        <a href="#">商家入驻</a> | <a href="#">广告服务</a> | <a href="#">手机商城</a> |
        <a href="#">友情链接</a>
      </p>
      <p class="record-info">
        增值电信业务经营许可证：京B2-xxxxxxx | 网络文化经营许可证：京网文[2023]xxxx-xxx号 |
        违法和不良信息举报电话：400-xxx-xxxx
      </p>
      <p class="record-info">
        京公网安备 xxxxxxxxxxxxx号 |
        <a href="#">京ICP证xxxxxx号</a> | <a href="#">出版物经营许可证</a> | 营业执照
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ProductCard from '@/components/ProductCard.vue'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Product } from '@/types'
import { categories } from '@/types'
import { getAllProducts } from '@/apis'
const router = useRouter()
const isCarouselHovered = ref(false)

const allProducts = ref<Product[]>([])
const displayedProducts = computed(() => allProducts.value.filter((p) => p.status === 'ON_SALE'))

onMounted(() => {
  fetchAllProducts()
})
// 获取所有商品数据
const fetchAllProducts = async () => {
  try {
    const virtualProducts = ref<Product[]>([])
    const res = await getAllProducts()
    // 支持不同的后端返回封装：
    // - 如果 API 返回 ApiResult<Product[]>（{ code, message, data })：直接用 res.code/res.data
    // - 如果 API 返回 AxiosResponse<ApiResult<Product[]>>：则为 res.data.code/res.data.data
    const r: unknown = res
    if (r && typeof r === 'object' && 'code' in r) {
      // res 是 ApiResult<Product[]>
      const api = r as { code?: number; data?: Product[] }
      virtualProducts.value = api.code === 200 ? api.data || [] : []
    } else if (r && typeof r === 'object' && 'data' in r) {
      // res 可能是 AxiosResponse<ApiResult<Product[]>>
      const apiContainer = r as { data?: { code?: number; data?: Product[] } }
      const api = apiContainer.data
      virtualProducts.value = api?.code === 200 ? api.data || [] : []
    } else if (Array.isArray(res)) {
      // 直接返回数组的情况
      virtualProducts.value = res
    } else {
      virtualProducts.value = []
    }
    allProducts.value = virtualProducts.value
  } catch (error) {
    console.error('获取商品数据失败:', error)
    allProducts.value = []
  }
}

// 处理轮播图悬停事件
const handleCarouselHover = (hovered: boolean) => {
  isCarouselHovered.value = hovered
}

// 使用通用类型定义的分类常量（含 id 与 name）

// 将首图移至右侧活动位
const promoBanner = {
  categoryId: 'home',
  image: 'https://storage.360buyimg.com/component-libray/images/pc/pc_theme_daily_necessities.png',
  description: ['智享生活焕新季', '家电狂欢省到底', '爆品直降 限时抢购'],
}

// 轮播图数据（移除首图）
const carouselSlides = ref([
  {
    categoryId: 'electronics',
    image: 'https://storage.360buyimg.com/component-libray/images/pc/pc_banner_cell_phone.png',
    description: ['手机焕新季', '正品旗舰放心购', '官方正品 限时直降'],
  },
  {
    categoryId: 'clothing',
    image: 'https://storage.360buyimg.com/component-libray/images/pc/pc_banner_trendy_clothing.png',
    description: ['潮流穿搭新势力', '解锁时尚新趋势', '潮服好价 新品折扣'],
  },
  {
    categoryId: 'electronics',
    image:
      'https://storage.360buyimg.com/component-libray/images/pc/pc_banner_digital_equipment.png',
    description: ['潮玩黑科技', '数码3C狂欢盛典', '官方正品 即刻开抢'],
  },
  {
    categoryId: 'home',
    image: 'https://storage.360buyimg.com/component-libray/images/pc/pc_banner_home_decoration.png',
    description: ['大牌家具家装', '点缀品质生活', '正品直降 省钱省心'],
  },
  {
    categoryId: 'other',
    image: 'https://storage.360buyimg.com/component-libray/images/pc/pc_banner_snacks.png',
    description: ['办公轻补给', '宅家追剧能量站', '精选好物 超值优惠'],
  },
])
</script>

<style scoped>
.main-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  margin: 10px 30px;
  height: 350px;
}

.section {
  height: 350px;
  display: flex;
  flex-direction: column;
}

.promo-section {
  cursor: pointer;
  flex: 0 0 calc(20% - 10px);
  height: 350px;
}

.promo-banner {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.promo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.promo-section:hover .promo-image {
  transform: scale(1.02);
}

.promo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.15));
  color: #fff;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.promo-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 6px;
}

.promo-sub {
  font-size: 16px;
  margin-bottom: 6px;
}

.promo-note {
  font-size: 14px;
  opacity: 0.9;
}

/* 分类区域样式 */
.category-section {
  flex: 0 0 calc(20% - 10px);
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.category-title {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
  text-align: left;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow: visible;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.category-item {
  padding: 10px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 6px;
  margin: 0 5px 0 0;
  margin-bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  transform: scale(1);
  transform-origin: left center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.category-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.category-icon {
  font-size: 18px;
  margin-right: 10px;
  color: #666;
  width: 24px;
  text-align: center;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  letter-spacing: 0.5px;
}

/* 中间轮播图区 */
.home-ad-banner-item-content-container {
  position: absolute; /* 关键：脱离文档流，浮在图片上 */
  top: 60px;
  left: 40px;
  margin-top: 0; /* 去掉原margin-top:80px，避免冲突 */
  z-index: 2; /* 确保文字在图片上方（图片默认z-index:1） */
  /* 保留原有的文字样式 */
}

.home-ad-banner-item-title-middle,
.home-ad-banner-item-title-top {
  font-size: 32px;
  font-weight: 500;
  line-height: 40px;
  overflow: hidden;
  white-space: nowrap;
}

.home-ad-banner-item-subtitle {
  font-size: 16px;
  line-height: 24px;
  margin-left: 4px;
  margin-top: 12px;
  overflow: hidden;
  white-space: nowrap;
}

.carousel-wrapper {
  flex: 0 0 60%;
  cursor: pointer;
}

.rounded-carousel {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.carousel-hover {
  transform: scale(1.02);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.carousel-hover .carousel-image {
  transform: scale(1.05);
}

/* 为你推荐区域 */
.home-page {
  padding: 20px 0;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card-wrap {
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease;
}

.product-card-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: transparent;
  opacity: 0;
  transition: none;
}

.product-card-wrap:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.18);
}

.product-card-wrap:hover::after {
  opacity: 0;
}

.recommend-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.recommend-icon {
  font-size: 32px;
  color: #ff4444;
  margin-right: 10px;
}

.page-title {
  text-align: center;
  margin: 0;
  color: #333;
  font-size: 28px;
}

/* 在大屏幕设备上确保每行最多显示6个 */
@media (min-width: 1400px) {
  .products-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .container {
    padding: 0 15px;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 24px;
  }
}

/* 底部区域 */
/* 底部信息区样式 */
.footer {
  background-color: #fff;
  border-top: 1px solid #e6e6e6;
  margin-top: 40px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
  display: flex;
  justify-content: space-between;
}

.footer-section {
  flex: 1;
  padding: 0 15px;
}

.footer-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
  font-weight: bold;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 8px;
}

.footer-links a {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #e1251b;
}

.copyright {
  background-color: #f5f5f5;
  padding: 20px;
  text-align: center;
  border-top: 1px solid #e6e6e6;
}

.copyright-text,
.record-info {
  margin: 5px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.6;
}

.copyright-text a,
.record-info a {
  color: #666;
  text-decoration: none;
  margin: 0 5px;
}

.copyright-text a:hover,
.record-info a:hover {
  color: #e1251b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
  }

  .footer-section {
    margin-bottom: 20px;
  }

  .copyright-text,
  .record-info {
    font-size: 10px;
  }
}
</style>
