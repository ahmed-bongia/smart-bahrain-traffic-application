import api from './api';

export const authService = {
  // Admin login
  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
    }
    return response.data;
  },

  // Get current admin
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('adminToken');
  },

  // Check if logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('adminToken');
  },
};

