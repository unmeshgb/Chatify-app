const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  channelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userImg: {
    type: String,
    default: ''
  },
  postImg: {
    type: String,
    default: null
  },
  likeCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Map,
    of: Boolean,
    default: {}
  },
  fireCount: {
    type: Number,
    default: 0
  },
  fire: {
    type: Map,
    of: Boolean,
    default: {}
  },
  heartCount: {
    type: Number,
    default: 0
  },
  heart: {
    type: Map,
    of: Boolean,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);