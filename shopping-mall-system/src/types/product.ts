export type Product = {
  productid: string
  sellerid: string
  title: string
  content: string
  price: number
  photo: string
  status: string
  publishtime: string
  category: string
}

/**
 * 商品分类类型
 */
export type Category = {
  id: string
  name: string
}

/**
 * 商品分类选项
 */
export const categories: Category[] = [
  { id: 'electronics', name: '数码电子' },
  { id: 'clothing', name: '服装鞋帽' },
  { id: 'books', name: '图书教材' },
  { id: 'home', name: '家居用品' },
  { id: 'sports', name: '运动户外' },
  { id: 'other', name: '其他' },
]

/**
 * 创建商品请求体（前端请求）
 */
export type CreateProductRequest = {
  sellerid: string
  title: string
  content: string
  price: number
  photo?: string | null
  // status 由后端默认设置为 ON_SALE，前端可不传
  status?: string
  category: string
}

/**
 * 更新商品请求体（可更新字段）
 */
export type UpdateProductRequest = {
  price?: number
  status?: string
}
