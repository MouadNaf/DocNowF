import api from '@/lib/api';

export interface Secretary {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  employer_id: number;
  created_at: string;
}

export interface SecretaryCreatePayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export const doctorService = {
  async getSecretaries(): Promise<Secretary[]> {
    const res = await api.get('private-cabinets/secretaries');
    return res.data;
  },

  async createSecretary(payload: SecretaryCreatePayload): Promise<Secretary> {
    const res = await api.post('private-cabinets/secretaries', payload);
    return res.data;
  },

  async deleteSecretary(secretaryId: number): Promise<void> {
    await api.delete(`private-cabinets/secretaries/${secretaryId}`);
  },

  // Toggle status might need a different approach in Laravel if not directly supported as a toggle endpoint
  async toggleSecretaryStatus(secretaryId: number): Promise<Secretary> {
    const res = await api.patch(`private-cabinets/secretaries/${secretaryId}/status`);
    return res.data;
  },

  async createCabinet(payload: any) {
    const res = await api.post('private-cabinets', payload);
    return res.data;
  },

  async getCabinet() {
    const res = await api.get('private-cabinets');
    return res.data;
  },

  async updateCabinet(id: number, payload: any) {
    const res = await api.put(`private-cabinets/${id}`, payload);
    return res.data;
  }
};
