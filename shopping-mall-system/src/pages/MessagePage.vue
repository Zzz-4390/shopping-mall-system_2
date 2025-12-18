<!-- MessagePage.vue -->
<template>
  <div class="message-page">
    <div class="header-section">
      <el-page-header @back="goBack" class="page-header">
        <template #content>
          <div class="header-content">
            <el-icon class="header-icon"><ChatDotRound /></el-icon>
            <span class="header-title">我的消息</span>
          </div>
        </template>
      </el-page-header>
    </div>

    <div class="main-container">
      <el-row :gutter="20" class="content-wrapper">
        <!-- 左侧导航栏 -->
        <el-col :span="6" class="sidebar-col">
          <div class="sidebar">
            <el-menu :default-active="activeMenu" class="menu" @select="handleMenuSelect">
              <el-menu-item index="system">
                <el-icon><Bell /></el-icon>
                <span>系统消息</span>
                <el-badge
                  :value="unreadSystemCount"
                  :max="99"
                  class="badge"
                  v-if="unreadSystemCount > 0"
                />
              </el-menu-item>
              <el-menu-item index="private">
                <el-icon><Message /></el-icon>
                <span>私人消息</span>
                <el-badge
                  :value="unreadPrivateCount"
                  :max="99"
                  class="badge"
                  v-if="unreadPrivateCount > 0"
                />
              </el-menu-item>
            </el-menu>

            <!-- 联系人列表 -->
            <div class="contacts-list" v-show="activeMenu === 'private'">
              <div class="contacts-header">
                <h3>联系人</h3>
                <el-button
                  type="primary"
                  :icon="Plus"
                  circle
                  size="small"
                  @click="showNewMessageDialog = true"
                  title="发新消息"
                />
              </div>

              <div class="contacts-search">
                <el-input
                  v-model="contactSearch"
                  placeholder="搜索联系人"
                  :prefix-icon="Search"
                  size="small"
                />
              </div>

              <el-scrollbar class="contacts-scrollbar">
                <div
                  v-for="contact in filteredContacts"
                  :key="contact.id"
                  class="contact-item"
                  :class="{ active: activeContact === contact.id }"
                  @click="selectContact(contact)"
                >
                  <el-badge :is-dot="hasUnreadMessages(contact.id)" class="contact-badge">
                    <el-avatar :src="contact.avatar" :size="36" />
                  </el-badge>
                  <div class="contact-info">
                    <div class="contact-name">{{ contact.name }}</div>
                    <div class="contact-last-message">
                      {{ getLastMessagePreview(contact.id) }}
                    </div>
                  </div>
                  <div class="contact-time">
                    {{ getLastMessageTime(contact.id) }}
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </div>
        </el-col>

        <!-- 右侧内容区域 -->
        <el-col :span="18" class="content-col">
          <!-- 系统消息内容 -->
          <div class="content-area" v-show="activeMenu === 'system'">
            <div class="section-header">
              <h2>系统消息</h2>
              <div class="actions">
                <el-button type="primary" :icon="Refresh" @click="refreshSystemMessages" link>
                  刷新
                </el-button>
              </div>
            </div>

            <el-empty
              v-if="systemMessages.length === 0"
              description="暂无系统消息"
              class="empty-state"
            />

            <el-scrollbar class="messages-scrollbar" v-else>
              <transition-group name="list" tag="div" class="messages-list">
                <div
                  v-for="message in systemMessages"
                  :key="message.id"
                  class="message-card"
                  :class="{ unread: !message.read }"
                >
                  <div class="message-header">
                    <div class="message-type">
                      <el-tag :type="message.read ? 'info' : 'danger'" size="small">
                        {{ message.read ? '已读' : '未读' }}
                      </el-tag>
                      <el-tag type="success" size="small">系统</el-tag>
                    </div>
                    <div class="message-actions">
                      <el-button
                        v-if="!message.read"
                        type="primary"
                        size="small"
                        @click="markAsRead(message.id)"
                        link
                      >
                        标记已读
                      </el-button>
                      <el-dropdown @command="handleSystemMessageAction">
                        <el-button size="small" link>
                          <el-icon><More /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item
                              :command="{ action: 'mark', id: message.id }"
                              v-if="!message.read"
                            >
                              标记已读
                            </el-dropdown-item>
                            <el-dropdown-item :command="{ action: 'delete', id: message.id }">
                              删除消息
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>

                  <div class="message-title">{{ message.title }}</div>
                  <div class="message-content">{{ message.content }}</div>
                  <div class="message-time">{{ formatTime(message.time) }}</div>
                </div>
              </transition-group>
            </el-scrollbar>
          </div>

          <!-- 私人消息内容 -->
          <div class="content-area chat-area" v-show="activeMenu === 'private'">
            <div class="chat-header" v-if="activeContact">
              <div class="contact-info">
                <el-avatar :src="currentContact?.avatar" :size="36" />
                <div class="contact-details">
                  <div class="contact-name">{{ currentContact?.name }}</div>
                  <div class="contact-status">在线</div>
                </div>
              </div>
              <div class="chat-actions">
                <el-button :icon="More" circle />
              </div>
            </div>

            <el-empty
              v-if="!activeContact"
              description="请选择联系人开始聊天"
              class="empty-state"
            />

            <template v-else>
              <el-scrollbar class="chat-scrollbar" ref="chatScrollbar">
                <div class="chat-messages">
                  <div
                    v-for="message in currentMessages"
                    :key="message.id"
                    class="chat-message"
                    :class="{
                      sent: message.senderId === currentUserId,
                      received: message.senderId !== currentUserId,
                    }"
                  >
                    <el-avatar
                      v-if="message.senderId !== currentUserId"
                      :src="currentContact?.avatar"
                      :size="32"
                      class="avatar"
                    />

                    <div class="message-bubble">
                      <div class="message-content">{{ message.content }}</div>
                      <div class="message-time">{{ formatTime(message.time) }}</div>
                    </div>

                    <el-avatar
                      v-if="message.senderId === currentUserId"
                      :src="currentUser.avatar"
                      :size="32"
                      class="avatar"
                    />
                  </div>
                </div>
              </el-scrollbar>

              <div class="chat-input">
                <el-input
                  v-model="newMessageContent"
                  type="textarea"
                  :rows="3"
                  placeholder="输入消息..."
                  resize="none"
                  @keydown.enter.exact.prevent="sendMessage"
                  @keydown.enter.shift.exact.prevent="newMessageContent += '\n'"
                />
                <div class="input-actions">
                  <el-button
                    type="primary"
                    @click="sendMessage"
                    :disabled="!newMessageContent.trim()"
                  >
                    发送
                    <el-icon class="send-icon"><Promotion /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 新建私信对话框 -->
    <el-dialog
      v-model="showNewMessageDialog"
      title="发送新消息"
      width="500px"
      class="new-message-dialog"
    >
      <el-form :model="newMessageForm" label-position="top">
        <el-form-item label="收件人">
          <el-select
            v-model="newMessageForm.recipientId"
            placeholder="请选择联系人"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="contact in contacts"
              :key="contact.id"
              :label="contact.name"
              :value="contact.id"
            >
              <div class="contact-option">
                <el-avatar :src="contact.avatar" :size="24" />
                <span>{{ contact.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input
            v-model="newMessageForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入消息内容"
            resize="none"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showNewMessageDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="sendNewMessage"
            :disabled="!newMessageForm.recipientId || !newMessageForm.content.trim()"
          >
            发送
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  ElPageHeader,
  ElRow,
  ElCol,
  ElMenu,
  ElMenuItem,
  ElIcon,
  ElBadge,
  ElAvatar,
  ElScrollbar,
  ElInput,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElDialog,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElEmpty,
  ElTag,
  ElMessage,
  ElMessageBox,
} from 'element-plus'
import {
  ChatDotRound,
  Bell,
  Message,
  Plus,
  Search,
  Refresh,
  More,
  Promotion,
} from '@element-plus/icons-vue'

interface SystemMessage {
  id: number
  title: string
  content: string
  time: Date
  read: boolean
}

interface PrivateMessage {
  id: number
  senderId: number
  recipientId: number
  content: string
  time: Date
  read: boolean
}

interface Contact {
  id: number
  name: string
  avatar: string
}

// 路由
const router = useRouter()

// 数据状态
const activeMenu = ref('system')
const activeContact = ref<number | null>(null)
const contactSearch = ref('')
const newMessageContent = ref('')
const showNewMessageDialog = ref(false)

// 当前用户信息
const currentUserId = 1
const currentUser = {
  id: 1,
  name: '当前用户',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
}

// 表单数据
const newMessageForm = ref({
  recipientId: null as number | null,
  content: '',
})

// 模拟数据
const systemMessages = ref<SystemMessage[]>([
  {
    id: 1,
    title: '系统维护通知',
    content: '为了提升服务质量，系统将于今晚 2:00-4:00 进行维护，届时将无法访问，请提前做好准备。',
    time: new Date(Date.now() - 3600000),
    read: false,
  },
  {
    id: 2,
    title: '账户安全提醒',
    content: '您的账户最近有新的登录活动，如非本人操作请及时修改密码。',
    time: new Date(Date.now() - 86400000),
    read: true,
  },
  {
    id: 3,
    title: '新品上线通知',
    content: '全新二手数码产品专区已上线，欢迎前来选购！',
    time: new Date(Date.now() - 172800000),
    read: true,
  },
])

const contacts = ref<Contact[]>([
  {
    id: 2,
    name: '张三',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  },
  {
    id: 3,
    name: '李四',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea90c7d3a2e4e3a1c3d4a3d3a3d4png.png',
  },
  {
    id: 4,
    name: '王五',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
  },
  {
    id: 5,
    name: '赵六',
    avatar: 'https://cube.elemecdn.com/6/44/3c55d4d3a3d3a3d3a3d3a3d3a3d3apng.png',
  },
  {
    id: 6,
    name: '孙七',
    avatar: 'https://cube.elemecdn.com/d/fe/7d3a3d3a3d3a3d3a3d3a3d3a3d3apng.png',
  },
])

const privateMessages = ref<PrivateMessage[]>([
  {
    id: 1,
    senderId: 2,
    recipientId: 1,
    content: '你好，我想了解一下那个iPhone的详细情况',
    time: new Date(Date.now() - 300000),
    read: false,
  },
  {
    id: 2,
    senderId: 1,
    recipientId: 2,
    content: '您好，这款iPhone是去年购买的，几乎全新，可以面交',
    time: new Date(Date.now() - 240000),
    read: true,
  },
  {
    id: 3,
    senderId: 2,
    recipientId: 1,
    content: '好的，那我们约个时间地点看看吧',
    time: new Date(Date.now() - 180000),
    read: true,
  },
  {
    id: 4,
    senderId: 3,
    recipientId: 1,
    content: '您发布的笔记本电脑还在吗？',
    time: new Date(Date.now() - 86400000),
    read: false,
  },
  {
    id: 5,
    senderId: 1,
    recipientId: 3,
    content: '还在的，您什么时候方便来看一下？',
    time: new Date(Date.now() - 85000000),
    read: true,
  },
  {
    id: 6,
    senderId: 4,
    recipientId: 1,
    content: '我对您发布的相机很感兴趣，能详细介绍一下吗？',
    time: new Date(Date.now() - 172800000),
    read: false,
  },
])

// 计算属性
const unreadSystemCount = computed(() => {
  return systemMessages.value.filter((msg) => !msg.read).length
})

const unreadPrivateCount = computed(() => {
  return privateMessages.value.filter((msg) => msg.recipientId === currentUserId && !msg.read)
    .length
})

const filteredContacts = computed(() => {
  if (!contactSearch.value) return contacts.value
  return contacts.value.filter((contact) =>
    contact.name.toLowerCase().includes(contactSearch.value.toLowerCase()),
  )
})

const currentContact = computed(() => {
  if (!activeContact.value) return null
  return contacts.value.find((contact) => contact.id === activeContact.value)
})

const currentMessages = computed(() => {
  if (!activeContact.value) return []

  return privateMessages.value
    .filter(
      (msg) =>
        (msg.senderId === activeContact.value && msg.recipientId === currentUserId) ||
        (msg.senderId === currentUserId && msg.recipientId === activeContact.value),
    )
    .sort((a, b) => a.time.getTime() - b.time.getTime())
})

// 方法
const goBack = () => {
  router.go(-1)
}

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
  if (index === 'private' && !activeContact.value && contacts.value.length > 0) {
    activeContact.value = contacts.value[0] ? contacts.value[0].id : null
  }
}

