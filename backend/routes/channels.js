const express = require('express');
const router = express.Router();
const Channel = require('../models/Channel');
const auth = require('../middleware/auth');

// Get all channels
router.get('/', auth, async (req, res) => {
  try {
    const channels = await Channel.find().sort({ channelName: 1 });
    res.json({ success: true, channels });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new channel
router.post('/', auth, async (req, res) => {
  try {
    const { channelName } = req.body;
    
    if (!channelName) {
      return res.status(400).json({ success: false, error: 'Channel name is required' });
    }
    
    const normalizedName = channelName.toLowerCase().trim();
    
    // Check if channel already exists
    const existingChannel = await Channel.findOne({ channelName: normalizedName });
    if (existingChannel) {
      return res.status(400).json({ success: false, error: 'Channel already exists' });
    }
    
    const channel = new Channel({ channelName: normalizedName });
    await channel.save();
    
    res.json({ success: true, channel });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get channel by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }
    res.json({ success: true, channel });
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;