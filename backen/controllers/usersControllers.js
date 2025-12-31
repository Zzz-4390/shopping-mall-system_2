//导入prisma客户端
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient() // 必须实例化！

const { v4: uuidv4 } = require('uuid')

//新增（注册）用户
// 注意：购物车由数据库触发器 trg_users_after_insert 自动创建，无需手动创建
exports.registUser = async (req, res) => {
    try {
        const { phone, password } = req.body

        // 信息校验，这个是写在前端还是后端呢，
        // 前端校验可以提供更好的用户体验，但也需要后端校验来确保数据的完整性和安全性。
        if (!phone || !password) {
            return res.status(400).json({
                code: 400,
                message: '缺少必填字段'
            })
        };
        // 检查账号是否已存在
        const isExist = await prisma.$queryRaw`
            SELECT userid FROM users WHERE phone = ${phone}
        `
        if (isExist && isExist.length > 0) {
            return res.status(400).json({
                code: 400,
                message: '账号已存在'
            })
        };

        // 只需创建用户，购物车由数据库触发器自动创建
        const newuserid = uuidv4()
        const now = new Date()
        await prisma.$executeRaw`
            INSERT INTO users (userid, phone, password, name, registertime)
            VALUES (${newuserid}, ${phone}, ${password}, ${phone.slice(-4)}, ${now})
        `

        // 查询插入的用户数据
        const newUser = await prisma.$queryRaw`
            SELECT userid, phone, password, name, photo, registertime
            FROM users WHERE userid = ${newuserid}
        `

        res.status(200).json({
            code: 200,
            message: '新增用户成功（购物车由触发器自动创建）',
            data: newUser[0]
        })
    } catch (err) {
        console.error('新增用户失败:', err)
        res.status(500).json({
            code: 500,
            message: '新增用户失败',
            error: err.message
        })
    }
}

//查询用户
exports.getuser = async (req, res) => {
    try {
        const { userid } = req.params
        if (!userid) {
            return res.status(400).json({
                code: 400,
                message: '缺少必填字段'
            })
        }

        const user = await prisma.$queryRaw`
            SELECT userid, phone, password, name, photo, registertime
            FROM users WHERE userid = ${userid}
        `
        if (user.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '用户不存在'
            })
        }

        // 查询用户的购物车信息
        const cart = await prisma.$queryRaw`
            SELECT cartid, cartuserid
            FROM cart
            WHERE cartuserid = ${userid}
        `

        res.status(200).json({
            code: 200,
            message: '查询用户成功',
            data: [{
                ...user[0],
                cart: cart || []
            }]
        })

    } catch (err) {
        console.error('查询用户失败:', err)
        res.status(500).json({
            code: 500,
            message: '查询用户失败',
            error: err.message
        })
    }
}

//更新用户信息  photo name password
exports.updateUser = async (req, res) => {
    try {
        // 通过params获取userid，通过body获取要更新的信息
        const { userid } = req.params
        const { photo, name, password, oldPassword } = req.body

        // 查询用户是否存在
        const userCheck = await prisma.$queryRaw`
            SELECT userid, password FROM users WHERE userid = ${userid}
        `
        if (!userCheck || userCheck.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '用户不存在'
            })
        };

        // 如果要更新密码，需要验证旧密码
        if (password && oldPassword) {
            if (userCheck[0].password !== oldPassword) {
                return res.status(400).json({
                    code: 400,
                    message: '当前密码错误'
                })
            }
        }

        // 使用参数化查询进行更新
        const updateData = {}
        if (photo !== undefined) updateData.photo = photo || null
        if (name !== undefined) updateData.name = name
        if (password !== undefined) updateData.password = password

        if (Object.keys(updateData).length > 0) {
            await prisma.users.update({
                where: { userid: userid },
                data: updateData
            })
        }

        // 查询更新后的用户
        const updateUser = await prisma.$queryRaw`
            SELECT userid, phone, password, name, photo, registertime
            FROM users WHERE userid = ${userid}
        `

        res.status(200).json({
            code: 200,
            message: '更新用户成功',
            data: updateUser[0]
        })

    } catch (err) {
        console.error('更新用户失败:', err)
        res.status(500).json({
            code: 500,
            message: '更新用户失败',
            error: err.message
        })
    }
}

//登录接口
exports.loginUser = async (req, res) => {
    try {
        // 就使用post请求吧，用body传递账号密码
        const { phone, password } = req.body
        if (!phone || !password) {
            return res.status(400).json({
                code: 400,
                message: '缺少必填字段'
            })
        };

        // 查询用户信息
        const user = await prisma.$queryRaw`
            SELECT u.userid, u.phone, u.password, u.name, u.photo, u.registertime
            FROM users u
            WHERE u.phone = ${phone}
       `

        // 先判断账号是否存在
        if (!user || user.length === 0) {
            return res.status(400).json({
                code: 400,
                message: '账号不存在'
            })
        }

        // 再判断密码是否正确
        if (user[0].password !== password) {
            return res.status(400).json({
                code: 400,
                message: '密码错误'
            })
        }

        // 查询用户的购物车信息
        const cart = await prisma.$queryRaw`
            SELECT cartid, cartuserid
            FROM cart
            WHERE cartuserid = ${user[0].userid}
        `

        //都没问题了，返回登录成功信息
        console.log('登录成功')
        res.status(200).json({
            code: 200,
            message: '登录成功',
            data: {
                ...user[0],
                cart: cart || []
            }
        })
    } catch (err) {
        console.error('登录失败:', err.message)
        res.status(500).json({
            code: 500,
            message: '登录失败',
            error: err.message
        })
    }
}