const selectContact = (contact: Contact) => {
  activeContact.value = contact.id

  // 标记与此联系人的消息为已读
  privateMessages.value.forEach((msg) => {
    if (msg.senderId === contact.id && msg.recipientId === currentUserId) {
      msg.read = true
    }
  })
}

const hasUnreadMessages = (contactId: number) => {
  return privateMessages.value.some(
    (msg) => msg.senderId === contactId && msg.recipientId === currentUserId && !msg.read,
  )
}

const getLastMessagePreview = (contactId: number) => {
  const messages = privateMessages.value.filter(
    (msg) =>
      (msg.senderId === contactId && msg.recipientId === currentUserId) ||
      (msg.senderId === currentUserId && msg.recipientId === contactId),
  )

  const lastMessage = messages[messages.length - 1]
  if (!lastMessage) return '暂无消息'

  return lastMessage.content.length > 20
    ? lastMessage.content.substring(0, 20) + '...'
    : lastMessage.content
}

const getLastMessageTime = (contactId: number) => {
  const messages = privateMessages.value.filter(
    (msg) =>
      (msg.senderId === contactId && msg.recipientId === currentUserId) ||
      (msg.senderId === currentUserId && msg.recipientId === contactId),
  )

  if (messages.length === 0) return ''

  const lastMessage = messages[messages.length - 1]
  return lastMessage ? formatTime(lastMessage.time) : ''
}
const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const refreshSystemMessages = () => {
  ElMessage.success('消息已刷新')
}

