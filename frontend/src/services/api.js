import axios from 'axios';
import io from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling']
});

// API instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Channels API
export const channelsAPI = {
  getAll: () => api.get('/channels'),
  create: (channelData) => api.post('/channels', channelData),
  getById: (id) => api.get(`/channels/${id}`),
};

// Messages API
export const messagesAPI = {
  getByChannel: (channelId) => api.get(`/messages/channel/${channelId}`),
  create: (messageData) => api.post('/messages', messageData),
  updateReaction: (messageId, reactionData) => api.put(`/messages/${messageId}/reaction`, reactionData),
  delete: (messageId) => api.delete(`/messages/${messageId}`),
};

// Socket events
export const socketAPI = {
  socket,
  joinChannel: (channelId) => socket.emit('join-channel', channelId),
  leaveChannel: (channelId) => socket.emit('leave-channel', channelId),
  sendMessage: (data) => socket.emit('new-message', data),
  sendReaction: (data) => socket.emit('message-reaction', data),
  sendDeleteMessage: (data) => socket.emit('message-deleted', data),
  
  // Listeners
  onMessageReceived: (callback) => socket.on('message-received', callback),
  onReactionUpdated: (callback) => socket.on('reaction-updated', callback),
  onMessageDeleted: (callback) => socket.on('message-deleted', callback),
  
  // Remove listeners
  offMessageReceived: () => socket.off('message-received'),
  offReactionUpdated: () => socket.off('reaction-updated'),
  offMessageDeleted: () => socket.off('message-deleted'),
};

export default api;