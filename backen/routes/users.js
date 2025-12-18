var express = require('express');
var router = express.Router();

const usersControllers=require('../controllers/usersControllers');

router.post('/regist',usersControllers.registUser);

router.get('/get/:userid',usersControllers.getuser);

router.put('/update/:userid',usersControllers.updateUser);

router.post('/login',usersControllers.loginUser);

module.exports = router;


