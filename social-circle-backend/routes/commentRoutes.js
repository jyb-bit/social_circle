const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

// 添加评论
router.post('/', auth, commentController.addComment);

// 获取评论更新
router.get('/updates', commentController.getCommentUpdates);

// 删除评论
router.delete('/:commentId', auth, commentController.deleteComment);

module.exports = router; 