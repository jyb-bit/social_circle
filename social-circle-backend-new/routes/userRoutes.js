const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// 用户注册
router.post('/add', userController.register);

// 用户名密码登录
router.post('/loginByUserAndPwd', userController.loginByUserAndPwd);

// 邮箱密码登录
router.post('/loginByEmailAndPwd', userController.loginByEmailAndPwd);

// 根据用户名查询头像
router.get('/searchAvatarByUsername/:username', userController.searchAvatarByUsername);

// 根据邮箱查询头像
router.get('/searchAvatarByEmail/:email', userController.searchAvatarByEmail);

// 获取用户信息
router.get('/:userId', userController.getUserById);

// 更新用户信息
router.put('/update', auth, userController.updateUserInfo);

module.exports = router; 