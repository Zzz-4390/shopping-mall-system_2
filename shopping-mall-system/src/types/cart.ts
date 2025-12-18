/**
 * 添加购物车项请求体（POST /cart/:cartid/add 或类似）
 */
export type AddCartItemRequest = {
  productid: string
}

/**
 * 删除购物车项使用路径参数：cartitemid
 */
export type DeleteCartItemParams = {
  cartitemid: string
}

/**
 * 查询购物车项使用路径参数：cartid
 */
export type GetCartItemsParams = {
  cartid: string
}

/**
 * 购物车项视图类型（来自 vw_cart_detail）
 */
export type CartItemDetail = {
  cartitemid: string
  cartid: string
  productid: string
  entertime: string
  product_title?: string
  product_content?: string
  product_price?: number
  product_photo?: string | null
  product_status?: string
  product_category?: string
  product_sellerid?: string
  cartuserid?: string
}

/**
 * Cart 基本类型，对应后端 `cart` 表
 */
export type Cart = {
  cartid: string
  cartuserid: string
}
