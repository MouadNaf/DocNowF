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
    const res = await api.get('doctor/secretaries');
    return res.data;
  },

  async createSecretary(payload: SecretaryCreatePayload): Promise<Secretary> {
    const res = await api.post('doctor/secretaries', payload);
    return res.data;
  },

  async toggleSecretaryStatus(secretaryId: number): Promise<Secretary> {
    const res = await api.patch(`doctor/secretaries/${secretaryId}/status`);
    return res.data;
  },

  async deleteSecretary(secretaryId: number): Promise<void> {
    await api.delete(`doctor/secretaries/${secretaryId}`);
  },
};
