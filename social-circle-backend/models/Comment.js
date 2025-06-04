const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parentCommentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  content: {
    type: String,
    required: true,
    maxlength: 50
  },
  time: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', commentSchema); 