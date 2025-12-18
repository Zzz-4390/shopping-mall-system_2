<template>
  <div class="product-post-page">
    <div class="container">
      <h1 class="page-title">发布商品</h1>

      <form @submit.prevent="submitProduct" class="product-form">
        <!-- 商品标题 -->
        <div class="form-group">
          <label for="title">商品标题</label>
          <input
            id="title"
            v-model="productForm.title"
            type="text"
            placeholder="请输入商品标题"
            class="form-control"
            :class="{ 'is-invalid': errors.title }"
          />
          <div v-if="errors.title" class="invalid-feedback">{{ errors.title }}</div>
        </div>

        <!-- 商品分类 -->
        <div class="form-group">
          <label for="category">商品分类</label>
          <select
            id="category"
            v-model="productForm.category"
            class="form-control"
            :class="{ 'is-invalid': errors.category }"
          >
            <option value="">请选择分类</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <div v-if="errors.category" class="invalid-feedback">{{ errors.category }}</div>
        </div>

        <!-- 商品价格 -->
        <div class="form-group">
          <label for="price">商品价格</label>
          <input
            id="price"
            v-model="priceDisplay"
            type="text"
            inputmode="decimal"
            placeholder="请输入价格"
            class="form-control"
            :class="{ 'is-invalid': errors.price }"
            @blur="formatPrice"
          />
          <div v-if="errors.price" class="invalid-feedback">{{ errors.price }}</div>
        </div>

        <!-- 商品图片上传 -->
        <div class="form-group">
          <label>商品图片</label>
          <div class="image-upload-area">
            <!-- 只允许上传一张图片：有图片则显示预览并可删除；无图片时显示占位上传区 -->
            <div class="image-preview" v-if="productForm.photo.length > 0">
              <img :src="productForm.photo?.[0]?.url ?? ''" alt="商品图片" />
              <button type="button" @click="removeImage()" class="remove-image-btn">×</button>
            </div>

            <div v-else class="upload-placeholder" @click="triggerFileInput">
              <div class="upload-icon">+</div>
              <p>点击上传图片<br /><small>(仅限1张)</small></p>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="hidden-file-input"
              />
            </div>
          </div>
          <div v-if="errors.photo" class="invalid-feedback">{{ errors.photo }}</div>
        </div>

        <!-- 商品描述 -->
        <div class="form-group">
          <label for="content">商品描述</label>
          <textarea
            id="content"
            v-model="productForm.content"
            rows="6"
            placeholder="请详细描述商品信息，包括品牌、规格、新旧程度、是否有瑕疵等"
            class="form-control"
            :class="{ 'is-invalid': errors.content }"
          ></textarea>
          <div v-if="errors.content" class="invalid-feedback">{{ errors.content }}</div>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <button type="button" @click="resetForm" class="btn btn-secondary">重置</button>
          <button type="submit" :disabled="isSubmitting" class="btn btn-primary">
            {{ isSubmitting ? '发布中...' : '发布商品' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { categories } from '@/types'
// 表单数据
const productForm = reactive({
  title: '',
  category: '',
  price: null as number | null,
  photo: [] as Array<{ file: File; url: string }>,
  content: '',
})

// 显示用价格字符串，确保展示两位小数
const priceDisplay = ref('')

// 错误信息
const errors = reactive<Record<string, string>>({})

// 页面状态
const isSubmitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// 配置参数
// 单图上传，不再需要 maxImages

// 路由
const router = useRouter()
const userStore = useUserStore()

// 触发文件选择
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// 处理图片上传（仅一张）
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    target.value = ''
    return
  }

  // 可选：限制大小（例如 5MB）
  const maxMb = 5
  if (file.size / 1024 / 1024 > maxMb) {
    alert(`图片大小不能超过 ${maxMb} MB`)
    target.value = ''
    return
  }

  // 生成预览并替换已有图片（仅保留一张）
  const url = URL.createObjectURL(file)
  productForm.photo = [{ file, url }]

  // 清空 input 值以便重复选择同一文件
  target.value = ''
}

// 移除图片（清空单张图片）
const removeImage = () => {
  productForm.photo = []
}

