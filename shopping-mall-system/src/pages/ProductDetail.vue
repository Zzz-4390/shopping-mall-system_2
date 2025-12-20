<template>
  <div class="tb-product-detail">
    <!-- 面包屑导航 -->
    <div class="tb-breadcrumb">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{
          getCategoryLabel(product.category)
        }}</el-breadcrumb-item>
        <el-breadcrumb-item>商品详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="tb-container">
      <!-- 商品主图区域 -->
      <div class="tb-product-gallery">
        <div class="tb-main-pic">
          <img :src="product.photo" :alt="product.title" />
        </div>
      </div>

      <!-- 商品信息区域 -->
      <div class="tb-product-info">
        <div class="tb-product-title">
          <h1>{{ product.title }}</h1>
        </div>

        <div class="tb-product-price">
          <span class="tb-price-label">价格</span>
          <span class="tb-price">¥{{ product.price }}</span>
        </div>

        <div class="tb-product-express">
          <el-icon class="tb-icon"><component :is="'Van'"></component></el-icon>
          <div class="tb-express-info">
            <div class="tb-express-fee">免运费</div>
            <div class="tb-express-time">预计明天发货 | 承诺48小时内发货</div>
          </div>
        </div>

        <div class="tb-product-service">
          <el-icon class="tb-icon"
            ><component :is="'Help'"></component
          ></el-icon>
          <div class="tb-service-info">
            坏单包退 极速退款 假一赔四 7天无理由退换
          </div>
        </div>

        <div class="tb-product-payment">
          <el-icon class="tb-icon"
            ><component :is="'CreditCard'"></component
          ></el-icon>
          <div class="tb-payment-info">信用卡支付</div>
        </div>

        <div class="tb-product-status">
          <span class="tb-status-label">状态</span>
          <span
            :class="[
              'tb-status',
              product.status === 'published' ? 'tb-status-on' : 'tb-status-off',
            ]"
          >
            {{ product.status === "ON_SALE" ? "在售" : "已下架" }}
          </span>
        </div>

        <div class="tb-product-category">
          <span class="tb-category-label">分类</span>
          <span class="tb-category">{{
            getCategoryLabel(product.category)
          }}</span>
        </div>

        <div class="tb-product-description">
          <span class="tb-description-label">简介</span>
          <span class="tb-description">{{ product.content }}</span>
        </div>

        <div class="tb-product-quantity">
          <span class="tb-quantity-label">数量</span>
          <div class="tb-quantity-control">
            <el-input-number
              v-model="quantity"
              :min="1"
              :max="1"
              size="default"
              disabled
            />
            <span class="tb-quantity-unit">件</span>
          </div>
        </div>
        <div class="tb-action-buttons">
          <el-button
            type="primary"
            size="large"
            class="tb-add-cart"
            @click="addToCart"
          >
            <i class="el-icon-shopping-cart-1"></i>
            加入购物车
          </el-button>
          <el-button
            type="primary"
            size="large"
            class="tb-buy-now"
            @click="buyNow"
          >
            立即购买
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "@/stores/user";
import { getProductById, addCartItem } from "@/apis";
import type { Product } from "@/types/product";
const userStore = useUserStore();
// 获取路由参数
const route = useRoute();
const router = useRouter();
const quantity = ref(1);
// 商品数据
const product = ref<Product>({
  productid: "",
  sellerid: "",
  title: "",
  content: "",
  price: 0,
  photo: "",
  status: "",
  publishtime: "",
  category: "",
});

// 获取商品数据
const fetchProductData = async () => {
  try {
    // 获取路由中的商品ID
    const productId = route.params.id;

    // 类型检查：确保是字符串
    if (!productId || Array.isArray(productId)) {
      ElMessage.error("商品ID无效");
      return;
    }
    const res = await getProductById(productId);
    product.value = res.data.data;
  } catch (error) {
    ElMessage.error("获取商品信息失败");
    console.error("获取商品信息失败:", error);
  }
};

// 商品分类映射
const categoryMap: Record<string, string> = {
  electronics: "电子产品",
  clothing: "服装",
  books: "图书",
  home: "家居",
  other: "其他",
};

// 获取分类中文名称
const getCategoryLabel = (value: string) => {
  return categoryMap[value] || value;
};
// 加入购物车
const addToCart = async () => {
  const userid = userStore.userInfo?.userid;
  const cartid = userStore.cartid;

  // 添加非空校验
  if (!userid) {
    ElMessage.warning("请先登录");
    return;
  }

  if (!cartid) {
    ElMessage.warning("购物车未初始化，请稍后重试");
    return;
  }

  try {
    await addCartItem(cartid, {
      productid: product.value.productid,
    });
    await userStore.fetchCartItems();
    ElMessage.success("商品已加入购物车");
  } catch (error) {
    ElMessage.error("加入购物车失败");
    console.error("完整错误信息:", error);
  }
};

