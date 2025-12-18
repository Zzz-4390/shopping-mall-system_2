import { ElMessage } from 'element-plus'
import axios, { type AxiosResponse, type AxiosError } from 'axios'

interface ApiResponse {
  code?: number
  message?: string
  data?: unknown
}

const request = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>): AxiosResponse<ApiResponse> => {
    const data = response.data

    if (data.code !== undefined && data.code !== 200) {
      ElMessage.error(data.message || '请求失败')
      // 构造一个假的响应对象来维持类型一致
      return {
        ...response,
        data: {
          code: data.code,
          message: data.message || '请求失败',
          data: null,
        },
      }
    }

    return response
  },
  (error: AxiosError) => {
    let message = '网络错误，请重试'

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      message = '登录已过期，请重新登录'
    } else if (error.response?.status === 403) {
      message = '无权访问该资源'
    } else if (error.response?.status === 404) {
      message = '请求资源不存在'
    } else if (error.response?.status === 500) {
      message = '服务器错误，请稍后重试'
    } else if (error.response?.data) {
      const responseData = error.response.data as ApiResponse
      message = responseData.message || '请求失败'
    } else if (error.message) {
      message = error.message
    }

    ElMessage.error(message)

    return Promise.reject({
      code: error.response?.status || -1,
      message,
      error,
    })
  },
)

export default request
