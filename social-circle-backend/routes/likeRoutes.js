const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const auth = require('../middleware/auth');

// 添加点赞
router.post('/addLike', auth, likeController.addLike);

// 取消点赞
router.post('/remove', auth, likeController.removeLike);

module.exports = router; 