// 立即购买
const buyNow = () => {
  ElMessage.success("正在前往订单确认页面");
  router.push(
    `/payment/${product.value.sellerid}/${product.value.productid}/${quantity.value}`
  );
};

onMounted(() => {
  fetchProductData();
});
</script>

<style scoped>
.tb-product-detail {
  background-color: #f5f5f5;
  padding-bottom: 40px;
}

.tb-breadcrumb {
  padding: 12px 0;
  background: #f5f5f5;
  max-width: 1200px;
  margin: 0 auto;
}

.tb-container {
  display: flex;
  background: #fff;
  margin: 0 auto 20px;
  max-width: 1200px;
  padding: 30px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 80vh;
}

/* 商品图片区域 */
.tb-product-gallery {
  width: 50%;
  padding-right: 30px;
  display: flex;
  flex-direction: column;
}

.tb-main-pic {
  flex: 1;
  border: 1px solid #eee;
  background: #fafafa;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.tb-main-pic img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 商品信息区域 */
.tb-product-info {
  width: 50%;
  padding-left: 30px;
  border-left: 1px solid #eee;
}

.tb-product-title h1 {
  font-size: 18px;
  color: #333;
  font-weight: bold;
  line-height: 1.4;
  margin-bottom: 20px;
}

.tb-product-price {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tb-price-label {
  font-size: 14px;
  color: #999;
  margin-right: 15px;
}

.tb-price {
  font-size: 28px;
  color: #ff0036;
  font-weight: bold;
}

.tb-product-status {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.tb-status-label {
  font-size: 14px;
  color: #999;
  margin-right: 15px;
  width: 40px;
}

.tb-status {
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 2px;
}

.tb-status-on {
  color: #67c23a;
  background-color: #f0f9eb;
  border: 1px solid #c2e1b6;
}

.tb-status-off {
  color: #f56c6c;
  background-color: #fef0f0;
  border: 1px solid #fbc4c4;
}

.tb-product-category {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.tb-category-label {
  font-size: 14px;
  color: #999;
  margin-right: 15px;
  width: 40px;
}

.tb-category {
  font-size: 14px;
  color: #333;
}

.tb-product-description {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.tb-description-label {
  font-size: 14px;
  color: #999;
  margin-right: 15px;
  width: 40px;
}

.tb-description {
  font-size: 14px;
  color: #333;
}

.tb-action-buttons {
  display: flex;
  gap: 15px;
}

.tb-add-cart,
.tb-buy-now {
  flex: 1;
  height: 46px;
  font-size: 16px;
}

.tb-add-cart {
  background-color: #ffa500; /* 黄橙色 */
  border-color: #ffa500;
}

.tb-add-cart:hover {
  background-color: #ff8c00; /* 深一点的橙色 */
  border-color: #ff8c00;
}

.tb-buy-now {
  background-color: #ff8c00; /* 深橙色 */
  border-color: #ff8c00;
}

.tb-buy-now:hover {
  background-color: #ff7700; /* 更深的橙色 */
  border-color: #ff7700;
}
.tb-product-express,
.tb-product-service,
.tb-product-payment {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.tb-icon {
  font-size: 16px;
  color: #999;
  margin-right: 10px;
  margin-top: 2px;
}

.tb-express-info,
.tb-service-info,
.tb-payment-info {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.tb-express-fee {
  color: #ff0036;
  font-weight: bold;
}

.tb-express-time {
  color: #999;
  font-size: 13px;
}

.tb-service-info {
  color: #666;
}

.tb-payment-info {
  color: #666;
}

.tb-product-quantity {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tb-quantity-label {
  font-size: 14px;
  color: #999;
  margin-right: 15px;
  width: 40px;
}

.tb-quantity-control {
  display: flex;
  align-items: center;
}

.tb-quantity-control :deep(.el-input-number) {
  width: 120px;
}

.tb-quantity-unit {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tb-container {
    flex-direction: column;
    padding: 15px;
  }

  .tb-product-gallery {
    width: 100%;
    padding-right: 0;
    margin-bottom: 20px;
  }

  .tb-product-info {
    width: 100%;
    padding-left: 0;
    border-left: none;
  }

  .tb-main-pic {
    width: 100%;
    height: 300px;
  }

  .tb-action-buttons {
    flex-direction: column;
  }

  .tb-add-cart,
  .tb-buy-now {
    width: 100%;
  }
}
</style>
