const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  image: {
    type: String,
    default: ''
  },
  time: {
    type: Date,
    default: Date.now
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});

// 虚拟字段：点赞用户名列表
postSchema.virtual('likeUsernames', {
  ref: 'User',
  localField: 'likes',
  foreignField: '_id',
  justOne: false,
  get: function(users) {
    return users ? users.map(user => user.nickname) : [];
  }
});

// 确保虚拟字段在 JSON 中可见
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema); 