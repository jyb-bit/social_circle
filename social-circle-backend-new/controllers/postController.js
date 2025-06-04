const Post = require('../models/Post');
const User = require('../models/User');

// 获取所有帖子
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate({
        path: 'userID',
        select: 'username nickname avatar backgroundImage'
      })
      .populate({
        path: 'likes',
        select: 'username nickname'
      })
      .sort({ time: -1 });

    const formattedPosts = posts.map(post => ({
      postID: post._id,
      content: post.content,
      image: post.image,
      time: post.time,
      author: {
        userId: post.userID._id,
        username: post.userID.username,
        nickname: post.userID.nickname,
        avatar: post.userID.avatar,
        backgroundImage: post.userID.backgroundImage
      },
      likeUserIds: post.likes.map(user => user._id),
      likeUsernames: post.likes.map(user => user.nickname)
    }));

    res.json({
      code: 222,
      msg: '获取成功',
      obj: formattedPosts
    });
  } catch (error) {
    res.json({
      code: 444,
      msg: '获取失败: ' + error.message
    });
  }
};

// 发布帖子
exports.createPost = async (req, res) => {
  try {
    const { userID, content, image, time } = req.body;

    const post = new Post({
      userID,
      content,
      image,
      time: time || Date.now(),
    });

    await post.save();

    res.json({
      code: 222,
      msg: '发布成功'
    });
  } catch (error) {
    res.json({
      code: 444,
      msg: '发布失败: ' + error.message
    });
  }
};

// 删除帖子
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    console.log('Deleting post with ID1:', postId); // 添加日志
    const post = await Post.findByIdAndDelete(postId);
if (!post) {
  console.log('Post not found with ID:', postId); // 添加日志
  return res.status(404).json({
    code: 404,
    msg: '帖子未找到'
  });
}

console.log('Post deleted successfully:', postId); // 添加日志
res.json({
  code: 222,
  msg: '删除成功'
});
  } catch (error) {
    res.json({
      code: 444,
      msg: '删除失败: ' + error.message
    });
  }
}; 
// 编辑帖子
exports.editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, image } = req.body;

    // 检查帖子是否存在
    const post = await Post.findById(postId);
    if (!post) {
      return res.json({
        code: 404,
        msg: '帖子不存在'
      });
    }

    // 更新帖子内容
    post.content = content || post.content;
    post.image = image || post.image;

    await post.save();

    res.json({
      code: 222,
      msg: '编辑成功',
      data: post
    });
  } catch (error) {
    console.error('编辑帖子失败:', error);
    res.json({
      code: 444,
      msg: '编辑失败: ' + error.message
    });
  }
};
