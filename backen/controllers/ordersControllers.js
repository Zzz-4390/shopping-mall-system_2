const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient() // 必须实例化！
const { v4: uuidv4 } = require('uuid')

// 增 删（订单记录始终保存，不删，除非说是管理员要删） 改 查

// 1.创建订单
// 注意：商品状态由数据库触发器 trg_orders_after_insert 自动更新为 PENDING_SALE
exports.createOrder = async (req, res) => {
    try {
        const { buyerid } = req.params
        const { sellerid, productid } = req.body

        // 只需创建订单，商品状态由触发器自动更新
        const orderid = uuidv4()
        const now = new Date()
        await prisma.$executeRaw`
            INSERT INTO orders (orderid, buyerid, sellerid, productid, createtime, isdone)
            VALUES (${orderid}, ${buyerid}, ${sellerid}, ${productid}, ${now}, false)
        `

        // 查询插入的订单数据
        const createdOrder = await prisma.$queryRaw`
            SELECT orderid, buyerid, sellerid, productid, createtime, finishtime, isdone
            FROM orders WHERE orderid = ${orderid}
        `

        res.status(200).json({
            code: 200,
            message: '创建订单成功（商品状态由触发器自动更新）',
            data: createdOrder[0]
        })
    } catch (err) {
        console.error('创建订单失败:', err)
        res.status(500).json({
            code: 500,
            message: '创建订单失败',
            error: err.message
        })
    }
}

//2.完成（更新订单状态为isdone）订单    这一api当售卖者确认订单的时候调用
// 注意：商品状态由数据库触发器 trg_orders_after_update 自动更新为 SOLD
exports.completeOrder = async (req, res) => {
    try {
        const { orderid } = req.params

        // 根据订单号查询到商品id
        const order = await prisma.$queryRaw`
            SELECT orderid FROM orders WHERE orderid = ${orderid}
        `
        if (!order || order.length === 0) throw new Error('订单不存在')

        // 只需更新订单状态，商品状态由触发器自动更新
        const now = new Date()
        await prisma.$executeRaw`
            UPDATE orders
            SET isdone = true, finishtime = ${now}
            WHERE orderid = ${orderid}
        `

        // 查询更新后的订单
        const updatedOrder = await prisma.$queryRaw`
            SELECT orderid, buyerid, sellerid, productid, createtime, finishtime, isdone
            FROM orders WHERE orderid = ${orderid}
        `

        res.status(200).json({
            code: 200,
            message: '完成订单成功（商品状态由触发器自动更新）',
            data: updatedOrder[0]
        })
    } catch (err) {
        console.error('完成订单失败:', err)
        res.status(500).json({
            code: 500,
            message: '完成订单失败',
            error: err.message
        })
    }
}

// 3.查询订单信息   肯定是查询某个用户的订单了
// 使用视图 vw_user_order_detail 简化查询，包含商品、买家、卖家信息
exports.getOrderInfo = async (req, res) => {
    try {
        const { userid } = req.params
        // 使用原生 SQL 查询视图，获取订单详情（包含商品、买卖双方名称）
        const orderlist = await prisma.$queryRaw`
            SELECT * FROM vw_user_order_detail
            WHERE buyerid = ${userid} OR sellerid = ${userid}
            ORDER BY createtime DESC
        `
        res.status(200).json({
            code: 200,
            message: '查询订单成功',
            // 返回一个订单列表
            data: orderlist
        })
    } catch (err) {
        console.error('查询订单失败:', err)
        res.status(500).json({
            code: 500,
            message: '查询订单失败',
            error: err.message
        })
    }
}
