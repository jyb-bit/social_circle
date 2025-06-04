const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/avatars';
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成文件名：时间戳 + 随机数 + 原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只接受图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件！'), false);
  }
};

// 创建 multer 实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 限制2MB
  }
});

// 处理单个文件上传
const uploadAvatar = upload.single('avatar');

// 上传头像控制器
const handleAvatarUpload = (req, res) => {
  uploadAvatar(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Multer 错误
      return res.status(400).json({
        code: 400,
        msg: err.message
      });
    } else if (err) {
      // 其他错误
      return res.status(500).json({
        code: 500,
        msg: err.message
      });
    }

    // 文件上传成功
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        msg: '没有上传文件'
      });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    const fileUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

    // 返回文件信息
    res.json({
      code: 200,
      msg: '上传成功',
      data: {
        url: fileUrl,
        filename: req.file.filename
      }
    });
  });
};

module.exports = {
  handleAvatarUpload
}; 