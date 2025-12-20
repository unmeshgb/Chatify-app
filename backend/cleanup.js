const mongoose = require('mongoose');
require('dotenv').config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Drop the users collection to remove old indexes
    await mongoose.connection.db.collection('users').drop();
    console.log('Users collection dropped');
    
    await mongoose.disconnect();
    console.log('Cleanup complete');
  } catch (error) {
    console.log('Cleanup error (this is normal if collection doesn\'t exist):', error.message);
    await mongoose.disconnect();
  }
}

cleanup();