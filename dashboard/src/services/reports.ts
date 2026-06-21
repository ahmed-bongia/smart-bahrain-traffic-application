import api from './api';

export const reportService = {
  // Get all reports (admin view)
  async getAll(page = 1, limit = 20, filters = {}) {
    const response = await api.get('/reports', {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  // Get single report
  async getById(id: string) {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  // Update report status
  async updateStatus(id: string, status: string) {
    const response = await api.put(`/reports/${id}`, { status });
    return response.data;
  },

  // Delete report
  async delete(id: string) {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  // Get reports statistics
  async getStats() {
    const response = await api.get('/reports/stats');
    return response.data;
  },

  // Get reports by category
  async getByCategory(category: string) {
    const response = await api.get('/reports', {
      params: { category },
    });
    return response.data;
  },

  // Export reports
  async export(format: 'csv' | 'pdf') {
    const response = await api.get(`/reports/export/${format}`, {
      responseType: format === 'pdf' ? 'blob' : 'text',
    });
    return response.data;
  },
};

