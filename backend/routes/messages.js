const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Get messages for a channel
router.get('/channel/:channelId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ channelId: req.params.channelId })
      .sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new message
router.post('/', auth, async (req, res) => {
  try {
    const { text, channelId, postImg, image } = req.body;
    
    if (!channelId) {
      return res.status(400).json({ success: false, error: 'Channel ID is required' });
    }
    
    if (!text && !postImg && !image) {
      return res.status(400).json({ success: false, error: 'Message text or image is required' });
    }
    
    const message = new Message({
      text: text || '',
      channelId,
      userId: req.user._id,
      userName: req.user.displayName || req.user.name,
      userImg: req.user.photoURL || '',
      postImg: postImg || image || null
    });
    
    await message.save();
    res.json({ success: true, message });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update message reactions
router.put('/:messageId/reaction', auth, async (req, res) => {
  try {
    const { type, action } = req.body;
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }
    
    const userId = req.user._id.toString();
    let reactionField, countField;
    
    // Map reaction types to correct field names
    if (type === 'likes') {
      reactionField = 'likes';
      countField = 'likeCount';
    } else if (type === 'fire') {
      reactionField = 'fire';
      countField = 'fireCount';
    } else if (type === 'heart') {
      reactionField = 'heart';
      countField = 'heartCount';
    } else {
      return res.status(400).json({ success: false, error: 'Invalid reaction type' });
    }
    
    const currentReaction = message[reactionField].get(userId);
    
    if (action === 'add' && !currentReaction) {
      message[reactionField].set(userId, true);
      message[countField] += 1;
    } else if (action === 'remove' && currentReaction) {
      message[reactionField].set(userId, false);
      message[countField] = Math.max(0, message[countField] - 1);
    }
    
    await message.save();
    res.json({ success: true, message });
  } catch (error) {
    console.error('Update reaction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete message
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.messageId);
    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;