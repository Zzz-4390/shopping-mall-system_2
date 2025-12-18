import request from '@/utils/request'
import type { CreateOrderRequest } from '@/types'

const baseURL = '/orders'

// 创建订单：POST /orders/add/:buyerid
export const createOrder = (buyerid: string, body: CreateOrderRequest) =>
  request.post(`${baseURL}/add/${buyerid}`, body)

// 完成订单：POST /orders/complete/:orderid
export const completeOrder = (orderid: string) => request.post(`${baseURL}/complete/${orderid}`)

// 查询订单信息：GET /orders/get/:userid
export const getOrders = (userid: string) => request.get(`${baseURL}/get/${userid}`)

export default { createOrder, completeOrder, getOrders }
