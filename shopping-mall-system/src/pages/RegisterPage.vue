<template>
  <div class="register-container">
    <div class="register-box">
      <h2>用户注册</h2>
      <el-form
        :model="registerForm"
        :rules="registerRules"
        ref="registerFormRef"
        class="register-form"
        @keyup.enter="handleRegister"
      >
        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号"
            prefix-icon="Phone"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="agreeTerms">
            我已阅读并同意
            <el-button type="text">《用户协议》</el-button>和<el-button type="text"
              >《隐私政策》</el-button
            >
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="register-btn"
            @click="handleRegister"
            :loading="loading"
            :disabled="!agreeTerms"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-link">
        已有账号？<el-button type="text" @click="router.push('/login')">立即登录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { userRegister } from '@/apis'
import { useRouter } from 'vue-router'

const router = useRouter()
const registerFormRef = ref<FormInstance>()

const registerForm = reactive({
  phone: '',
  password: '',
  confirmPassword: '',
})

const agreeTerms = ref(false)
const loading = ref(false)

// 密码验证函数
const validatePass = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (registerForm.confirmPassword !== '') {
      if (registerFormRef.value) {
        registerFormRef.value.validateField('confirmPassword')
      }
    }
    callback()
  }
}

// 确认密码验证函数
const validatePass2 = (rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const registerRules = reactive<FormRules<typeof registerForm>>({
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }],
})

const handleRegister = async () => {
  if (!registerFormRef.value) return
  if (!agreeTerms.value) {
    ElMessage.warning('请先同意用户协议和隐私政策')
    return
  }

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const requestData = {
          phone: registerForm.phone,
          password: registerForm.password,
        }
        loading.value = true
        await userRegister(requestData)
        ElMessage.success('注册成功！')
        router.push('/login')
      } catch (error: unknown) {
        if (error instanceof Error) {
          ElMessage.error(error.message || '注册失败，请稍后再试')
        } else {
          ElMessage.error('注册失败，请稍后再试')
        }
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.register-box {
  width: 450px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.register-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.register-form {
  margin-bottom: 20px;
}

.register-btn {
  width: 100%;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}
</style>
