const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    
    // First check if user exists with same email (prioritize email over googleId)
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user with Google info if not already set
      if (!user.googleId) {
        user.googleId = profile.id;
      }
      if (!user.photoURL || user.photoURL.includes('ui-avatars.com')) {
        user.photoURL = profile.photos[0].value;
      }
      user.authProvider = 'google';
      await user.save();
      return done(null, user);
    }
    
    // Check by googleId as fallback
    user = await User.findOne({ googleId: profile.id });
    if (user) {
      return done(null, user);
    }
    
    // Create new user only if no existing user found
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: email,
      displayName: profile.displayName,
      photoURL: profile.photos[0].value,
      authProvider: 'google'
    });
    
    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, displayName } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }
    
    user = new User({ name, email, password, displayName });
    await user.save();
    
    const token = user.generateAuthToken();
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    res.json({ success: true, user: userResponse, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = user.generateAuthToken();
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    res.json({ success: true, user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  const userResponse = { ...req.user.toObject() };
  delete userResponse.password;
  res.json({ success: true, user: userResponse });
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { displayName } = req.body;
    req.user.displayName = displayName;
    await req.user.save();
    
    const userResponse = { ...req.user.toObject() };
    delete userResponse.password;
    
    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = req.user.generateAuthToken();
    const userResponse = { ...req.user.toObject() };
    delete userResponse.password;
    
    // Redirect to frontend with token
    res.redirect(`${process.env.CLIENT_URL}?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}`);
  }
);

module.exports = router;