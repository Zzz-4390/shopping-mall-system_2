import request from '@/utils/request'
import type { CreateMessageRequest, Message, ApiResult } from '@/types'

const baseURL = '/message'

// 发送消息：POST /message/add/:senderid
export const createMessage = (
  senderid: string,
  body: CreateMessageRequest,
): Promise<ApiResult<Message>> => request.post(`${baseURL}/add/${senderid}`, body)

// 查询用户所有消息：GET /message/getall/:receiverid
export const getMessages = (receiverid: string): Promise<ApiResult<Message[]>> =>
  request.get(`${baseURL}/getall/${receiverid}`)

// 查询用户之间的聊天记录：GET /message/getchat/:senderid/:receiverid
export const getMessagesBetween = (
  senderid: string,
  receiverid: string,
): Promise<ApiResult<Message[]>> => request.get(`${baseURL}/getchat/${senderid}/${receiverid}`)

// 更新消息已读：PUT /message/read/:messageid
export const updateMessageRead = (messageid: string): Promise<ApiResult<Message>> =>
  request.put(`${baseURL}/read/${messageid}`)

export default { createMessage, getMessages, getMessagesBetween, updateMessageRead }
