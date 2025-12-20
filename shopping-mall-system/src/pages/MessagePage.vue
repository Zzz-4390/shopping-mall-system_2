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
      <div class="content-area">
        <div class="section-header">
          <h2>消息中心</h2>
          <div class="actions">
            <el-button-group class="filter-group">
              <el-button
                :type="filterType === 'all' ? 'primary' : 'default'"
                @click="filterType = 'all'"
                >全部</el-button
              >
              <el-button
                :type="filterType === 'system' ? 'primary' : 'default'"
                @click="filterType = 'system'"
                >系统</el-button
              >
              <el-button
                :type="filterType === 'private' ? 'primary' : 'default'"
                @click="filterType = 'private'"
                >私信</el-button
              >
            </el-button-group>
            <el-badge
              :value="unreadTotalCount"
              :max="99"
              v-if="unreadTotalCount > 0"
              class="badge"
            />
            <el-button
              type="primary"
              :icon="Refresh"
              @click="refreshAllMessages"
              link
            >
              刷新
            </el-button>
          </div>
        </div>

        <el-empty
          v-if="displayMessages.length === 0"
          description="暂无消息"
          class="empty-state"
        />

        <el-scrollbar class="messages-scrollbar" v-else>
          <transition-group name="list" tag="div" class="messages-list">
            <div
              v-for="item in displayMessages"
              :key="item.key"
              class="message-card"
              :class="{ unread: !item.read }"
              @click="item.type === 'private' ? openChatForItem(item) : null"
            >
              <div class="message-header">
                <div class="message-type">
                  <el-tag :type="item.read ? 'info' : 'danger'" size="small">
                    {{ item.read ? "已读" : "未读" }}
                  </el-tag>
                  <el-tag
                    :type="item.type === 'system' ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ item.type === "system" ? "系统" : "私信" }}
                  </el-tag>
                </div>
                <div class="message-actions">
                  <el-button
                    v-if="
                      item.type === 'system' &&
                      !item.read &&
                      extractOrderId(item.content)
                    "
                    size="small"
                    type="primary"
                    @click.stop="completeOrderFromMessage(item)"
                  >
                    确认订单
                  </el-button>
                  <el-button
                    v-if="
                      item.type === 'system' &&
                      !item.read &&
                      !extractOrderId(item.content)
                    "
                    type="primary"
                    size="small"
                    @click="markAsRead(item.id)"
                    link
                    >标记已读</el-button
                  >
                  <el-button
                    v-if="
                      item.type === 'private' &&
                      item.recipientId === currentUserNumeric &&
                      !item.read
                    "
                    type="primary"
                    size="small"
                    @click="markPrivateAsRead(item.id)"
                    link
                    >标记已读</el-button
                  >
                  <el-dropdown
                    @command="(cmd) => handleUnifiedAction(cmd, item)"
                    @click.stop
                  >
                    <el-button size="small" link>
                      <el-icon><More /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-if="
                            item.type === 'system' &&
                            !item.read &&
                            !extractOrderId(item.content)
                          "
                          :command="{ action: 'mark' }"
                          >标记已读</el-dropdown-item
                        >
                        <el-dropdown-item :command="{ action: 'delete' }"
                          >删除消息</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>

              <div class="message-title">
                <template v-if="item.type === 'system'">
                  {{ item.title }}
                </template>
                <template v-else>
                  <span v-if="item.senderId === currentUserNumeric"
                    >发给 {{ getContactName(item.recipientId) }}</span
                  >
                  <span v-else>来自 {{ getContactName(item.senderId) }}</span>
                </template>
              </div>
              <div class="message-content">
                <template
                  v-if="item.type === 'system' && extractOrderId(item.content)"
                >
                  <div class="order-line">
                    订单编号：{{ extractOrderId(item.content) }}
                  </div>
                  <div
                    v-if="extractProductTitle(item.content)"
                    class="order-line"
                  >
                    商品标题：{{ extractProductTitle(item.content) }}
                  </div>
                </template>
                <template v-else>
                  {{ item.content }}
                </template>
              </div>
              <div class="message-time">{{ formatTime(item.time) }}</div>
            </div>
          </transition-group>
        </el-scrollbar>
      </div>
    </div>

    <!-- 私信聊天抽屉 -->
    <el-drawer
      v-model="chatVisible"
      title="私信聊天"
      direction="rtl"
      size="30%"
    >
      <div class="chat-body">
        <el-empty v-if="!chatPeerId" description="请选择一条私信开始聊天" />
        <template v-else>
          <div class="chat-messages">
            <div
              v-for="msg in chatMessages"
              :key="msg.messageid"
              class="chat-row"
              :class="{
                sent: Number(msg.senderid) === currentUserNumeric,
                received: Number(msg.senderid) !== currentUserNumeric,
              }"
            >
              <div class="bubble">
                <div class="bubble-content">{{ msg.content }}</div>
                <div class="bubble-time">
                  {{
                    formatTime(
                      msg.sendtime ? new Date(msg.sendtime) : new Date()
                    )
                  }}
                </div>
              </div>
            </div>
          </div>
          <div class="chat-input-bar">
            <el-input
              v-model="chatInput"
              type="textarea"
              :rows="3"
              placeholder="输入消息..."
              resize="none"
            />
            <div class="chat-actions">
              <el-button
                type="primary"
                :icon="Promotion"
                :disabled="!chatInput.trim()"
                @click="sendChatMessage"
              >
                发送
              </el-button>
            </div>
          </div>
        </template>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import {
  getMessages,
  getMessagesBetween,
  createMessage,
  updateMessageRead,
} from "@/apis";
import { completeOrder } from "@/apis";
import type { Message as Msg } from "@/types";
import {
  ElPageHeader,
  ElIcon,
  ElBadge,
  ElScrollbar,
  ElButton,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElEmpty,
  ElTag,
  ElMessage,
  ElMessageBox,
  ElDrawer,
  ElInput,
} from "element-plus";
import {
  ChatDotRound,
  Refresh,
  More,
  Promotion,
} from "@element-plus/icons-vue";

