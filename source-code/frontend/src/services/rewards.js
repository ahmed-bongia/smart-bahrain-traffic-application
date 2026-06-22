import api from './api';

export const rewardService = {
  // Get user's reward balance
  async getBalance() {
    const response = await api.get('/rewards/balance');
    return response.data;
  },

  // Get reward history
  async getHistory(page = 1, limit = 10) {
    const response = await api.get('/rewards/history', {
      params: { page, limit },
    });
    return response.data;
  },

  // Claim reward
  async claimReward(reportId) {
    const response = await api.post('/rewards/claim', { reportId });
    return response.data;
  },

  // Withdraw balance
  async withdraw(amount) {
    const response = await api.post('/rewards/withdraw', { amount });
    return response.data;
  },

  // Get reward stats
  async getStats() {
    const response = await api.get('/rewards/stats');
    return response.data;
  },
};
