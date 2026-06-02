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
import { DoctorTreatmentsPage } from '@/pages/doctor/DoctorTreatmentsPage'
import { DoctorTreatmentDetailPage } from '@/pages/doctor/DoctorTreatmentDetailPage'
import { DoctorPatientHistoryPage } from '@/pages/doctor/DoctorPatientHistoryPage'
import { DoctorAccountingPage } from '@/pages/doctor/DoctorAccountingPage'
import { DoctorStatisticsPage } from '@/pages/doctor/DoctorStatisticsPage'
import { DoctorSecretariesPage } from '@/pages/doctor/DoctorSecretariesPage'
import { DoctorSettingsPage } from '@/pages/doctor/DoctorSettingsPage'
import { DoctorProfilePage } from '@/pages/doctor/DoctorProfilePage'
import { DoctorCabinetPage } from '@/pages/doctor/DoctorCabinetPage'
import { SecretaryAppointmentsPage } from '@/pages/secretary/SecretaryAppointmentsPage'
import { SecretaryWaitingListPage } from '@/pages/secretary/SecretaryWaitingListPage'
import { SecretaryCalendarPage } from '@/pages/secretary/SecretaryCalendarPage'
import { SecretaryDashboardPage } from '@/pages/secretary/SecretaryDashboardPage'
import { SecretaryWalkInPage } from '@/pages/secretary/SecretaryWalkInPage'
import { SecretaryPatientsPage } from '@/pages/secretary/SecretaryPatientsPage'
import { SecretaryPatientDetailPage } from '@/pages/secretary/SecretaryPatientDetailPage'
import { SecretaryNewPatientPage } from '@/pages/secretary/SecretaryNewPatientPage'
import { SecretarySettingsPage } from '@/pages/secretary/SecretarySettingsPage'
import { SecretaryTreatmentsPage } from '@/pages/secretary/SecretaryTreatmentsPage'
import { SecretaryTreatmentDetailPage } from '@/pages/secretary/SecretaryTreatmentDetailPage'
import { CabinetRegisterPage } from '@/pages/register/CabinetRegisterPage'
import { ClinicRegisterPage } from '@/pages/register/ClinicRegisterPage'
import { DoctorRegisterPage } from '@/pages/register/DoctorRegisterPage'
import { RolePickerPage } from '@/pages/register/RolePickerPage'
import { ClinicLayout } from '@/widgets/layout/ClinicLayout'
import { AdminLayout } from '@/widgets/layout/AdminLayout'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminWalletPage } from '@/pages/admin/AdminWalletPage'
import { LandingPage } from '@/pages/public/LandingPage'
import { PatientLayout } from '@/widgets/layout/PatientLayout'
import { PatientDashboardPage } from '@/pages/patient/PatientDashboardPage'
import { PatientAppointmentsPage } from '@/pages/patient/PatientAppointmentsPage'
import { usePreferencesStore } from '@/store/preferences.store'
import { t } from '@/lib/i18n'

import { NotificationsPage } from '@/pages/notifications/NotificationsPage'

const ComingSoon = ({ label }: { label: string }) => {
  const language = usePreferencesStore((s) => s.language)
  return <div className="p-8">{label} - {language === 'ar' ? 'قريبا' : language === 'fr' ? 'bientot' : 'coming soon'}</div>
}

