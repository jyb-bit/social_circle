const Post = require('../models/Post');

// 添加点赞
exports.addLike = async (req, res) => {
  try {
    const { userID, postID } = req.query;

    const post = await Post.findById(postID);
    if (!post) {
      return res.json({
        code: 444,
        msg: '帖子不存在'
      });
    }

    // 检查是否已经点赞
    if (post.likes.includes(userID)) {
      return res.json({
        code: 444,
        msg: '已经点赞过了'
      });
    }

    // 添加点赞
    post.likes.push(userID);
    await post.save();

    res.json({
      code: 222,
      msg: '点赞成功'
    });
  } catch (error) {
    res.json({
      code: 444,
      msg: '点赞失败: ' + error.message
    });
  }
};

// 取消点赞
exports.removeLike = async (req, res) => {
  try {
    const { userID, postID } = req.query;

    const post = await Post.findById(postID);
    if (!post) {
      return res.json({
        code: 444,
        msg: '帖子不存在'
      });
    }

    // 检查是否已经点赞
    if (!post.likes.includes(userID)) {
      return res.json({
        code: 444,
        msg: '还没有点赞'
      });
    }

    // 移除点赞
    post.likes = post.likes.filter(id => id.toString() !== userID);
    await post.save();

    res.json({
      code: 222,
      msg: '取消点赞成功'
    });
  } catch (error) {
    res.json({
      code: 444,
      msg: '取消点赞失败: ' + error.message
    });
  }
}; 