// 路由与用户
const router = useRouter();
const userStore = useUserStore();
const currentUserId = computed(() => String(userStore.userInfo.userid || ""));
const currentUserNumeric = computed(() =>
  Number(userStore.userInfo.userid || 0)
);

// 过滤类型：全部/系统/私信
const filterType = ref<"all" | "system" | "private">("all");

// 统一消息类型（前端展示用）
interface UnifiedMessage {
  key: string;
  id: string; // 保持后端 messageid 原始字符串，避免 NaN 匹配问题
  type: "system" | "private";
  title?: string;
  content: string;
  time: Date;
  read: boolean;
  senderId?: number;
  recipientId?: number;
}

// 实际消息列表
const systemMessages = ref<Msg[]>([]);
const privateMessages = ref<Msg[]>([]);

// 本地伪造的系统消息（用于无返回数据时展示）
const fakeSystemMessages = computed<Msg[]>(() => {
  const uid = currentUserId.value || "0";
  const now = new Date();
  const mk = (offsetMin: number, title: string, content: string): Msg => ({
    messageid: `fake-sys-${offsetMin}`,
    senderid: "0",
    receiverid: uid,
    type: "system",
    content,
    title,
    isread: false,
    sendtime: new Date(now.getTime() - offsetMin * 60000).toISOString(),
    conversationid: null,
  });
  return [
    mk(5, "系统维护通知", "今晚 2:00-4:00 维护，期间无法访问，请提前安排。"),
    mk(60 * 3, "安全提醒", "检测到新的登录位置，如非本人操作请尽快修改密码。"),
    mk(60 * 24, "新品上线", "二手数码专区已上线，欢迎选购。"),
  ];
});

// 未读数量汇总
const unreadTotalCount = computed(() => {
  const sys = systemMessages.value.filter((m) => !m.isread).length;
  const pri = privateMessages.value.filter(
    (m) => m.receiverid === currentUserId.value && !m.isread
  ).length;
  return sys + pri;
});

