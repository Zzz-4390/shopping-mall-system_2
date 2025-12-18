const express =require('express');
const router =express.Router();
const messageControllers =require('../controllers/messageControllers');

// 消息的 增删（还是不删，都保留下来）改（也没有修改的必要吧）  查（这个就多了 有查询当前用户的所有信息，查询当前用户跟某个用户的message）
// 1.创建消息   params携带的就是消息的发送者id
router.post('/add/:senderid',messageControllers.createMessage);

// 2.查询用户消息
router.get('/getall/:receiverid',messageControllers.getMessages);

// 3.查询用户跟某个用户的消息     --传递参数就一个userid就行
router.get('/getchat/:senderid/:receiverid',messageControllers.getMessagesBetweenUsers);

// 4.更新消息已读状态
router.put('/read/:messageid', messageControllers.updateMessageRead);


module.exports=router;
