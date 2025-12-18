<template>
  <div class="navigation-container">
    <div class="home-page">
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="首页" name="first"></el-tab-pane>
        <el-tab-pane label="消息通知" name="second"></el-tab-pane>
        <el-tab-pane label="个人中心" name="third"></el-tab-pane>
        <el-tab-pane label="发布商品" name="fourth"></el-tab-pane>
      </el-tabs>

      <!-- 搜索框 -->
      <div class="search-wrapper">
        <el-input
          v-model="searchInput"
          placeholder="请输入搜索内容"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #suffix>
            <el-button type="primary" link @click="handleSearch">
              <Search class="icon-search" style="width: 1em; height: 1em; margin-right: 6px" />
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- 右侧操作按钮 -->
      <div class="action-buttons">
        <!-- 根据登录状态显示不同内容 -->
        <div v-if="!userStore.isLoggedIn" class="login-section">
          <el-button link class="login-btn" @click="router.push('/login')">
            <el-icon><User /></el-icon>
            登录
          </el-button>
        </div>

        <div v-else class="user-section">
          <el-dropdown @command="handleUserCommand">
            <span class="user-info">
              <span class="username">{{
                userStore.userInfo.name || userStore.userInfo.phone
              }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <el-badge :value="cartCount" class="cart-badge">
          <el-button
            link
            class="cart-btn"
            @click="
              () => {
                ;(router.push('/cart'), (activeName = ''))
              }
            "
          >
            <el-icon><ShoppingCart /></el-icon>
          </el-button>
        </el-badge>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch, computed } from 'vue'
import { User, ShoppingCart, Search } from '@element-plus/icons-vue'
import type { TabsPaneContext } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
const searchInput = ref('')
const activeName = ref('first')
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const cartCount = computed(() => {
  return userStore.isLoggedIn ? userStore.cartCount : 0
})

//获取当前tab高亮
const getActiveName = () => {
  const path = router.currentRoute.value.path
  switch (path) {
    case '/':
      activeName.value = 'first'
      break
    case '/message':
      activeName.value = 'second'
      break
    case '/profile':
      activeName.value = 'third'
      break
    case '/publish':
      activeName.value = 'fourth'
      break
    default:
      // 任何非主导航页面都取消高亮
      activeName.value = ''
  }
}

// 在组件挂载时获取购物车数据
onMounted(async () => {
  getActiveName()

  // 如果用户已登录，则获取购物车数据
  if (userStore.isLoggedIn) {
    await userStore.fetchCartItems()
  }
})

// 监听用户登录状态变化，如果登录则获取购物车数据
watch(
  () => userStore.isLoggedIn,
  async (isLoggedIn) => {
    if (isLoggedIn) {
      await userStore.fetchCartItems()
    }
  },
)

// 监听路由变化（包含前进/后退），同步 tab 高亮
watch(
  () => route.path,
  () => {
    getActiveName()
  },
)

const handleClick = (tab: TabsPaneContext) => {
  const tabName = tab.props.name
  switch (tabName) {
    case 'first':
      router.push('/')
      break
    case 'second':
      router.push('/message')
      break
    case 'third':
      router.push('/profile')
      break
    case 'fourth':
      router.push('/publish')
      break
  }
}

const handleSearch = () => {
  const key = searchInput.value.trim()
  router.push({ path: '/search', query: { key } })
  searchInput.value = ''
}

// 处理用户下拉菜单命令
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      // 添加退出登录确认提示
      ElMessageBox.confirm('确定要退出登录吗？', '退出登录', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          // 确认退出登录
          userStore.clearUserInfo()
          ElMessage.success('已退出登录')
          router.push('/')
        })
        .catch(() => {
          // 取消退出登录
        })
      break
  }
}
</script>

<style scoped>
.navigation-container {
  background-color: #fdfdfd; /* 更浅的灰色背景 */
  padding: 10px 0; /* 上下留出一些间距 */
}

.home-page {
  display: flex;
  align-items: center;
  position: relative;
}

.demo-tabs {
  height: 80px;
  flex: 0 0 auto; /* 不再自动扩展 */
}

.demo-tabs :deep(.el-tabs__header) {
  height: 80px;
}

.demo-tabs :deep(.el-tabs__item) {
  letter-spacing: 2px;
  word-spacing: 4px;
  height: 80px;
  line-height: 80px;
  font-size: 16px;
}

.demo-tabs :deep(.el-tabs__nav-scroll) {
  padding-left: 50px;
}

.demo-tabs :deep(.el-tab-pane) {
  letter-spacing: 1px;
}

/* 取消标签页下方的下划线 */
.demo-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none !important;
}

/* 搜索框容器 */
.search-wrapper {
  flex: 1; /* 占据可用空间 */
  display: flex;
  justify-content: center; /* 水平居中 */
  padding: 0 20px; /* 左右留出间距 */
  margin: 0 40px 0 20px;
}

.el-input {
  width: 600px;
  height: 44px;
}

:deep(.el-input__wrapper) {
  margin-left: 5px;
  font-size: 15px;
  background-color: rgba(255, 255, 255, 0);
  border-radius: 120px;
  box-shadow: 2 2 2 2px;
}

:deep(.el-input__inner) {
  margin-left: 10px;
}

.icon-search:hover {
  color: #409efc;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-right: 30px;
  margin-right: 20px;
  flex: 0 0 auto; /* 不伸缩 */
}

.login-btn,
.cart-btn {
  font-size: 16px;
  color: #606266;
}

.login-btn:hover,
.cart-btn:hover {
  color: #409eff;
}

.cart-badge :deep(.el-badge__content) {
  top: 10px;
  right: 5px;
}

/* 用户信息样式 */
.user-section {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.user-avatar {
  background-color: #409eff;
}

.username {
  font-size: 14px;
  color: #606266;
}

.user-info:hover .username {
  color: #409eff;
}
</style>
