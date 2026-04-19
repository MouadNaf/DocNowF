import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute } from '@/components/routing/GuestRoute'
import { ProtectedRoute } from '@/components/routing/ProtectedRoute'
import { ROUTES } from '@/constants/routes'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { PendingPage } from '@/pages/auth/PendingPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { DoctorDashboardPage } from '@/pages/doctor/DoctorDashboardPage'
import { DoctorAppointmentsPage } from '@/pages/doctor/DoctorAppointmentsPage'
import { DoctorConsultationPage } from '@/pages/doctor/DoctorConsultationPage'
import { DoctorSchedulePage } from '@/pages/doctor/DoctorSchedulePage'
import { DoctorPatientsPage } from '@/pages/doctor/DoctorPatientsPage'
import { DoctorPatientHistoryPage } from '@/pages/doctor/DoctorPatientHistoryPage'
import { DoctorAccountingPage } from '@/pages/doctor/DoctorAccountingPage'
import { DoctorStatisticsPage } from '@/pages/doctor/DoctorStatisticsPage'
import { DoctorSecretariesPage } from '@/pages/doctor/DoctorSecretariesPage'
import { DoctorSettingsPage } from '@/pages/doctor/DoctorSettingsPage'
import { SecretaryAppointmentsPage } from '@/pages/secretary/SecretaryAppointmentsPage'
import { SecretaryWaitingListPage } from '@/pages/secretary/SecretaryWaitingListPage'
import { SecretaryCalendarPage } from '@/pages/secretary/SecretaryCalendarPage'
import { CabinetRegisterPage } from '@/pages/register/CabinetRegisterPage'
import { ClinicRegisterPage } from '@/pages/register/ClinicRegisterPage'
import { DoctorRegisterPage } from '@/pages/register/DoctorRegisterPage'
import { RolePickerPage } from '@/pages/register/RolePickerPage'
import { ClinicLayout } from '@/widgets/layout/ClinicLayout'
import { AdminLayout } from '@/widgets/layout/AdminLayout'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'

const ComingSoon = ({ label }: { label: string }) => <div className="p-8">{label} - coming soon</div>
const NotFound = () => (
  <div className="p-8">
    Page not found. <Link to={ROUTES.LOGIN}>Back to sign in</Link>
  </div>
)

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path={ROUTES.PENDING} element={<PendingPage />} />
      <Route path={ROUTES.LOGIN} element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path={ROUTES.ROLE_PICKER} element={<GuestRoute><RolePickerPage /></GuestRoute>} />
      <Route path={ROUTES.REGISTER_DOCTOR} element={<GuestRoute><DoctorRegisterPage /></GuestRoute>} />
      <Route path={ROUTES.REGISTER_CLINIC} element={<GuestRoute><ClinicRegisterPage /></GuestRoute>} />
      <Route path={ROUTES.REGISTER_CABINET} element={<GuestRoute><CabinetRegisterPage /></GuestRoute>} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path={ROUTES.RESET_PASSWORD} element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
      <Route path={ROUTES.DOCTOR_DASHBOARD} element={<ProtectedRoute><DoctorDashboardPage /></ProtectedRoute>} />
      <Route path={ROUTES.DOCTOR_APPOINTMENTS} element={<ProtectedRoute><DoctorAppointmentsPage /></ProtectedRoute>} />
      <Route path={ROUTES.DOCTOR_CONSULTATION} element={<ProtectedRoute><DoctorConsultationPage /></ProtectedRoute>} />
      <Route path={ROUTES.DOCTOR_SCHEDULE} element={<ProtectedRoute><DoctorSchedulePage /></ProtectedRoute>} />
      <Route path={ROUTES.DOCTOR_PATIENTS} element={<ProtectedRoute><DoctorPatientsPage /></ProtectedRoute>} />
      <Route path={ROUTES.DOCTOR_PATIENT_HISTORY} element={<ProtectedRoute><DoctorPatientHistoryPage /></ProtectedRoute>} />
      <Route path={ROUTES.DOCTOR_ACCOUNTING} element={<ProtectedRoute><DoctorAccountingPage /></ProtectedRoute>} />
      <Route path={ROUTES.DOCTOR_STATISTICS} element={<ProtectedRoute><DoctorStatisticsPage /></ProtectedRoute>} />
      <Route path={ROUTES.DOCTOR_SECRETARIES} element={<ProtectedRoute><DoctorSecretariesPage /></ProtectedRoute>} />
      <Route path={ROUTES.DOCTOR_SETTINGS} element={<ProtectedRoute><DoctorSettingsPage /></ProtectedRoute>} />
      <Route path={ROUTES.CLINIC_DASHBOARD} element={<ProtectedRoute><ClinicLayout><ComingSoon label="Clinic Dashboard" /></ClinicLayout></ProtectedRoute>} />
      <Route path={ROUTES.CABINET_DASHBOARD} element={<ProtectedRoute><ComingSoon label="Cabinet Dashboard" /></ProtectedRoute>} />

      {/* ── Secretary ── */}
      <Route path={ROUTES.SECRETARY_DASHBOARD} element={<Navigate to={ROUTES.SECRETARY_APPOINTMENTS} replace />} />
      <Route path={ROUTES.SECRETARY_APPOINTMENTS} element={<ProtectedRoute><SecretaryAppointmentsPage /></ProtectedRoute>} />
      <Route path={ROUTES.SECRETARY_WAITING} element={<ProtectedRoute><SecretaryWaitingListPage /></ProtectedRoute>} />
      <Route path={ROUTES.SECRETARY_CALENDAR} element={<ProtectedRoute><SecretaryCalendarPage /></ProtectedRoute>} />

      <Route path={ROUTES.ADMIN_DASHBOARD} element={<ProtectedRoute><AdminLayout><AdminDashboardPage /></AdminLayout></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_USERS} element={<ProtectedRoute><AdminLayout><AdminUsersPage /></AdminLayout></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
