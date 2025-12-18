// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/pages/HomePage.vue'
import Login from '@/pages/LoginPage.vue'
import Register from '@/pages/RegisterPage.vue'
import Message from '@/pages/MessagePage.vue'
import Profile from '@/pages/ProfilePage.vue'
import Cart from '@/pages/CartPage.vue'
import ProductDetail from '@/pages/ProductDetail.vue'
import ProductPublish from '@/pages/ProductPublish.vue'
import LayoutWrapper from '@/pages/LayoutWrapper.vue'
import PaymentPage from '@/pages/PaymentPage.vue'
import PaymentSuccess from '@/pages/PaymentSuccess.vue'
import CategoryPage from '@/pages/CategoryPage.vue'
import SearchPage from '@/pages/SearchPage.vue'
const routes = [
  {
    path: '',
    component: LayoutWrapper,
    children: [
      {
        path: '',
        component: Home,
      },
      {
        // path: '/message/:id',
        path: '/message',
        component: Message,
      },
      {
        // path: '/profile/:id',
        path: '/profile',
        component: Profile,
      },
      {
        // path: '/cart/:id',
        path: '/cart',
        component: Cart,
      },
      {
        // path: '/cart/:id',
        path: '/product/:id',
        component: ProductDetail,
      },
      {
        path: '/category/:category',
        name: 'CategoryPage',
        component: CategoryPage,
      },
      {
        path: '/search',
        name: 'SearchPage',
        component: SearchPage,
      },
      {
        path: '/publish',
        component: ProductPublish,
      },
      {
        path: '/payment/:sellerid/:productid/:quantity',
        name: 'PaymentPage',
        component: PaymentPage,
      },
      {
        path: '/payment',
        name: 'PaymentCart',
        component: PaymentPage,
      },
      {
        path: '/payment-success',
        name: 'PaymentSuccess',
        component: PaymentSuccess,
      },
    ],
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/register',
    component: Register,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