const markAsRead = (id: number) => {
  const message = systemMessages.value.find((msg) => msg.id === id)
  if (message) {
    message.read = true
    ElMessage.success('消息已标记为已读')
  }
}

const handleSystemMessageAction = (command: { action: string; id: number }) => {
  if (command.action === 'mark') {
    markAsRead(command.id)
  } else if (command.action === 'delete') {
    deleteSystemMessage(command.id)
  }
}

const deleteSystemMessage = (id: number) => {
  ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      systemMessages.value = systemMessages.value.filter((msg) => msg.id !== id)
      ElMessage.success('删除成功')
    })
    .catch(() => {
      // 用户取消删除
    })
}

const sendMessage = () => {
  if (!newMessageContent.value.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }

  if (!activeContact.value) {
    ElMessage.error('请选择联系人')
    return
  }

  const newMessage: PrivateMessage = {
    id: Date.now(),
    senderId: currentUserId,
    recipientId: activeContact.value,
    content: newMessageContent.value,
    time: new Date(),
    read: false,
  }

  privateMessages.value.push(newMessage)
  newMessageContent.value = ''

  // 滚动到底部
  nextTick(() => {
    const scrollContainer = document.querySelector('.chat-scrollbar .el-scrollbar__wrap')
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  })

  ElMessage.success('消息发送成功')
}

