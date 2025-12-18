import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'
import App from './App.vue'
import router from './router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' //引入持久化插件
import 'element-plus/dist/index.css' // 先引入 Element Plus 样式
const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) //使用持久化插件
app.use(pinia)
app.use(router)

// 获取用户 store 实例（此时 Pinia 已经安装）
const userStore = useUserStore()
// 尝试恢复用户信息（从 localStorage 快照或基于 token 刷新）
userStore.restoreUserInfo()

// 设置路由守卫
router.beforeEach((to, from, next) => {
  // 白名单路径 - 不需要登录即可访问
  const whiteList = ['/', '/login', '/register']

  // 如果目标路径不在白名单中，且用户未登录，则重定向到登录页
  if (!whiteList.includes(to.path) && !userStore.isLoggedIn) {
    next('/login')
  } else {
    // 特殊处理：已登录用户访问登录页时重定向到首页
    if (to.path === '/login' && userStore.isLoggedIn) {
      next('/')
    } else {
      // 允许访问
      next()
    }
  }
})
app.mount('#app')

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
