import api from './api';

export const userService = {
  // Get all users
  async getAll(page = 1, limit = 20) {
    const response = await api.get('/admin/users', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get user by ID
  async getById(id: string) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Update user
  async update(id: string, data: Record<string, unknown>) {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  // Delete user
  async delete(id: string) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Get user statistics
  async getStats() {
    const response = await api.get('/admin/users/stats');
    return response.data;
  },

  // Suspend/Unsuspend user
  async toggleSuspension(id: string) {
    const response = await api.post(`/admin/users/${id}/toggle-suspension`);
    return response.data;
  },
};

