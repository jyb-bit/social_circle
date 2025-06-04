const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 根据不同的上传类型选择不同的目录
    let uploadDir;
    if (req.path === '/post') {
      uploadDir = 'uploads/posts';
    } else if (req.path === '/background') {
      uploadDir = 'uploads/backgrounds';
    } else if (req.path === '/avatar' || req.path === '/register-avatar') {
      uploadDir = 'uploads/avatars';
    }
    
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    let prefix;
    if (req.path === '/post') {
      prefix = 'post-';
    } else if (req.path === '/background') {
      prefix = 'background-';
    } else if (req.path === '/avatar' || req.path === '/register-avatar') {
      prefix = 'avatar-';
    }
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只接受图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只能上传图片文件!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 限制2MB
  }
});

// 上传朋友圈图片
router.post('/post', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        code: 444,
        msg: '没有上传文件'
      });
    }

    // 返回文件路径
    const filePath = '/' + req.file.path.replace(/\\/g, '/');
    // 获取 baseUrl，这里需要通过某种方式从app.js传递过来，或者从环境变量读取
    // 假设 baseUrl 可以通过 req.app.get('baseUrl') 获取
    const baseUrl = req.app.get('baseUrl') || 'http://localhost:3001'; // 默认值
    const fullUrl = `${baseUrl}${filePath}`;

    res.json({
      code: 222,
      msg: '上传成功',
      obj: fullUrl // 返回完整的URL
    });
  } catch (error) {
    console.error('上传失败:', error);
    res.json({
      code: 444,
      msg: '上传失败: ' + error.message
    });
  }
});

// 上传背景图片
router.post('/background', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        code: 444,
        msg: '没有上传文件'
      });
    }

    // 返回文件路径
    const filePath = '/' + req.file.path.replace(/\\/g, '/');
    // 获取 baseUrl，这里需要通过某种方式从app.js传递过来，或者从环境变量读取
    // 假设 baseUrl 可以通过 req.app.get('baseUrl') 获取
    const baseUrl = req.app.get('baseUrl') || 'http://localhost:3001'; // 默认值
    const fullUrl = `${baseUrl}${filePath}`;

    res.json({
      code: 222,
      msg: '上传成功',
      obj: fullUrl // 返回完整的URL
    });
  } catch (error) {
    console.error('上传失败:', error);
    res.json({
      code: 444,
      msg: '上传失败: ' + error.message
    });
  }
});

// 上传头像
router.post('/avatar', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        code: 444,
        msg: '没有上传文件'
      });
    }

    // 返回文件路径
    const filePath = '/' + req.file.path.replace(/\\/g, '/');
    const baseUrl = req.app.get('baseUrl') || 'http://localhost:3001';
    const fullUrl = `${baseUrl}${filePath}`;

    // 更新用户头像
    const userId = req.user.userId; // 从 auth 中间件获取
    const User = require('../models/User');
    await User.findByIdAndUpdate(userId, { avatar: filePath });

    res.json({
      code: 222,
      msg: '上传成功',
      obj: fullUrl
    });
  } catch (error) {
    console.error('上传失败:', error);
    res.json({
      code: 444,
      msg: '上传失败: ' + error.message
    });
  }
});

// 注册时上传头像（不需要认证）
router.post('/register-avatar', upload.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        code: 444,
        msg: '没有上传文件'
      });
    }

    // 返回文件路径
    const filePath = '/' + req.file.path.replace(/\\/g, '/');
    const baseUrl = req.app.get('baseUrl') || 'http://localhost:3001';
    const fullUrl = `${baseUrl}${filePath}`;

    res.json({
      code: 222,
      msg: '上传成功',
      obj: fullUrl
    });
  } catch (error) {
    console.error('上传失败:', error);
    res.json({
      code: 444,
      msg: '上传失败: ' + error.message
    });
  }
});

module.exports = router; 