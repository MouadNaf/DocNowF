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
