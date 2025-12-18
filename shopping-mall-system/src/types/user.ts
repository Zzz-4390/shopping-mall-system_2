export type UserRegisterRequest = {
  phone: string
  password: string
}

export type UserLoginRequest = {
  phone: string
  password: string
}

/**
 * 用户更新请求：可包含要更新的字段
 * - photo: 可选，用户头像（后端使用 MEDIUMBLOB 存储）
 * - name: 可选，用户名
 * - password: 可选，新密码
 * - oldPassword: 可选，旧密码（如果要修改密码需提供）
 */
export type UserUpdateRequest = {
  photo?: string | null
  name?: string
  password?: string
  oldPassword?: string
}

/**
 * 用户类型（来自后端 users 表）
 */
export type User = {
  userid: string
  phone: string
  /** 密码不应该持久化，后端返回时可能包含但前端持久化时会剔除 */
  password?: string
  name: string
  photo?: string | null
  registertime: string
  /** 可选的购物车数组（login 包含 cart） */
  cart?: import('./cart').Cart[]
}

export type ApiResult<T> = {
  code: number
  message: string
  data?: T
}

/**
 * 注册接口返回类型：返回新创建的用户
 */
export type UserRegisterResponse = ApiResult<User>
