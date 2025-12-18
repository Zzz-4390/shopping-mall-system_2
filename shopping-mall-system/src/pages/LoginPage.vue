<template>
  <div class="login-container">
    <div class="login-box">
      <h2>用户登录</h2>
      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="phone">
          <el-input
            v-model="loginForm.phone"
            placeholder="请输入手机号"
            prefix-icon="Phone"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-link">
        还没有账号？<el-button type="text" @click="router.push('/register')">立即注册</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { userLogin } from '@/apis'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()
const loginFormRef = ref<FormInstance>()

const loginForm = reactive({
  phone: '',
  password: '',
})

const loading = ref(false)

const loginRules = reactive<FormRules>({
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
})

// 登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true

      try {
        const res = await userLogin({
          phone: loginForm.phone,
          password: loginForm.password,
        })
        if (res.data.code === 200) {
          ElMessage.success('登录成功')
          userStore.setUserInfo(res.data.data)
          router.push('/')
        } else {
          ElMessage.error(res.data.message || '登录失败')
        }
      } catch (error) {
        console.error('登录错误:', error)
        // 登录失败清空表单
        loginForm.phone = ''
        loginForm.password = ''
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.login-form {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}
</style>
