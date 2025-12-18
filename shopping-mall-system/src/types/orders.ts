/**
 * 创建订单请求：POST /orders/create or POST /orders/:buyerid/create
 */
export type CreateOrderRequest = {
  sellerid: string
  productid: string
}

/**
 * 完成订单：路径参数 orderid
 */
export type CompleteOrderParams = {
  orderid: string
}

/**
 * 查询订单：路径参数 userid（作为买家或卖家）
 */
export type GetOrdersParams = {
  userid: string
}

/**
 * 订单视图类型（来自 vw_user_order_detail）
 */
export type OrderDetail = {
  orderid: string
  buyerid: string
  sellerid: string
  productid: string
  createtime?: string
  finishtime?: string | null
  isdone?: boolean
  product_title?: string
  product_price?: number
  product_photo?: string | null
  product_status?: string
  product_category?: string
  buyer_name?: string
  buyer_phone?: string
  seller_name?: string
  seller_phone?: string
}
