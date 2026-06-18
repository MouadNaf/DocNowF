export type Role =
  | 'doctor'
  | 'clinic_admin'
  | 'cabinet_admin'
  | 'secretary'
  | 'platform_admin'

export type DoctorType = 'doctor_only' | 'private_cabinet'

export type AccountStatus =
  | 'pending_verification'
  | 'pending_approval'
  | 'active'
  | 'suspended'
  | 'rejected'

export type OrgType = 'clinic' | 'cabinet_collectif'
export type AffilOption = 'none' | 'clinic' | 'cabinet'

export interface AuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  doctorType?: DoctorType
  status: AccountStatus
  avatarUrl?: string
  isPremium?: boolean
  phone_number?: string
  city?: string
  address?: string
  speciality?: string
  doctorId?: string   // populated for secretary role (their assigned doctor)
  assignedDoctor?: {
    name: string
    speciality?: string
  }
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface InviteValidation {
  orgName: string
  orgType: OrgType
  wilaya: string
}

export interface ApiError {
  message: string
  field?: string
}
