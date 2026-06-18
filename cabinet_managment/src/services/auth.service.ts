import api from '@/lib/api';
import type { AuthUser, LoginCredentials } from '@/types/auth';

function mapBackendUser(backendUser: any): AuthUser {
  const nameParts = (backendUser.name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const roleData = backendUser.role_data;

  const hasPrivateCabinet = Boolean(
    roleData?.private_cabinet ||
    roleData?.privateCabinet ||
    roleData?.private_cabinet_id
  );

  return {
    id: String(backendUser.id),
    firstName,
    lastName,
    email: backendUser.email,
    role: backendUser.role,
    doctorType: hasPrivateCabinet ? 'private_cabinet' : 'doctor_only',
    status: 'active',
    isPremium: !!roleData?.is_active,
    phone_number: backendUser.phone_number,
    city: backendUser.city,
    address: backendUser.address,
    speciality: roleData?.speciality,
    avatarUrl: backendUser.profile_picture,
    doctorId: backendUser.role === 'secretary'
      ? String(roleData?.doctor_id ?? '')
      : undefined,
    assignedDoctor: backendUser.role === 'secretary' && roleData?.doctor?.user
      ? {
          name: roleData.doctor.user.name,
          speciality: roleData.doctor.speciality,
        }
      : undefined,
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const response = await api.post('/login', {
      email: credentials.email,
      password: credentials.password,
    });

    const { user: backendUser, token } = response.data;
    return { user: mapBackendUser(backendUser), token };
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

  async updateProfile(payload: any): Promise<{ success: boolean; message: string; user: AuthUser }> {
    const hasFile = payload.profile_picture instanceof File;

    if (hasFile) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value as string | Blob);
        }
      });
      // PHP/Laravel does not parse multipart bodies on PUT — use POST for file uploads.
      const response = await api.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return {
        ...response.data,
        user: mapBackendUser(response.data.user),
      };
    }

    const response = await api.put('/profile', payload);
    return {
      ...response.data,
      user: mapBackendUser(response.data.user),
    };
  },

  async fetchMe(): Promise<AuthUser> {
    const response = await api.get('/me');
    return mapBackendUser(response.data);
  }
};
