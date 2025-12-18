const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { MESSAGE_TYPE } = require('../utils/constants')
const { v4: uuidv4 } = require('uuid')

// 1.新增信息
exports.createMessage = async (req, res) => {
    try {
        const { senderid } = req.params
        const { receiverid, type, content, title } = req.body

        // 后边要更改引用内容的，所以不能是const
        const messageData = {
            messageid: uuidv4(),
            senderid,
            receiverid,
            type,
            content,
            title,
            sendtime: new Date(),
            isread: false
        }
        let newMessage

        // 检查type的内容决定是否声明conversationid属性，这一属性在后边浏览用户间信息要使用到
        // 不是chat类型的消息就不需要用到conversationid
        if (type === MESSAGE_TYPE.CHAT) {
            console.log('creating chat message')
            let conversationid = null
            // 检查用户之间是否存在历史聊天记录
            // 合并查询：同时检查正向和反向的历史消息
            const existingMessage = await prisma.message.findFirst({
                where: {
                    OR: [
                        { senderid, receiverid },  // 正向：sender→receiver
                        { senderid: receiverid, receiverid: senderid }  // 反向：receiver→sender
                    ]
                }
            })
            if (existingMessage && existingMessage.conversationid != null) {
                // 若存在历史消息，直接复用其conversationid
                conversationid = existingMessage.conversationid
            } else {
                // 首次对话，生成新的conversationid
                conversationid = uuidv4()
            }
            //动态添加conversationid属性
            messageData.conversationid = conversationid
            newMessage = await prisma.message.create({
                data: messageData
            })
        } else {
            // 创建order和system消息，保留原始发送者（买家）
            // 给 ORDER/SYSTEM 消息也生成 conversationid（数据库必填）
            messageData.conversationid = uuidv4()
            newMessage = await prisma.message.create({
                data: messageData
            })
        }
        // 问题，为什么不是chat类型的消息，压根就不能有conversationid呢   null也不行

        // 发送成功响应
        res.status(200).json({
            code: 200,
            message: '消息创建成功',
            data: newMessage
        })
    } catch (err) {
        res.status(500).json({
            code: 500,
            message: '创建消息失败',
            error: err.message
        })
    }
}

// 2.查询用户消息
exports.getMessages = async (req, res) => {
    try {
        const { receiverid } = req.params
        const messagelist = await prisma.message.findMany({
            where: {
                receiverid
            },
            orderBy: {
                // 按发送时间升序排列
                sendtime: 'asc'
            }
        })
        res.status(200).json({
            code: 200,
            message: '查询用户消息成功',
            data: messagelist
        })
    } catch (err) {
        res.status(500).json({
            code: 500,
            message: '查询用户消息失败',
            error: err.message
        })
    }
}

// 3.查询用户之间的消息chat
exports.getMessagesBetweenUsers = async (req, res) => {
    try {
        const { senderid, receiverid } = req.params

        // 按照 两个id先找到conversationid，
        const conversation = await prisma.message.findFirst({
            where: {
                OR: [
                    { senderid, receiverid },  // 正向：sender→receiver
                    { senderid: receiverid, receiverid: senderid }  // 反向：receiver→sender
                ]
            }
        })
        console.log(senderid, receiverid)
        console.log(conversation)
        // 没有聊天记录就没有呗，前端就是展示空数组
        if (!conversation) {
            return res.status(404).json({
                code: 404,
                message: '用户之间不存在聊天记录',
                data: []
            })
        } else {
            const messagelist = await prisma.message.findMany({
                where: { conversationid: conversation.conversationid },
                orderBy: {
                    // 按发送时间升序排列
                    sendtime: 'asc'
                }
            })
            res.status(200).json({
                code: 200,
                message: '查询用户之间的消息成功',
                data: messagelist
            })
        }

    } catch (err) {
        res.status(500).json({
            code: 500,
            message: '查询用户之间的消息失败',
            error: err.message
        })
    }
}

// 4.更新消息已读状态
exports.updateMessageRead = async (req, res) => {
    try {
        const { messageid } = req.params

        const updatedMessage = await prisma.message.update({
            where: { messageid },
            data: { isread: true }
        })

        res.status(200).json({
            code: 200,
            message: '消息已标记为已读',
            data: updatedMessage
        })
    } catch (err) {
        res.status(500).json({
            code: 500,
            message: '更新消息状态失败',
            error: err.message
        })
    }
}

