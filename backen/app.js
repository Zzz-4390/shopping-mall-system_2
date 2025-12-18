// 1. 引入要使用到的模块
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

// 引入自己写的路由模块
const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const productRouter = require('./routes/product')
const cartRouter = require('./routes/cart')
const ordersRouter = require('./routes/orders')
const messageRouter = require('./routes/message')
// 2. 创建express应用实例  就好比vue的new Vue()
const app = express()

// 3. 配置express应用实例
app.use(logger('dev'))

// 添加 CORS 支持
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next()
})

// 2. 关键中间件：解析 POST 请求的 JSON 数据
// 作用：让后端能读取前端通过 POST 发送的 JSON 格式参数（必须加！）
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

//配置路由
// 在app.js中配置某类数据的统一的前缀
app.use('/', indexRouter)
app.use('/user', usersRouter)
app.use('/cart', cartRouter)
app.use('/product', productRouter)
app.use('/orders', ordersRouter)
app.use('/message', messageRouter)

module.exports = app
