const express =require('express');
const router =express.Router();
const cartControllers = require('../controllers/cartControllers');

// cart的创建条件是新用户注册，所以这一功能写在users里边了

// cart cartitem  放置在一个路由中 他们是强关联的父子关系

// 增删改查嘛  1.添加购物车项 2.删除购物车项 3.更新购物车项（只有一个加入时间属性，没什么好更新的） 4.查询购物车项（这个有点骚难了）  其实也不难，include关联查询就ok了

// 1.添加购物车项
router.post('/add/:cartid',cartControllers.addCartItem);

// 2.删除购物车项
router.delete('/delete/:cartitemid',cartControllers.deleteCartItem);

// 3.查询购物车项
router.get('/get/:cartid',cartControllers.getCartItems);

module.exports=router;