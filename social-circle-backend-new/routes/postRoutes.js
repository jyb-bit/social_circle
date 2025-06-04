const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// 获取所有帖子
router.get('/all', postController.getAllPosts);

// 发布帖子
router.post('/add', auth, postController.createPost);

// 删除帖子
router.delete('/:postId', auth, postController.deletePost);
//编辑帖子
router.put('/:postId', auth, postController.editPost);

module.exports = router; 