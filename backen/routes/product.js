const express = require('express')
const router = express.Router()
const productControllers = require('../controllers/productControllers')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

// 保存到前端 public/uploads 目录，便于前端直接访问
const uploadsDir = path.resolve(__dirname, '../../shopping-mall-system/public/uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname) || ''
        cb(null, `${uuidv4()}${ext}`)
    }
})

const upload = multer({ storage })

//在这里配置特性的后缀
// 接收 multipart/form-data，可包含单个 file 字段
router.post('/add', upload.single('file'), productControllers.createProduct)

//这里 两重选择，先选方法，再选后缀  确定调用哪个方法
// 这里使用全量查询，后期改成分页查询...
router.get('/getAll', productControllers.getAllProduct)

// 这里就需要在路径中添加productid， 在axios中我也不会传递整个对象，只传递这一个字段
// 那就不删除商品呗，就是一直保留着，根据商品的状态确定购物车里商品的展示
router.delete('/delete/:productid', productControllers.deleteProduct)

// 这里还是添加productid， status 和price在body中提取
router.put('/update/:productid', productControllers.updateProduct)

// 根据商品ID获取单个商品详情
router.get('/get/:productid', productControllers.getProductById)

// 根据卖家ID获取商品列表（我的发布）
router.get('/seller/:sellerid', productControllers.getProductBySeller)

// 根据分类获取商品列表
router.get('/category/:category', productControllers.getProductByCategory)


module.exports = router