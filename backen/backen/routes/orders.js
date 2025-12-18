const express =require('express');
const router =express.Router();
const ordersControllers =require('../controllers/ordersControllers');

// 1.创建订单
router.post('/add/:buyerid',ordersControllers.createOrder);

// 2.完成订单
router.post('/complete/:orderid',ordersControllers.completeOrder);

// 3.查询订单信息
router.get('/get/:userid',ordersControllers.getOrderInfo);

module.exports=router;