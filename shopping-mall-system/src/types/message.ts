/**
 * 发送消息请求体（POST /message/:senderid/create）
 */
export type CreateMessageRequest = {
  receiverid: string
  type: string
  content: string
  title?: string
}

/**
 * 查询用户消息参数（路径参数）
 */
export type GetMessagesParams = {
  receiverid: string
}

/**
 * 查询两个用户之间聊天的路径参数
 */
export type GetMessagesBetweenParams = {
  senderid: string
  receiverid: string
}

/**
 * 更新消息已读的路径参数
 */
export type UpdateMessageReadParams = {
  messageid: string
}

/**
 * message 表的基本类型
 */
export type Message = {
  messageid: string
  senderid: string
  receiverid: string
  type: string
  content: string
  title?: string | null
  isread?: boolean
  sendtime?: string
  conversationid?: string | null
}
