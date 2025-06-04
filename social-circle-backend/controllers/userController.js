const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 用户注册
exports.register = async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;
    
    // 检查用户名和邮箱是否已存在
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.json({
        code: 444,
        msg: '用户名或邮箱已存在'
      });
    }

    const user = new User({
      username,
      email,
      password,
      avatar: avatar || '/src/assets/nullUser.png'
    });

    await user.save();

    // 注册成功后直接返回登录信息
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.json({
      code: 222,
      msg: '注册成功',
      obj: {
        userId: user._id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
        backgroundImage: user.backgroundImage,
        signature: user.signature,
        token
      }
    });
  } catch (error) {
    res.json({
      code: 444,
      msg: '注册失败: ' + error.message
    });
  }
};

// 用户名密码登录
exports.loginByUserAndPwd = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
      return res.json({
        code: 444,
        msg: '用户名或密码错误'
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.json({
      code: 222,
      msg: '登录成功',
      obj: {
        userId: user._id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
        backgroundImage: user.backgroundImage,
        signature: user.signature,
        token
      }
    });
  } catch (error) {
    res.json({
      code: 444,
      msg: '登录失败: ' + error.message
    });
  }
};

// 邮箱密码登录
exports.loginByEmailAndPwd = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.json({
        code: 444,
        msg: '邮箱或密码错误'
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.json({
      code: 222,
      msg: '登录成功',
      obj: {
        userId: user._id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
        backgroundImage: user.backgroundImage,
        signature: user.signature,
        token
      }
    });
  } catch (error) {
    res.json({
      code: 444,
      msg: '登录失败: ' + error.message
    });
  }
};

// 根据用户名查询头像
exports.searchAvatarByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (!user) {
      return res.json({
        code: 444,
        msg: '用户不存在',
        obj: '/src/assets/nullUser.png'
      });
    }

    res.json({
      code: 222,
      msg: '查询成功',
      obj: user.avatar
    });
  } catch (error) {
    res.json({
      code: 444,
      msg: '查询失败',
      obj: '/src/assets/nullUser.png'
    });
  }
};

// 根据邮箱查询头像
exports.searchAvatarByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        code: 444,
        msg: '用户不存在',
        obj: '/src/assets/nullUser.png'
      });
    }

    res.json({
      code: 222,
      msg: '查询成功',
      obj: user.avatar
    });
  } catch (error) {
    res.json({
      code: 444,
      msg: '查询失败',
      obj: '/src/assets/nullUser.png'
    });
  }
};

// 更新用户信息
exports.updateUserInfo = async (req, res) => {
  try {
    const { userId, nickname, email, signature, avatar, backgroundImage } = req.body;
    if (!userId) {
      return res.json({ code: 444, msg: '缺少用户ID' });
    }
    const update = {};
    if (nickname) update.nickname = nickname;
    if (email) update.email = email;
    if (signature) update.signature = signature;
    if (avatar) update.avatar = avatar;
    if (backgroundImage) update.backgroundImage = backgroundImage;
    
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) {
      return res.json({ code: 444, msg: '用户不存在' });
    }
    res.json({
      code: 222,
      msg: '用户信息更新成功',
      obj: {
        userId: user._id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
        backgroundImage: user.backgroundImage,
        signature: user.signature
      }
    });
  } catch (error) {
    res.json({ code: 444, msg: '用户信息更新失败: ' + error.message });
  }
};

// 获取用户信息
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.json({
        code: 444,
        msg: '用户不存在'
      });
    }

    res.json({
      code: 222,
      msg: '获取成功',
      obj: {
        userId: user._id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
        backgroundImage: user.backgroundImage,
        signature: user.signature
      }
    });
  } catch (error) {
    res.json({
      code: 444,
      msg: '获取用户信息失败: ' + error.message
    });
  }
}; 