const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
require('dotenv').config();

// 导入路由
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 设置 baseUrl
const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
app.set('baseUrl', baseUrl); // 将 baseUrl 设置到 app 对象上

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 添加头像URL处理中间件
app.use((req, res, next) => {
  if (req.path.startsWith('/api/users') || req.path.startsWith('/api/posts')) {
    const originalJson = res.json;
    res.json = function(data) {
      if (data.obj) {
        if (Array.isArray(data.obj)) {
          data.obj = data.obj.map(item => {
            if (item.avatar && !item.avatar.startsWith('http')) {
              item.avatar = `${baseUrl}${item.avatar}`;
            }
            if (item.backgroundImage && !item.backgroundImage.startsWith('http')) {
              item.backgroundImage = `${baseUrl}${item.backgroundImage}`;
            }
            if (item.author && item.author.avatar && !item.author.avatar.startsWith('http')) {
              item.author.avatar = `${baseUrl}${item.author.avatar}`;
            }
            return item;
          });
        } else if (typeof data.obj === 'object') {
          if (data.obj.avatar && !data.obj.avatar.startsWith('http')) {
            data.obj.avatar = `${baseUrl}${data.obj.avatar}`;
          }
          if (data.obj.backgroundImage && !data.obj.backgroundImage.startsWith('http')) {
            data.obj.backgroundImage = `${baseUrl}${data.obj.backgroundImage}`;
          }
        }
      }
      return originalJson.call(this, data);
    };
  }
  next();
});

// 路由
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/upload', uploadRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    msg: '服务器内部错误'
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 