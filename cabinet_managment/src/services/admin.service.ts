import api from '@/lib/api';

export const adminService = {
  async getStats() {
    const response = await api.get('admin/stats');
    return response.data;
  },

  async getUsers() {
    const response = await api.get('admin/users');
    return response.data;
  },

  async updateUserStatus(userId: string | number, status: string) {
    const response = await api.patch(`admin/users/${userId}/status`, null, {
      params: { status_in: status }
    });
    return response.data;
  }
};
