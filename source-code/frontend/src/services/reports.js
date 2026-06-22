import api from './api';

export const reportService = {
  // Create a new report
  async createReport(reportData) {
    const response = await api.post('/reports', reportData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all reports (with pagination)
  async getReports(page = 1, limit = 10, filters = {}) {
    const response = await api.get('/reports', {
      params: { page, limit, ...filters },
    });
    return response.data;
  },

  // Get single report by ID
  async getReport(id) {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  // Update report
  async updateReport(id, data) {
    const response = await api.put(`/reports/${id}`, data);
    return response.data;
  },

  // Delete report
  async deleteReport(id) {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  // Get reports by category
  async getReportsByCategory(category) {
    const response = await api.get('/reports', {
      params: { category },
    });
    return response.data;
  },

  // Get user's reports
  async getUserReports() {
    const response = await api.get('/reports/user/my-reports');
    return response.data;
  },
};
