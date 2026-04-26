import api from '@/lib/api';
import type { AuthUser, LoginCredentials } from '@/types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const response = await api.post('/login', {
      email: credentials.email,
      password: credentials.password,
    });

    const { user: backendUser, token } = response.data;

    // Split name into first/last for frontend compatibility
    const nameParts = (backendUser.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const user: AuthUser = {
      id: String(backendUser.id),
      firstName,
      lastName,
      email: backendUser.email,
      role: backendUser.role,
      doctorType: (backendUser.role_data?.private_cabinet || backendUser.role_data?.privateCabinet) ? 'private_cabinet' : 'doctor_only',
      status: 'active',
      isPremium: !!backendUser.role_data?.is_active,
      phone_number: backendUser.phone_number,
      city: backendUser.city,
      address: backendUser.address,
      speciality: backendUser.role_data?.speciality,
    };

    return { user, token };
  },

  async registerDoctor(data: any, files: Record<string, File | null>) {
    const formData = new FormData();
    // Laravel common fields
    formData.append('name', `${data.firstName} ${data.lastName}`);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('password_confirmation', data.confirmPassword);
    formData.append('role', 'doctor');
    formData.append('phone_number', data.phone);
    formData.append('speciality', data.speciality);
    
    // Missing required fields in UI - providing defaults for compatibility
    formData.append('gender', data.gender || 'male');
    formData.append('city', data.city || 'Alger');
    formData.append('address', data.address || 'Adresse par défaut');
    formData.append('date_of_birth', data.date_of_birth || '1990-01-01');

    // Append files
    if (files.medical_license) formData.append('medical_license', files.medical_license);
    if (files.national_id) formData.append('national_id', files.national_id);

    const response = await api.post('/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async registerClinic(data: any, files: Record<string, File | null>) {
    const formData = new FormData();
    formData.append('name', `${data.firstName} ${data.lastName}`);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('password_confirmation', data.confirmPassword);
    formData.append('role', 'clinic');
    formData.append('phone_number', data.phone);
    formData.append('speciality', Array.isArray(data.specialities) ? data.specialities.join(',') : data.speciality);
    formData.append('city', data.wilaya || 'Alger');
    formData.append('address', data.address || 'Adresse par défaut');
    formData.append('gender', 'male'); 
    formData.append('date_of_birth', '1980-01-01');
    formData.append('clinic_name', data.clinicName);

    // Map clinic specific keys to generic backend keys
    if (files.clinic_registration) formData.append('medical_license', files.clinic_registration);
    if (files.admin_national_id) formData.append('national_id', files.admin_national_id);

    const response = await api.post('/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async registerCabinet(data: any, files: Record<string, File | null>) {
    const formData = new FormData();
    formData.append('name', `${data.firstName} ${data.lastName}`);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('password_confirmation', data.confirmPassword);
    formData.append('role', 'collective_cabinet');
    formData.append('phone_number', data.phone);
    formData.append('speciality', data.speciality);
    formData.append('city', data.wilaya || 'Alger');
    formData.append('address', data.address || 'Adresse par défaut');
    formData.append('gender', 'male');
    formData.append('date_of_birth', '1980-01-01');
    formData.append('cabinet_name', data.cabinetName);

    // Map cabinet specific keys to generic backend keys
    if (files.cabinet_registration) formData.append('medical_license', files.cabinet_registration);
    if (files.admin_national_id) formData.append('national_id', files.admin_national_id);

    const response = await api.post('/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateProfile(payload: any) {
    let data = payload;
    if (payload.profile_picture instanceof File) {
      data = new FormData();
      Object.keys(payload).forEach(key => {
        data.append(key, payload[key]);
      });
    }

    const response = await api.put('/profile', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
  },

  async fetchMe() {
    const response = await api.get('/me');
    return response.data;
  }
};
