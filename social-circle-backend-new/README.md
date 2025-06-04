# Social Circle Backend

这是社交圈应用的后端服务，基于Express和MongoDB构建。

## 技术栈

- Node.js
- Express
- MongoDB
- JWT认证
- 邮件服务

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
创建.env文件并设置以下变量：
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/social_circle
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@qq.com
EMAIL_PASS=your_email_auth_code
```

3. 运行服务：
```bash
# 开发环境
npm run dev

# 生产环境
npm start
```

## API文档

### 用户相关

- POST /api/users/add - 用户注册
- POST /api/users/loginByUserAndPwd - 用户名密码登录
- POST /api/users/loginByEmailAndPwd - 邮箱密码登录
- GET /api/users/searchAvatarByUsername/:username - 根据用户名查询头像
- GET /api/users/searchAvatarByEmail/:email - 根据邮箱查询头像

### 帖子相关

- GET /api/posts/all - 获取所有帖子
- POST /api/posts/add - 发布帖子
- DELETE /api/posts/:postId - 删除帖子

### 评论相关

- POST /api/comments/add - 添加评论
- GET /api/comments/UpdateComment - 获取评论更新
- DELETE /api/comments/:commentId - 删除评论

### 点赞相关

- POST /api/likes/addLike - 添加点赞
- POST /api/likes/remove - 取消点赞

### 邮件相关

- GET /email/sendEmail/:email - 发送验证码
- POST /email/QueryVerificationCode - 验证验证码

## 注意事项

1. 确保MongoDB服务已启动
3. 设置适当的JWT密钥
4. 在生产环境中更改默认端口和其他敏感信息 