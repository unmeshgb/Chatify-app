const express = require('express');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();

const connectDB = require('../config/database');
const authRoutes = require('../routes/auth');
const channelRoutes = require('../routes/channels');
const messageRoutes = require('../routes/messages');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000', 
    process.env.CLIENT_URL,
    'https://chatify-frontend.vercel.app' // Replace with your frontend URL
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin) || origin?.includes('vercel.app')) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

module.exports = app;