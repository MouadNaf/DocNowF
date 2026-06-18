import api from '@/lib/api';

export const adminService = {

  async getStats() {
    const res = await api.get('admin/stats');
    return res.data;
  },

  async getRecentActivity() {
    const res = await api.get('admin/recent-activity');
    return res.data.data ?? [];
  },

  async getUserGrowth() {
    const res = await api.get('admin/user-growth');
    return res.data.data ?? [];
  },

  async getRevenueGrowth() {
    const res = await api.get('admin/revenue-growth');
    return res.data.data ?? [];
  },

  async getAllDoctors() {
    const res = await api.get('admin/doctors');
    return res.data;
  },

  async getAllClinics() {
    const res = await api.get('admin/clinics');
    return res.data;
  },

  async getAllCabinets() {
    const res = await api.get('admin/cabinets');
    return res.data;
  },

  async getAllPrivateCabinets() {
    const res = await api.get('admin/private-cabinets');
    return res.data;
  },

  async approveDoctor(id: number | string) {
    const res = await api.post(`admin/doctors/${id}/approve`);
    return res.data;
  },

  async approveClinic(id: number | string) {
    const res = await api.post(`admin/clinics/${id}/approve`);
    return res.data;
  },

  async approveCabinet(id: number | string) {
    const res = await api.post(`admin/cabinets/${id}/approve`);
    return res.data;
  },

  async toggleDoctorStatus(id: number | string) {
    const res = await api.patch(`admin/doctors/${id}/toggle-status`);
    return res.data;
  },

  async toggleClinicStatus(id: number | string) {
    const res = await api.patch(`admin/clinics/${id}/toggle-status`);
    return res.data;
  },

  async toggleCabinetStatus(id: number | string) {
    const res = await api.patch(`admin/cabinets/${id}/toggle-status`);
    return res.data;
  },

  async rejectDoctor(id: number | string) {
    const res = await api.delete(`admin/doctors/${id}/reject`);
    return res.data;
  },

  async rejectClinic(id: number | string) {
    const res = await api.delete(`admin/clinics/${id}/reject`);
    return res.data;
  },

  async rejectCabinet(id: number | string) {
    const res = await api.delete(`admin/cabinets/${id}/reject`);
    return res.data;
  },

  async getAllSecretaries() {
    const res = await api.get('admin/secretaries');
    return res.data;
  },

  async getAllPatients() {
    const res = await api.get('admin/patients');
    return res.data;
  },

  async getUsers(params?: { page?: number; per_page?: number; search?: string; entity_type?: string }) {
    const res = await api.get('admin/users', { params });
    return res.data;
  },

  async getUserDetail(entityType: string, id: number | string) {
    const res = await api.get(`admin/users/${entityType}/${id}`);
    return res.data.data;
  },

  async getRechargeRequests() {
    const res = await api.get('admin/recharge-requests');
    return res.data;
  },

  async approveRecharge(id: number | string) {
    const res = await api.post(`admin/recharge-requests/${id}/approve`);
    return res.data;
  },

  async rejectRecharge(id: number | string, notes?: string) {
    const res = await api.post(`admin/recharge-requests/${id}/reject`, { notes });
    return res.data;
  }
};
