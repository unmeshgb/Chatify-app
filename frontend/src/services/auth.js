import { authAPI } from './api';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.checkAuthState();
  }

  async checkAuthState() {
    // Check for Google OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    
    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('token', token);
        localStorage.setItem('userDetails', JSON.stringify(user));
        this.currentUser = user;
        this.notifyListeners(this.currentUser);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      } catch (error) {
        console.error('Error parsing OAuth callback:', error);
      }
    }
    
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const response = await authAPI.getMe();
        if (response.data.success) {
          this.currentUser = response.data.user;
          this.notifyListeners(this.currentUser);
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('userDetails');
      }
    }
  }

  async signInWithPopup() {
    const email = prompt('Enter email:') || 'demo@example.com';
    const password = prompt('Enter password:') || 'password123';
    
    try {
      const response = await authAPI.login({ email, password });
      if (response.data.success) {
        this.currentUser = response.data.user;
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userDetails', JSON.stringify(response.data.user));
        this.notifyListeners(this.currentUser);
        return { user: this.currentUser };
      }
    } catch (error) {
      try {
        const name = prompt('Enter your name:') || 'Demo User';
        const displayName = name.split(' ')[0];
        const registerResponse = await authAPI.register({ name, email, password, displayName });
        if (registerResponse.data.success) {
          this.currentUser = registerResponse.data.user;
          localStorage.setItem('token', registerResponse.data.token);
          localStorage.setItem('userDetails', JSON.stringify(registerResponse.data.user));
          this.notifyListeners(this.currentUser);
          return { user: this.currentUser };
        }
      } catch (registerError) {
        throw registerError;
      }
    }
  }

  signOut() {
    return new Promise((resolve) => {
      this.currentUser = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userDetails');
      this.notifyListeners(null);
      resolve();
    });
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners(user) {
    this.listeners.forEach(listener => listener(user));
  }
}

export const auth = new AuthService();