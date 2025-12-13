const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  channelName: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Channel', channelSchema);