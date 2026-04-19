import api from '@/lib/api';
import type { AuthUser, LoginCredentials } from '@/types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    // Backend expects x-www-form-urlencoded for OAuth2
    const params = new URLSearchParams();
    params.append('username', credentials.email);
    params.append('password', credentials.password);

    const response = await api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, role, user_id, status, full_name } = response.data;

    // Build full name into first/last
    const nameParts = (full_name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const user: AuthUser = {
      id: String(user_id ?? '0'),
      firstName,
      lastName,
      email: credentials.email,
      role: (role as string).toLowerCase() as any,
      status: (status as string).toLowerCase() as any,
    };

    return { user, token: access_token };
  },

  async registerDoctor(data: any, files: Record<string, File | null>) {
    const formData = new FormData();
    // Append fields
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    // Append files
    Object.keys(files).forEach(key => {
      if (files[key]) formData.append(key, files[key] as File);
    });

    const response = await api.post('/auth/register/doctor', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async registerClinic(data: any, files: Record<string, File | null>) {
    const formData = new FormData();
    // Specialities needs to be stringified or handled as multiple fields
    const { specialities, ...rest } = data;
    Object.keys(rest).forEach(key => {
      formData.append(key, rest[key]);
    });
    formData.append('specialities', JSON.stringify(specialities));

    // Append files
    Object.keys(files).forEach(key => {
      if (files[key]) formData.append(key, files[key] as File);
    });

    const response = await api.post('/auth/register/clinic', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async registerCabinet(data: any, files: Record<string, File | null>) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    // Append files
    Object.keys(files).forEach(key => {
      if (files[key]) formData.append(key, files[key] as File);
    });

    const response = await api.post('/auth/register/cabinet', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
};