// 合并与排序
const mergedMessages = computed<UnifiedMessage[]>(() => {
  const sys = systemMessages.value.map<UnifiedMessage>((m) => ({
    key: `system-${m.messageid}`,
    id: String(m.messageid),
    type: "system",
    title: m.title || "",
    content: m.content,
    time: m.sendtime ? new Date(m.sendtime) : new Date(),
    read: Boolean(m.isread),
  }));
  const pri = privateMessages.value.map<UnifiedMessage>((m) => ({
    key: `private-${m.messageid}`,
    id: String(m.messageid),
    type: "private",
    content: m.content,
    time: m.sendtime ? new Date(m.sendtime) : new Date(),
    read: Boolean(m.isread),
    senderId: Number(m.senderid),
    recipientId: Number(m.receiverid),
  }));
  return [...sys, ...pri].sort((a, b) => b.time.getTime() - a.time.getTime());
});

const displayMessages = computed(() => {
  if (filterType.value === "all") return mergedMessages.value;
  return mergedMessages.value.filter((m) => m.type === filterType.value);
});

// 方法
const goBack = () => {
  router.go(-1);
};

const getContactName = (id?: number) => {
  if (!id) return "未知用户";
  return `用户${id}`;
};

// 从消息内容中提取订单号（约定格式 ORDER_ID:<id>）
const extractOrderId = (content: string): string | null => {
  const match = content.match(/ORDER_ID:([\w-]+)/i);
  return match && match[1] ? match[1] : null;
};

// 从消息内容中提取商品标题（格式形如 “商品: xxx” 或 “商品：xxx”）
const extractProductTitle = (content: string): string | null => {
  const match = content.match(/商品[:：]\s*([^，,]+)/);
  return match && match[1] ? match[1].trim() : null;
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;

  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
};

const fetchAllMessages = async () => {
  const uid = currentUserId.value;
  if (!uid) return;
  try {
    const res = await getMessages(uid);
    const payload = (res as any)?.data?.data ?? (res as any)?.data ?? [];
    const list = payload as Msg[];
    const sysType = (t: string | undefined | null) =>
      (t || "").toLowerCase() === "system";
    const priType = (t: string | undefined | null) => {
      const val = (t || "").toLowerCase();
      return val === "private" || val === "chat";
    };
    const realSys = list.filter((m) => sysType(m.type));
    systemMessages.value = realSys.length ? realSys : fakeSystemMessages.value;
    privateMessages.value = list.filter((m) => priType(m.type));
  } catch (e) {
    ElMessage.error("获取消息失败");
    console.error(e);
  }
};

const refreshAllMessages = async () => {
  await fetchAllMessages();
  ElMessage.success("消息已刷新");
};

const markAsRead = async (id: string, opts?: { silent?: boolean }) => {
  const msg = systemMessages.value.find((m) => String(m.messageid) === id);
  if (msg) {
    const mid = String(msg.messageid);
    if (!mid.startsWith("fake-sys-")) {
      await updateMessageRead(mid);
    }
    msg.isread = true;
    if (!opts?.silent) {
      ElMessage.success("消息已标记为已读");
    }
  }
};

const markPrivateAsRead = async (id: string) => {
  const msg = privateMessages.value.find((m) => String(m.messageid) === id);
  if (msg && msg.receiverid === currentUserId.value) {
    await updateMessageRead(String(msg.messageid));
    msg.isread = true;
    ElMessage.success("私信已标记为已读");
  }
};

const handleUnifiedAction = (
  command: { action: string },
  item: UnifiedMessage
) => {
  if (command.action === "mark") {
    if (item.type === "system") markAsRead(item.id);
    if (item.type === "private") markPrivateAsRead(item.id);
  } else if (command.action === "delete") {
    if (item.type === "system") deleteSystemMessage(item.id);
    if (item.type === "private") deletePrivateMessage(item.id);
  }
};

