import request from '@/utils/request'
import type { AxiosResponse } from 'axios'
import type { CreateProductRequest, UpdateProductRequest, Product, ApiResult } from '@/types'

const baseURL = '/product'

// 创建商品
export const createProduct = (
  body: CreateProductRequest,
): Promise<AxiosResponse<ApiResult<Product>>> => request.post(`${baseURL}/add`, body)

// 获取所有商品
export const getAllProducts = (): Promise<ApiResult<Product[]>> => request.get(`${baseURL}/getAll`)

// 删除商品
export const deleteProduct = (productid: string): Promise<ApiResult<{ productid: string }>> =>
  request.delete(`${baseURL}/delete/${productid}`)

// 更新商品（部分更新）
export const updateProduct = (
  productid: string,
  body: UpdateProductRequest,
): Promise<ApiResult<Product>> => request.put(`${baseURL}/update/${productid}`, body)

// 根据商品ID获取商品详情
export const getProductById = (productid: string) => request.get(`${baseURL}/get/${productid}`)

// 根据卖家ID获取商品列表
export const getProductsBySeller = (
  sellerid: string,
): Promise<AxiosResponse<ApiResult<Product[]>>> => request.get(`${baseURL}/seller/${sellerid}`)

// 根据分类获取商品列表
export const getProductsByCategory = (category: string): Promise<ApiResult<Product[]>> =>
  request.get(`${baseURL}/category/${category}`)

export default {
  createProduct,
  getAllProducts,
  deleteProduct,
  updateProduct,
  getProductById,
  getProductsBySeller,
  getProductsByCategory,
}
