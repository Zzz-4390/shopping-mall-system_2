import request from '@/utils/request'
import type { AddCartItemRequest } from '@/types'

const baseURL = '/cart'

// 添加购物车项：POST /cart/add/:cartid
export const addCartItem = (cartid: string, body: AddCartItemRequest) =>
  request.post(`${baseURL}/add/${cartid}`, body)

// 删除购物车项：DELETE /cart/delete/:cartitemid
export const deleteCartItem = (cartitemid: string) =>
  request.delete(`${baseURL}/delete/${cartitemid}`)

// 获取购物车项：GET /cart/get/:cartid
export const getCartItems = (cartid: string) => request.get(`${baseURL}/get/${cartid}`)

export default { addCartItem, deleteCartItem, getCartItems }