const sendNewMessage = () => {
  if (!newMessageForm.value.recipientId) {
    ElMessage.warning('请选择收件人')
    return
  }

  if (!newMessageForm.value.content.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }

  const newMessage: PrivateMessage = {
    id: Date.now(),
    senderId: currentUserId,
    recipientId: newMessageForm.value.recipientId,
    content: newMessageForm.value.content,
    time: new Date(),
    read: false,
  }

  privateMessages.value.push(newMessage)

  // 如果正在与该联系人聊天，刷新界面
  if (activeContact.value === newMessageForm.value.recipientId) {
    activeContact.value = null
    nextTick(() => {
      activeContact.value = newMessageForm.value.recipientId
    })
  }

  // 重置表单
  newMessageForm.value = {
    recipientId: null,
    content: '',
  }

  showNewMessageDialog.value = false
  ElMessage.success('消息发送成功')
}

// 监听路由变化滚动到底部
watch(currentMessages, () => {
  nextTick(() => {
    const scrollContainer = document.querySelector('.chat-scrollbar .el-scrollbar__wrap')
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight
    }
  })
})
</script>

<style scoped>
.message-page {
  padding: 20px;
  min-height: calc(100vh - 40px);
  background-color: #f5f7fa;
}

.header-section {
  margin-bottom: 20px;
}

