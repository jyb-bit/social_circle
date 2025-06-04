const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');

// 添加评论
exports.addComment = async (req, res) => {
  try {
    const { userID, postID, content, parentCommentID } = req.body;

    const comment = new Comment({
      userID,
      postID,
      content,
      parentCommentID: parentCommentID || null
    });

    await comment.save();

    // 更新帖子的评论列表
    await Post.findByIdAndUpdate(postID, {
      $push: { comments: comment._id }
    });

    // 获取评论者信息
    const populatedComment = await Comment.findById(comment._id)
      .populate('userID', 'username nickname avatar')
      .populate('parentCommentID', 'content userID')
      .populate({
        path: 'parentCommentID',
        populate: {
          path: 'userID',
          select: 'username nickname'
        }
      });

    res.json({
      code: 222,
      msg: '评论成功',
      data: {
        commentID: populatedComment._id,
        content: populatedComment.content,
        time: populatedComment.time,
        user: {
          userId: populatedComment.userID._id,
          username: populatedComment.userID.username,
          nickname: populatedComment.userID.nickname,
          avatar: populatedComment.userID.avatar
        },
        parentComment: populatedComment.parentCommentID ? {
          commentID: populatedComment.parentCommentID._id,
          content: populatedComment.parentCommentID.content,
          user: {
            userId: populatedComment.parentCommentID.userID._id,
            username: populatedComment.parentCommentID.userID.username,
            nickname: populatedComment.parentCommentID.userID.nickname
          }
        } : null
      }
    });
  } catch (error) {
    res.json({
      code: 444,
      msg: '评论失败: ' + error.message
    });
  }
};

// 获取评论更新
exports.getCommentUpdates = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('userID', 'username nickname avatar')
      .populate('parentCommentID', 'content userID')
      .populate({
        path: 'parentCommentID',
        populate: {
          path: 'userID',
          select: 'username nickname'
        }
      })
      .sort({ time: -1 });

    const formattedComments = comments.map(comment => ({
      commentID: comment._id,
      postID: comment.postID,
      content: comment.content,
      time: comment.time,
      user: {
        userId: comment.userID._id,
        username: comment.userID.username,
        nickname: comment.userID.nickname,
        avatar: comment.userID.avatar
      },
      parentComment: comment.parentCommentID ? {
        commentID: comment.parentCommentID._id,
        content: comment.parentCommentID.content,
        user: {
          userId: comment.parentCommentID.userID._id,
          username: comment.parentCommentID.userID.username,
          nickname: comment.parentCommentID.userID.nickname
        }
      } : null
    }));

    res.json({
      code: 222,
      msg: '获取成功',
      obj: formattedComments
    });
  } catch (error) {
    res.json({
      code: 444,
      msg: '获取失败: ' + error.message
    });
  }
};

// 删除评论
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.json({
        code: 444,
        msg: '评论不存在'
      });
    }

    // 权限校验：检查当前用户是否是评论的作者
    // req.user._id 是auth中间件添加到req对象上的当前用户ID
    if (comment.userID.toString() !== req.user._id.toString()) {
        return res.status(403).json({ // 返回403 Forbidden表示无权限
            code: 403,
            msg: '无权限删除该评论'
        });
    }

    // 从帖子中移除评论引用
    await Post.findByIdAndUpdate(comment.postID, {
      $pull: { comments: commentId }
    });

    // 删除该评论的所有回复
    await Comment.deleteMany({ parentCommentID: commentId });

    await Comment.findByIdAndDelete(commentId);

    res.json({
      code: 222,
      msg: '删除成功'
    });
  } catch (error) {
    console.error('删除评论失败:', error); // 添加日志
    res.json({
      code: 444,
      msg: '删除失败: ' + error.message
    });
  }
}; 