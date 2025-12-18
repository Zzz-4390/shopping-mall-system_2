import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCartItems, deleteCartItem } from '@/apis'
import type { CartItemDetail } from '@/types'
import type { User } from '@/types'
import { getUser } from '@/apis/user'

// 扩展 CartItemDetail 类型以包含 quantity 字段
interface CartItemWithQuantity extends CartItemDetail {
  quantity: number
}

const cartItems = ref<CartItemWithQuantity[]>([])

// 购物车数量
const cartCount = computed(() => cartItems.value.length)

export const useUserStore = defineStore('user', () => {
  // 用户信息状态
  const userInfo = ref<User>({
    userid: '',
    name: '',
    phone: '',
    photo: '',
    registertime: '',
    password: '',
    cart: [],
  })

  // 是否已登录，基于内存中的 userInfo
  const isLoggedIn = computed(() => !!userInfo.value.userid)

  // 获取购物车数据
  const fetchCartItems = async () => {
    if (!cartid.value) return

    try {
      const res = await getCartItems(cartid.value)
      cartItems.value = (res.data.data as CartItemDetail[]).map((item) => ({
        ...item,
        quantity: 1,
      }))
    } catch (error) {
      console.error('获取购物车数据失败:', error)
    }
  }

  //购物车id
  const cartid = computed(() => userInfo.value.cart?.[0]?.cartid)
  // 设置用户信息
  const setUserInfo = (info: Partial<User>) => {
    userInfo.value = {
      ...userInfo.value,
      ...info,
    }
    try {
      // 同步到 localStorage，页面刷新可恢复
      // 保存前剔除敏感字段（password）
      // shallow clone and remove password
      const safe = { ...userInfo.value } as Record<string, unknown>
      if ('password' in safe) delete safe.password
      localStorage.setItem('userInfo', JSON.stringify(safe))
    } catch (e) {
      console.warn('无法保存用户信息到 localStorage', e)
    }
  }

  // 清除用户信息（退出登录时使用）
  const clearUserInfo = () => {
    userInfo.value = {
      userid: '',
      name: '',
      phone: '',
      photo: '',
      registertime: '',
      password: '',
      cart: [],
    }
    try {
      localStorage.removeItem('userInfo')
    } catch (e) {
      console.warn('无法从 localStorage 删除用户信息', e)
    }
  }

  // 恢复用户信息
  const restoreUserInfo = () => {
    try {
      const stored = localStorage.getItem('userInfo')
      let parsed: Partial<User> | null = null
      if (stored) {
        parsed = JSON.parse(stored) as Partial<User>
        if (parsed && parsed.userid) {
          // 先用本地快照快速恢复（不包含 password）
          userInfo.value = {
            ...userInfo.value,
            ...parsed,
          }
        }
      }

      if (parsed && parsed.userid) {
        // 不阻塞调用者，异步刷新
        getUser(parsed.userid)
          .then((res) => {
            if (res && Array.isArray(res) && res.length > 0) {
              // 使用后端最新数据覆盖本地快照
              const u = res[0]
              if (u) {
                setUserInfo(u as Partial<User>)
              }
            }
          })
          .catch((err) => {
            console.warn('使用 token 刷新用户信息失败', err)
          })
      }
    } catch (e) {
      console.warn('恢复用户信息失败', e)
    }
  }

  // 清空购物车
  const clearCartItems = async () => {
    try {
      // 遍历所有购物车项目并逐个删除
      const deletePromises = cartItems.value.map((item) =>
        deleteCartItem(item.cartitemid.toString()),
      )

      // 等待所有删除操作完成
      await Promise.all(deletePromises)

      // 清空本地购物车状态
      cartItems.value = []
    } catch (error) {
      console.error('清空购物车失败:', error)
      throw error
    }
  }
  return {
    userInfo,
    isLoggedIn,
    cartCount,
    cartid,
    cartItems,
    fetchCartItems,
    setUserInfo,
    clearUserInfo,
    restoreUserInfo,
    clearCartItems,
  }
})