// 卖家确认完成订单
const completeOrderFromMessage = async (item: UnifiedMessage) => {
  if (item.type !== "system") return;
  const oid = extractOrderId(item.content);
  if (!oid) return ElMessage.warning("未找到订单号");
  try {
    await completeOrder(String(oid));
    // 完成后标记消息已读并刷新（静默避免重复提示）
    await markAsRead(item.id, { silent: true });
    await fetchAllMessages();
    ElMessage.success("订单已确认完成");
  } catch (e) {
    ElMessage.error("确认订单失败");
    console.error(e);
  }
};

const deleteSystemMessage = (id: string) => {
  ElMessageBox.confirm("确定要删除这条消息吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      systemMessages.value = systemMessages.value.filter(
        (msg) => String(msg.messageid) !== String(id)
      );
      ElMessage.success("删除成功");
    })
    .catch(() => {
      // 用户取消删除
    });
};

const deletePrivateMessage = (id: string) => {
  ElMessageBox.confirm("确定要删除这条私信吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      privateMessages.value = privateMessages.value.filter(
        (msg) => String(msg.messageid) !== String(id)
      );
      ElMessage.success("删除成功");
    })
    .catch(() => {
      // 用户取消删除
    });
};

// 聊天抽屉
const chatVisible = ref(false);
const chatPeerId = ref<number | null>(null);
const chatMessages = ref<Msg[]>([]);
const chatInput = ref("");

const openChatForItem = async (item: UnifiedMessage) => {
  if (item.type !== "private") return;
  const uid = Number(currentUserId.value);
  const peerId = item.senderId === uid ? item.recipientId : item.senderId;
  chatPeerId.value = peerId || null;
  chatVisible.value = true;
  await loadChat();
};

const loadChat = async () => {
  const uid = currentUserId.value;
  const pid = chatPeerId.value;
  if (!uid || !pid) return;
  try {
    const res = await getMessagesBetween(uid, String(pid));
    const payload = (res as any)?.data?.data ?? (res as any)?.data ?? [];
    chatMessages.value = payload as Msg[];
    // 将未读的私信标记为已读
    const unreadIds = chatMessages.value
      .filter((m) => m.receiverid === uid && !m.isread)
      .map((m) => String(m.messageid));
    if (unreadIds.length) {
      await Promise.all(unreadIds.map((mid) => updateMessageRead(mid)));
      chatMessages.value.forEach((m) => {
        if (unreadIds.includes(String(m.messageid))) m.isread = true;
      });
      await fetchAllMessages();
    }
  } catch (e) {
    ElMessage.error("获取聊天记录失败");
    console.error(e);
  }
};

const sendChatMessage = async () => {
  const uid = currentUserId.value;
  const pid = chatPeerId.value;
  const content = chatInput.value.trim();
  if (!uid || !pid || !content) return;
  try {
    await createMessage(uid, {
      receiverid: String(pid),
      type: "CHAT",
      content,
    });
    chatInput.value = "";
    await loadChat();
    await fetchAllMessages();
    ElMessage.success("消息发送成功");
  } catch (e) {
    ElMessage.error("消息发送失败");
    console.error(e);
  }
};

onMounted(() => {
  fetchAllMessages();
});
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

.badge {
  margin-left: 10px;
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

.chat-body {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px 0;
  overflow-y: auto;
}

.chat-row {
  display: flex;
}

.chat-row.sent {
  justify-content: flex-end;
}

.bubble {
  max-width: 80%;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
}

.chat-row.sent .bubble {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
}

.bubble-content {
  line-height: 1.5;
  word-wrap: break-word;
}

.bubble-time {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
  text-align: right;
}

.chat-row.sent .bubble-time {
  color: rgba(255, 255, 255, 0.8);
}

.chat-input-bar {
  margin-top: 10px;
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-actions {
  display: flex;
  justify-content: flex-end;
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

@media (max-width: 768px) {
  .message-page {
    padding: 10px;
  }
}
</style>
