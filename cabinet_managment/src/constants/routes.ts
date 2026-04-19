export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PENDING: '/pending',
  ROLE_PICKER: '/register',
  REGISTER_DOCTOR: '/register/doctor',
  REGISTER_PRIVATE_CABINET: '/register/private-cabinet',
  REGISTER_CLINIC: '/register/clinic',
  REGISTER_CABINET: '/register/cabinet',
  DOCTOR_DASHBOARD: '/doctor/dashboard',
  DOCTOR_APPOINTMENTS: '/doctor/appointments',
  DOCTOR_CONSULTATION: '/doctor/consultation/:id',
  DOCTOR_PATIENT_HISTORY: '/doctor/patients/:id',
  DOCTOR_SCHEDULE: '/doctor/schedule',
  DOCTOR_PATIENTS: '/doctor/patients',
  DOCTOR_ACCOUNTING: '/doctor/accounting',
  DOCTOR_STATISTICS: '/doctor/statistics',
  DOCTOR_SECRETARIES: '/doctor/secretaries',
  DOCTOR_SETTINGS: '/doctor/settings',
  SECRETARY_DASHBOARD: '/secretary/dashboard',
  SECRETARY_APPOINTMENTS: '/secretary/appointments',
  SECRETARY_WAITING: '/secretary/waiting-list',
  SECRETARY_CALENDAR: '/secretary/calendar',
  CLINIC_DASHBOARD: '/clinic-admin/dashboard',
  CABINET_DASHBOARD: '/cabinet-admin/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
} as const

export const ROLE_HOME: Record<string, string> = {
  doctor: ROUTES.DOCTOR_DASHBOARD,
  clinic_admin: ROUTES.CLINIC_DASHBOARD,
  cabinet_admin: ROUTES.CABINET_DASHBOARD,
  secretary: ROUTES.SECRETARY_APPOINTMENTS,
  platform_admin: ROUTES.ADMIN_DASHBOARD,
}

export const PENDING_ROUTE: Record<string, string> = {
  doctor: `${ROUTES.PENDING}?role=doctor`,
  clinic_admin: `${ROUTES.PENDING}?role=clinic`,
  cabinet_admin: `${ROUTES.PENDING}?role=cabinet`,
}