const NotFound = () => {
  const language = usePreferencesStore((s) => s.language)
  return (
    <div className="p-8">
      {t(language, 'pageNotFound')}. <Link to={ROUTES.LOGIN}>{t(language, 'backToSignIn')}</Link>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.LANDING} element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route path={ROUTES.LOGIN} element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path={ROUTES.ROLE_PICKER} element={<GuestRoute><RolePickerPage /></GuestRoute>} />
        <Route path={ROUTES.REGISTER_DOCTOR} element={<GuestRoute><DoctorRegisterPage /></GuestRoute>} />
        <Route path={ROUTES.REGISTER_CLINIC} element={<GuestRoute><ClinicRegisterPage /></GuestRoute>} />
        <Route path={ROUTES.REGISTER_CABINET} element={<GuestRoute><CabinetRegisterPage /></GuestRoute>} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path={ROUTES.RESET_PASSWORD} element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
        <Route path={ROUTES.PENDING} element={<PendingPage />} />

        {/* Global Protected Routes */}
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        {/* Doctor Routes (Reused Existing) */}
        <Route path={ROUTES.DOCTOR_DASHBOARD} element={<ProtectedRoute><DoctorDashboardPage /></ProtectedRoute>} />
        <Route path={ROUTES.DOCTOR_APPOINTMENTS} element={<ProtectedRoute><DoctorAppointmentsPage /></ProtectedRoute>} />
        <Route path={ROUTES.DOCTOR_CONSULTATION} element={<ProtectedRoute><DoctorConsultationPage /></ProtectedRoute>} />
        <Route path={ROUTES.DOCTOR_SCHEDULE} element={<ProtectedRoute><DoctorSchedulePage /></ProtectedRoute>} />
        <Route path={ROUTES.DOCTOR_PATIENTS} element={<ProtectedRoute><DoctorPatientsPage /></ProtectedRoute>} />
        <Route path={ROUTES.DOCTOR_TREATMENTS} element={<ProtectedRoute><DoctorTreatmentsPage /></ProtectedRoute>} />
        <Route path={ROUTES.DOCTOR_TREATMENT_DETAIL} element={<ProtectedRoute><DoctorTreatmentDetailPage /></ProtectedRoute>} />
        <Route path={ROUTES.DOCTOR_PATIENT_HISTORY} element={<ProtectedRoute><DoctorPatientHistoryPage /></ProtectedRoute>} />
        <Route path={ROUTES.DOCTOR_ACCOUNTING} element={<ProtectedRoute><DoctorAccountingPage /></ProtectedRoute>} />
        <Route path={ROUTES.DOCTOR_STATISTICS} element={<ProtectedRoute><DoctorStatisticsPage /></ProtectedRoute>} />
        <Route path={ROUTES.DOCTOR_SECRETARIES} element={<ProtectedRoute><DoctorSecretariesPage /></ProtectedRoute>} />
        <Route path={ROUTES.DOCTOR_SETTINGS} element={<ProtectedRoute><DoctorSettingsPage /></ProtectedRoute>} />
        <Route path={ROUTES.DOCTOR_PROFILE} element={<ProtectedRoute><DoctorProfilePage /></ProtectedRoute>} />
        <Route path={ROUTES.DOCTOR_CABINET} element={<ProtectedRoute><DoctorCabinetPage /></ProtectedRoute>} />

        {/* Secretary Routes */}
        <Route path={ROUTES.SECRETARY_DASHBOARD} element={<ProtectedRoute><SecretaryDashboardPage /></ProtectedRoute>} />
        <Route path={ROUTES.SECRETARY_APPOINTMENTS} element={<ProtectedRoute><SecretaryAppointmentsPage /></ProtectedRoute>} />
        <Route path={ROUTES.SECRETARY_WAITING} element={<ProtectedRoute><SecretaryWaitingListPage /></ProtectedRoute>} />
        <Route path={ROUTES.SECRETARY_CALENDAR} element={<ProtectedRoute><SecretaryCalendarPage /></ProtectedRoute>} />
        <Route path={ROUTES.SECRETARY_WALK_IN} element={<ProtectedRoute><SecretaryWalkInPage /></ProtectedRoute>} />
        <Route path={ROUTES.SECRETARY_PATIENTS} element={<ProtectedRoute><SecretaryPatientsPage /></ProtectedRoute>} />
        <Route path={ROUTES.SECRETARY_PATIENT_DETAIL} element={<ProtectedRoute><SecretaryPatientDetailPage /></ProtectedRoute>} />
        <Route path={ROUTES.SECRETARY_PATIENT_NEW} element={<ProtectedRoute><SecretaryNewPatientPage /></ProtectedRoute>} />
        <Route path={ROUTES.SECRETARY_TREATMENTS} element={<ProtectedRoute><SecretaryTreatmentsPage /></ProtectedRoute>} />
        <Route path={ROUTES.SECRETARY_TREATMENT_DETAIL} element={<ProtectedRoute><SecretaryTreatmentDetailPage /></ProtectedRoute>} />
        <Route path={ROUTES.SECRETARY_SETTINGS} element={<ProtectedRoute><SecretarySettingsPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path={ROUTES.ADMIN_DASHBOARD} element={<ProtectedRoute><AdminLayout><AdminDashboardPage /></AdminLayout></ProtectedRoute>} />
        <Route path={ROUTES.ADMIN_USERS} element={<ProtectedRoute><AdminLayout><AdminUsersPage /></AdminLayout></ProtectedRoute>} />
        <Route path={ROUTES.ADMIN_WALLET} element={<ProtectedRoute><AdminLayout><AdminWalletPage /></AdminLayout></ProtectedRoute>} />

        {/* Patient Routes (New) */}
        <Route path={ROUTES.PATIENT_DASHBOARD} element={<ProtectedRoute><PatientLayout><PatientDashboardPage /></PatientLayout></ProtectedRoute>} />
        <Route path={ROUTES.PATIENT_APPOINTMENTS} element={<ProtectedRoute><PatientLayout><PatientAppointmentsPage /></PatientLayout></ProtectedRoute>} />
        <Route path={ROUTES.PATIENT_FAVORITES} element={<ProtectedRoute><PatientLayout><ComingSoon label="Mes Favoris" /></PatientLayout></ProtectedRoute>} />
        <Route path={ROUTES.PATIENT_RECORDS} element={<ProtectedRoute><PatientLayout><ComingSoon label="Dossiers Médicaux" /></PatientLayout></ProtectedRoute>} />
        <Route path={ROUTES.PATIENT_NOTIFICATIONS} element={<ProtectedRoute><PatientLayout><ComingSoon label="Notifications" /></PatientLayout></ProtectedRoute>} />
        <Route path={ROUTES.PATIENT_PROFILE} element={<ProtectedRoute><PatientLayout><ComingSoon label="Profil" /></PatientLayout></ProtectedRoute>} />

        {/* Misc */}
        <Route path={ROUTES.CLINIC_DASHBOARD} element={<ProtectedRoute><ClinicLayout><ComingSoon label="Clinic Dashboard" /></ClinicLayout></ProtectedRoute>} />
        <Route path={ROUTES.CABINET_DASHBOARD} element={<ProtectedRoute><ComingSoon label="Cabinet Dashboard" /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
