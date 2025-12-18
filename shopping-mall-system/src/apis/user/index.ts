import request from '@/utils/request'
import type {
  UserRegisterRequest,
  UserLoginRequest,
  UserUpdateRequest,
  User,
  ApiResult,
} from '@/types'

const baseURL = '/user'

const API = {
  login: '/login',
  register: '/regist',
  get: '/',
}

// 注册
export const userRegister = (body: UserRegisterRequest) =>
  request.post(baseURL + API.register, body)

// 登录
export const userLogin = (body: UserLoginRequest) => request.post(baseURL + API.login, body)

// 获取用户信息（根据 userid，后端返回用户数组）
export const getUser = (userid: string): Promise<User> => request.get(`${baseURL}/get/${userid}`)

// 更新用户信息
export const updateUser = (userid: string, body: UserUpdateRequest): Promise<ApiResult<User>> =>
  request.put(`${baseURL}/update/${userid}`, body)

export default { userRegister, userLogin, getUser, updateUser }
