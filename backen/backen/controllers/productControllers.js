// 控制器：： 处理请求 + 调用 Prisma  

//导入prisma客户端
const { PrismaClient } = require('../generated/prisma/client');
const prisma = new PrismaClient(); // 必须实例化！
const {PRODUCT_STATUS}=require('../utils/constants');
const{v4:uuidv4}=require('uuid');
exports.createProduct = async (req,res)=>{
    try{
        // 1. 从前端请求体中获取商品数据（整个对象）
        const{productid,sellerid,title,content,price,photo,status,publishtime,category}=req.body;

        //2.验证必填字段
        if( !sellerid || !title || !content || !price || !category){
            return res.status(400).json({   //有问题就直接返回，用res 传递状态码和信息 
                code:400,
                message:'缺少必填字段'
            })
        }

        //3.处理商品图片（若前端传递 base64 格式，需转成 Buffer）

        //4. 调用 Prisma 创建商品（publishtime 由数据库默认生成，无需手动传递）
        const newProduct = await prisma.product.create({
            data:{
                productid:uuidv4(),
                sellerid,
                title,
                content,
                price,
                photo,
                status:PRODUCT_STATUS.ON_SALE,
                category,
            }
        });

        //5. 返回创建成功的商品信息
        res.status(200).json({
            code:200,
            message:'商品创建成功',
            data:newProduct
        });
    }catch(err){
        console.error('商品创建失败:',err);
        res.status(500).json({
            code:500,
            message:'商品创建失败',
            error:err.message
        })
    }
}

exports.getAllProduct =async (req,res)=>{
    try{
        const allProduct =await prisma.product.findMany();
        res.status(200).json({
            code:200,
            message:'获取所有商品成功',
            data:allProduct
        })
    }
    catch(err){
        console.error('获取所有商品失败:',err);
        res.status(500).json({
            code:500,
            message:'获取所有商品失败',
            error:err.message
        })  
    }
}

exports.deleteProduct = async (req, res) => {
    try {
        const { productid } = req.params;

        // 验证商品是否存在
        const existingProduct = await prisma.product.findUnique({
            where: { productid }
        });
        if (!existingProduct) {
            return res.status(404).json({
                code: 404,
                message: '商品不存在'
            });
        }

        // 使用事务删除：先删除关联的购物车项，再删除商品
        // 注意：订单记录通常保留（不删除），仅删除购物车关联
        await prisma.$transaction([
            // 1. 删除该商品在所有购物车中的记录
            prisma.cartitem.deleteMany({
                where: { productid }
            }),
            // 2. 删除商品本身
            prisma.product.delete({
                where: { productid }
            })
        ]);

        res.status(200).json({
            code: 200,
            message: '删除商品成功',
            data: { productid }
        });
    } catch (err) {
        console.error('删除商品失败:', err);
        res.status(500).json({
            code: 500,
            message: '删除商品失败',
            error: err.message
        });
    }
}

// 根据商品ID查询单个商品
exports.getProductById = async (req, res) => {
    try {
        const { productid } = req.params;

        const product = await prisma.product.findUnique({
            where: { productid },
            include: {
                users: {
                    select: {
                        userid: true,
                        name: true,
                        photo: true
                    }
                }
            }
        });

        if (!product) {
            return res.status(404).json({
                code: 404,
                message: '商品不存在'
            });
        }

        res.status(200).json({
            code: 200,
            message: '获取商品详情成功',
            data: product
        });
    } catch (err) {
        console.error('获取商品详情失败:', err);
        res.status(500).json({
            code: 500,
            message: '获取商品详情失败',
            error: err.message
        });
    }
}

// 根据卖家ID查询商品列表（我的发布）
exports.getProductBySeller = async (req, res) => {
    try {
        const { sellerid } = req.params;

        const products = await prisma.product.findMany({
            where: { sellerid },
            orderBy: {
                publishtime: 'desc'
            }
        });

        res.status(200).json({
            code: 200,
            message: '获取卖家商品列表成功',
            data: products
        });
    } catch (err) {
        console.error('获取卖家商品列表失败:', err);
        res.status(500).json({
            code: 500,
            message: '获取卖家商品列表失败',
            error: err.message
        });
    }
}

// 根据分类查询商品列表
exports.getProductByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        const products = await prisma.product.findMany({
            where: { 
                category,
                status: 'ON_SALE' // 只返回在售商品
            },
            orderBy: {
                publishtime: 'desc'
            }
        });

        res.status(200).json({
            code: 200,
            message: '获取分类商品列表成功',
            data: products
        });
    } catch (err) {
        console.error('获取分类商品列表失败:', err);
        res.status(500).json({
            code: 500,
            message: '获取分类商品列表失败',
            error: err.message
        });
    }
}

exports.updateProduct =async(req,res)=>{
    try{
        const{price,status}=req.body;
        const{productid}=req.params;
        
        // 验证productid必填
        if(!productid){
            return res.status(400).json({
                code:400,
                message:'缺少商品ID'
            })
        }
        
        // 至少要有一个更新字段
        if(price === undefined && status === undefined){
            return res.status(400).json({
                code:400,
                message:'缺少更新字段'
            })
        }
        
        // 构建更新数据对象，只包含传入的字段
        const updateData = {};
        if(price !== undefined) updateData.price = price;
        if(status !== undefined) updateData.status = status;
        
        // 调用 Prisma 更新商品
        const updateProduct =await prisma.product.update({
            where:{productid},
            data: updateData
        });
        
        res.status(200).json({
            code:200,
            message:'更新商品成功',
            data:updateProduct
        });

    }catch(err){
        console.error('更新商品失败:',err);
        res.status(500).json({
            code:500,
            message:'更新商品失败',
            error:err.message
        })
    }
}

