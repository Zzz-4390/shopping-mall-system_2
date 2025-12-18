//导入prisma客户端
const { PrismaClient } = require('../generated/prisma/client');
const prisma = new PrismaClient(); // 必须实例化！
const{v4:uuidv4}=require('uuid');

// 1.添加购物车项   --如果商品已存在，就不允许再添加
exports.addCartItem=async(req,res)=>{
    try{
        const {cartid}=req.params;
        const {productid}=req.body;
        // 使用 findFirst 查询组合条件，findUnique 只能用唯一字段
        const isExist = await prisma.cartitem.findFirst({
            where: { cartid, productid }
        });
        if(isExist){
            return res.status(400).json({
                code:400,
                message:'该商品已存在于购物车'
            })
        };

        const newCartItem=await prisma.cartitem.create({
            data:{
                cartitemid:uuidv4(),
                cartid,
                productid,
                entertime:new Date()
            }
        });

        res.status(200).json({
            code:200,
            message:'添加购物车项成功',
            data:newCartItem
        });
    }catch(err){
        console.error('添加购物车项失败:',err);
        res.status(500).json({
            code:500,
            message:'添加购物车项失败',
            error:err.message
        })
    }
}

// 2.删除购物车项
exports.deleteCartItem=async(req,res)=>{
    try{
        const{cartitemid}=req.params;
        await prisma.cartitem.delete({
            where:{cartitemid}
        });
        res.status(200).json({
            code:200,
            message:'删除购物车项成功',
            data:cartitemid
        });
    }catch(err){
        console.error('删除购物车项失败:',err);
        res.status(500).json({
            code:500,
            message:'删除购物车项失败',
            error:err.message
        });
    }

}

// 查询购物车项   这里注意返回的是一个商品列表
// 使用视图 vw_cart_detail 简化查询，包含商品详细信息
exports.getCartItems=async(req,res)=>{
    try{
        const{cartid}=req.params;

        // 使用原生 SQL 查询视图，获取购物车明细（包含商品信息）
        const cartItems = await prisma.$queryRaw`
            SELECT * FROM vw_cart_detail
            WHERE cartid = ${cartid}
            ORDER BY entertime DESC
        `;

        res.status(200).json({
            code:200,
            message:'查询购物车项成功',
            data:cartItems
        });
        
    }catch(err){
        console.error('查询购物车项失败:',err);
        res.status(500).json({
            code:500,
            message:'查询购物车项失败',
            error:err.message
        });
    }
}