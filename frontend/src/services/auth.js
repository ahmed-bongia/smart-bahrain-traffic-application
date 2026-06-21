import api from './api';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  // User registration
  async register(data) {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      await SecureStore.setItemAsync('userToken', response.data.token);
    }
    return response.data;
  },

  // User login
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      await SecureStore.setItemAsync('userToken', response.data.token);
    }
    return response.data;
  },

  // Get current user
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Forgot password
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot', { email });
    return response.data;
  },

  // Verify OTP
  async verifyOtp(email, otp) {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Reset password
  async resetPassword(email, newPassword) {
    const response = await api.post('/auth/reset-password', { email, newPassword });
    return response.data;
  },

  // Logout
  async logout() {
    await SecureStore.deleteItemAsync('userToken');
  },
};
