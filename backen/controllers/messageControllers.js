const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { MESSAGE_TYPE } = require('../utils/constants')
const { v4: uuidv4 } = require('uuid')

// 1.新增信息
exports.createMessage = async (req, res) => {
    try {
        const { senderid } = req.params
        const { receiverid, type, content, title } = req.body

        const messageid = uuidv4()
        const now = new Date()
        let conversationid = null

        // 检查type的内容决定是否声明conversationid属性，这一属性在后边浏览用户间信息要使用到
        // 不是chat类型的消息就不需要用到conversationid
        if (type === MESSAGE_TYPE.CHAT) {
            console.log('creating chat message')
            // 检查用户之间是否存在历史聊天记录
            // 合并查询：同时检查正向和反向的历史消息
            const existingMessage = await prisma.$queryRaw`
                SELECT conversationid FROM message
                WHERE (senderid = ${senderid} AND receiverid = ${receiverid})
                   OR (senderid = ${receiverid} AND receiverid = ${senderid})
                LIMIT 1
            `

            if (existingMessage && existingMessage.length > 0 && existingMessage[0].conversationid) {
                // 若存在历史消息，直接复用其conversationid
                conversationid = existingMessage[0].conversationid
            } else {
                // 首次对话，生成新的conversationid
                conversationid = uuidv4()
            }
        } else {
            // 创建order和system消息，保留原始发送者（买家）
            // 给 ORDER/SYSTEM 消息也生成 conversationid（数据库必填）
            conversationid = uuidv4()
        }

        // 插入消息
        await prisma.$executeRaw`
            INSERT INTO message (messageid, senderid, receiverid, type, content, title, sendtime, isread, conversationid)
            VALUES (${messageid}, ${senderid}, ${receiverid}, ${type}, ${content}, ${title}, ${now}, false, ${conversationid})
        `

        // 查询插入的消息
        const newMessage = await prisma.$queryRaw`
            SELECT messageid, senderid, receiverid, type, content, title, sendtime, isread, conversationid
            FROM message WHERE messageid = ${messageid}
        `

        // 发送成功响应
        res.status(200).json({
            code: 200,
            message: '消息创建成功',
            data: newMessage[0]
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
        const messagelist = await prisma.$queryRaw`
            SELECT messageid, senderid, receiverid, type, content, title, sendtime, isread, conversationid
            FROM message
            WHERE receiverid = ${receiverid}
            ORDER BY sendtime ASC
        `
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

        // 按照 两个id先找到conversationid
        const conversation = await prisma.$queryRaw`
            SELECT conversationid FROM message
            WHERE (senderid = ${senderid} AND receiverid = ${receiverid})
               OR (senderid = ${receiverid} AND receiverid = ${senderid})
            LIMIT 1
        `
        console.log(senderid, receiverid)
        console.log(conversation)

        // 没有聊天记录就没有呗，前端就是展示空数组
        if (!conversation || conversation.length === 0) {
            return res.status(404).json({
                code: 404,
                message: '用户之间不存在聊天记录',
                data: []
            })
        } else {
            const messagelist = await prisma.$queryRaw`
                SELECT messageid, senderid, receiverid, type, content, title, sendtime, isread, conversationid
                FROM message
                WHERE conversationid = ${conversation[0].conversationid}
                ORDER BY sendtime ASC
            `
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

        await prisma.$executeRaw`
            UPDATE message SET isread = true WHERE messageid = ${messageid}
        `

        // 查询更新后的消息
        const updatedMessage = await prisma.$queryRaw`
            SELECT messageid, senderid, receiverid, type, content, title, sendtime, isread, conversationid
            FROM message WHERE messageid = ${messageid}
        `

        res.status(200).json({
            code: 200,
            message: '消息已标记为已读',
            data: updatedMessage[0]
        })
    } catch (err) {
        res.status(500).json({
            code: 500,
            message: '更新消息状态失败',
            error: err.message
        })
    }
}

