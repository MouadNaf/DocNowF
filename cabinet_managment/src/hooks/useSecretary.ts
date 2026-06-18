import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import * as secretaryApi from '@/lib/api/secretary'
import type { AppointmentFilters } from '@/lib/api/secretary'

// ─── Helper ───────────────────────────────────────────────────────────────────
function useDoctorId() {
  const user = useAuthStore((s) => s.user)
  if (!user) return ''
  if (user.role === 'secretary') return user.doctorId ?? ''
  if (user.role === 'doctor') return user.id ?? ''
  return ''
}

export function useSecretaryProfile() {
  const updateUser = useAuthStore((s) => s.updateUser)
  return useQuery({
    queryKey: ['secretary', 'profile'],
    queryFn: async () => {
      const { authService } = await import('@/services/auth.service')
      const profile = await authService.fetchMe()
      updateUser(profile)
      return profile
    },
    staleTime: 60_000,
  })
}

// ─── Today's schedule ─────────────────────────────────────────────────────────
export function useTodaySchedule() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const doctorId = useDoctorId()

  return useQuery({
    queryKey: ['secretary', 'today', doctorId],
    queryFn: () => secretaryApi.getTodaySchedule(),
    enabled: isAuthenticated && user?.role === 'secretary',
    refetchInterval: 60_000,
    retry: 1,
  })
}

// ─── Appointments list with filters ───────────────────────────────────────────
export function useAppointments(filters: Omit<AppointmentFilters, 'doctor_id'> = {}) {
  const doctorId = useDoctorId()
  return useQuery({
    queryKey: ['secretary', 'appointments', doctorId, filters],
    queryFn: () => secretaryApi.getAppointments({ doctor_id: doctorId, ...filters }),
  })
}

// ─── Calendar (by date) ───────────────────────────────────────────────────────
export function useCalendar(date: string) {
  const doctorId = useDoctorId()
  return useQuery({
    queryKey: ['secretary', 'calendar', doctorId, date],
    queryFn: () => secretaryApi.getAppointments({ doctor_id: doctorId, date }),
    enabled: !!date,
  })
}

// ─── Patients ─────────────────────────────────────────────────────────────────
export function usePatients(search?: string) {
  const doctorId = useDoctorId()
  return useQuery({
    queryKey: ['secretary', 'patients', doctorId, search],
    queryFn: () => secretaryApi.getPatients(doctorId, search),
    enabled: !search || search.length >= 2,
  })
}

// ─── Actions ──────────────────────────────────────────────────────────────────
export function useMarkAsArrived() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => secretaryApi.markAsArrived(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretary'] }),
  })
}

export function useMarkAsNoShow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => secretaryApi.markAsNoShow(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretary'] }),
  })
}

export function useCancelAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      secretaryApi.cancelAppointment(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretary'] }),
  })
}

export function useRescheduleAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datetime }: { id: string; datetime: string }) =>
      secretaryApi.rescheduleAppointment(id, datetime),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['secretary'] })
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAsPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { paymentMethod: string; amount?: number; notes?: string } }) =>
      secretaryApi.markAsPaid(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretary'] }),
  })
}

export function useSaveNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) =>
      secretaryApi.saveReceptionNote(id, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretary'] }),
  })
}

// ─── Walk-in ──────────────────────────────────────────────────────────────────
export function useWalkInSlots(date: string) {
  return useQuery({
    queryKey: ['secretary', 'walk-in-slots', date],
    queryFn: () => secretaryApi.getWalkInSlots(date),
    enabled: !!date,
  })
}

export function useCreateWalkIn() {
  const qc = useQueryClient()
  const doctorId = useDoctorId()
  return useMutation({
    mutationFn: (data: Omit<secretaryApi.WalkInPayload, 'doctor_id'>) =>
      secretaryApi.createWalkIn({ ...data, doctor_id: doctorId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['secretary', 'today'] })
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// ─── Stubs (kept for backward compat) ────────────────────────────────────────
export function useWaitlist() {
  return useQuery({ queryKey: ['secretary', 'waitlist'], queryFn: secretaryApi.getWaitlist })
}
export function usePromoteWaitlist() {
  return useMutation({
    mutationFn: ({ id, slotTime }: { id: string; slotTime: string }) =>
      secretaryApi.promoteWaitlist(id, slotTime),
  })
}
export function useRemoveFromWaitlist() {
  return useMutation({ mutationFn: (id: string) => secretaryApi.removeFromWaitlist(id) })
}
export function useNotifyWaitlistPatient() {
  return useMutation({ mutationFn: (id: string) => secretaryApi.notifyWaitlistPatient(id) })
}
export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: secretaryApi.createPatient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretary', 'patients'] }),
  })
}

// ─── Treatments ───────────────────────────────────────────────────────────────
export function useSecretaryTreatments(filters: {
  search?: string
  status?: string
  page?: number
  per_page?: number
} = {}) {
  return useQuery({
    queryKey: ['secretary', 'treatments', filters],
    queryFn: () => secretaryApi.getSecretaryTreatments(filters),
  })
}

export function useSecretaryTreatment(id?: string) {
  return useQuery({
    queryKey: ['secretary', 'treatment', id],
    queryFn: () => secretaryApi.getSecretaryTreatment(id!),
    enabled: !!id,
  })
}

export function useSecretaryTreatmentStats() {
  return useQuery({
    queryKey: ['secretary', 'treatment-stats'],
    queryFn: () => secretaryApi.getSecretaryTreatmentStats(),
  })
}

export function usePatientTreatments(patientId?: string) {
  return useQuery({
    queryKey: ['secretary', 'patient-treatments', patientId],
    queryFn: () => secretaryApi.getPatientTreatments(patientId!),
    enabled: !!patientId,
  })
}

export function useScheduleTreatmentVisit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ treatmentId, payload }: {
      treatmentId: string
      payload: { date: string; time: string; notes?: string; title?: string }
    }) => secretaryApi.scheduleTreatmentVisit(treatmentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['secretary', 'treatments'] })
      qc.invalidateQueries({ queryKey: ['secretary', 'treatment'] })
      qc.invalidateQueries({ queryKey: ['secretary', 'treatment-stats'] })
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useRescheduleTreatmentVisit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ treatmentId, stepId, payload }: {
      treatmentId: string
      stepId: string
      payload: { date: string; time: string; notes?: string }
    }) => secretaryApi.rescheduleTreatmentVisit(treatmentId, stepId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretary'] }),
  })
}

export function useCancelTreatmentVisit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ treatmentId, stepId }: { treatmentId: string; stepId: string }) =>
      secretaryApi.cancelTreatmentVisit(treatmentId, stepId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretary'] }),
  })
}

export function useRecordTreatmentPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ treatmentId, payload }: {
      treatmentId: string
      payload: { amount: number; payment_method: 'cash' | 'card' | 'bank_transfer'; notes?: string }
    }) => secretaryApi.recordTreatmentPayment(treatmentId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretary'] }),
  })
}