.page-header {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 20px;
  color: #409eff;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.main-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.content-wrapper {
  height: calc(100vh - 180px);
}

.sidebar-col,
.content-col {
  height: 100%;
}

.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ebeef5;
}

.menu {
  border-right: none;
  flex-shrink: 0;
}

.badge {
  margin-left: 10px;
}

.contacts-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
  border-top: 1px solid #ebeef5;
}

.contacts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.contacts-header h3 {
  margin: 0;
  font-size: 16px;
}

.contacts-search {
  margin-bottom: 15px;
}

.contacts-scrollbar {
  flex: 1;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 5px;
}

.contact-item:hover {
  background-color: #f2f6fc;
}

.contact-item.active {
  background-color: #ecf5ff;
}

.contact-badge {
  margin-right: 10px;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name {
  font-weight: 500;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-last-message {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-time {
  font-size: 12px;
  color: #c0c4cc;
  margin-left: 5px;
}

.content-area {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.messages-scrollbar {
  flex: 1;
  padding: 20px;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-card {
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.message-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.message-card.unread {
  border-left: 4px solid #409eff;
  background-color: #f0f8ff;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.message-type {
  display: flex;
  gap: 10px;
}

.message-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 10px;
  color: #303133;
}

.message-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 10px;
}

.message-time {
  font-size: 12px;
  color: #909399;
  text-align: right;
}

.chat-area {
  padding: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
}

.contact-details {
  margin-left: 10px;
}

.contact-status {
  font-size: 12px;
  color: #67c23a;
}

.chat-actions {
  display: flex;
  gap: 10px;
}

.chat-scrollbar {
  flex: 1;
  padding: 20px;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chat-message {
  display: flex;
  gap: 10px;
}

.chat-message.sent {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 15px;
  border-radius: 12px;
  position: relative;
}

.chat-message.received .message-bubble {
  background-color: #f2f6fc;
  border-top-left-radius: 0;
}

.chat-message.sent .message-bubble {
  background-color: #409eff;
  color: white;
  border-top-right-radius: 0;
}

.message-bubble .message-content {
  line-height: 1.5;
  word-wrap: break-word;
}

.message-bubble .message-time {
  font-size: 12px;
  margin-top: 5px;
  text-align: right;
}

.chat-message.received .message-time {
  color: #909399;
}

.chat-message.sent .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.chat-input {
  padding: 15px 20px;
  border-top: 1px solid #ebeef5;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.send-icon {
  margin-left: 5px;
}

.contact-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.new-message-dialog .el-select {
  width: 100%;
}

@media (max-width: 992px) {
  .sidebar-col {
    flex: 0 0 250px;
    max-width: 250px;
  }

  .content-col {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .message-page {
    padding: 10px;
  }

  .content-wrapper {
    height: calc(100vh - 120px);
  }

  .sidebar-col {
    flex: 0 0 200px;
    max-width: 200px;
  }

  .contact-info {
    display: none;
  }

  .message-bubble {
    max-width: 80%;
  }
}

@media (max-width: 576px) {
  .content-wrapper {
    flex-direction: column;
    height: auto;
  }

  .sidebar-col,
  .content-col {
    width: 100%;
    max-width: 100%;
  }

  .sidebar {
    border-right: none;
    border-bottom: 1px solid #ebeef5;
  }

  .contacts-list {
    display: none;
  }

  .message-bubble {
    max-width: 90%;
  }
}
</style>