// 格式化价格为两位小数并同步为数值
const formatPrice = () => {
  if (!priceDisplay.value) {
    productForm.price = null
    return
  }

  // 允许用户输入千位分隔符或空格，先移除
  const cleaned = priceDisplay.value.replace(/[,\s]/g, '')
  const parsed = parseFloat(cleaned)
  if (isNaN(parsed) || parsed <= 0) {
    errors.price = '请输入有效的商品价格'
    return
  }

  const fixed = parsed.toFixed(2)
  priceDisplay.value = fixed
  productForm.price = parseFloat(fixed)
  delete errors.price
}

// 验证表单
const validateForm = (): boolean => {
  // 清空之前的错误
  Object.keys(errors).forEach((key) => delete errors[key])

  // 必填验证
  if (!productForm.title.trim()) {
    errors.title = '请输入商品标题'
  }

  if (!productForm.category) {
    errors.category = '请选择商品分类'
  }

  if (productForm.price === null || productForm.price <= 0) {
    errors.price = '请输入有效的商品价格'
  }

  if (productForm.photo.length === 0) {
    errors.photo = '请至少上传一张商品图片'
  }

  if (!productForm.content.trim()) {
    errors.content = '请输入商品描述'
  }

  return Object.keys(errors).length === 0
}

// 提交商品
const submitProduct = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    // 确保价格已格式化
    formatPrice()

    // 构建 FormData 并上传文件（字段名与后端 multer.single('file') 对应）
    const sellerid = userStore.userInfo.userid || ''
    const formData = new FormData()
    formData.append('sellerid', sellerid)
    formData.append('title', productForm.title)
    formData.append('content', productForm.content)
    formData.append('price', String(productForm.price || 0))
    formData.append('category', productForm.category)

    const fileToUpload = productForm?.photo?.[0]?.file
    if (fileToUpload) {
      formData.append('file', fileToUpload)
    }
    const res = await request.post('/product/add', formData)
    if (res?.data?.code === 200) {
      ElMessage.success('商品发布成功！')
      router.push('/')
    } else {
      ElMessage.error(res?.data?.message || '商品发布失败')
    }
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('商品发布失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

// 重置表单
const resetForm = async () => {
  try {
    await ElMessageBox.confirm('确定要重置表单吗？所有已填写的内容将会丢失。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    productForm.title = ''
    productForm.category = ''
    productForm.price = null
    productForm.photo = []
    productForm.content = ''

    // 清空错误信息
    Object.keys(errors).forEach((key) => delete errors[key])
  } catch {
    // 用户点击取消或关闭弹窗时不执行任何操作
    return
  }
}
</script>

<style scoped>
.product-post-page {
  padding: 30px 0;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

.page-title {
  text-align: center;
  margin-bottom: 40px;
  color: #333;
  font-size: 32px;
  font-weight: 600;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 10px;
  color: #495057;
  font-size: 16px;
}

.form-control {
  padding: 14px 18px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
  background-color: #fff;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}

.is-invalid {
  border-color: #dc3545 !important;
}

.invalid-feedback {
  color: #dc3545;
  font-size: 14px;
  margin-top: 8px;
}

.image-upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 15px 0;
}

.image-preview {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc3545;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.remove-image-btn:hover {
  transform: scale(1.1);
  background: white;
}

.upload-placeholder {
  width: 140px;
  height: 140px;
  border: 2px dashed #ced4da;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  text-align: center;
  color: #6c757d;
  transition: all 0.3s;
  background-color: #f8f9fa;
}

.upload-placeholder:hover {
  border-color: #007bff;
  color: #007bff;
  background-color: #e9f4ff;
}

.upload-icon {
  font-size: 36px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 5px;
}

.hidden-file-input {
  display: none;
}

textarea.form-control {
  resize: vertical;
  min-height: 150px;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 25px;
  margin-top: 20px;
  padding-top: 20px;
}

.btn {
  padding: 14px 36px;
  border: none;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 140px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 123, 255, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background-color: #0069d9;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 123, 255, 0.3);
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  box-shadow: 0 4px 6px rgba(108, 117, 125, 0.2);
}

.btn-secondary:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(108, 117, 125, 0.3);
}

@media (max-width: 768px) {
  .product-post-page {
    padding: 20px 0;
  }

  .container {
    margin: 0 15px;
    padding: 25px;
  }

  .page-title {
    font-size: 28px;
    margin-bottom: 30px;
  }

  .product-form {
    gap: 25px;
  }

  .form-actions {
    flex-direction: column;
    gap: 15px;
  }

  .btn {
    width: 100%;
  }

  .image-upload-area {
    justify-content: flex-start;
  }
}
</style>
