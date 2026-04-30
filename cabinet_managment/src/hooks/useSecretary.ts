import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'
import * as secretaryApi from '@/lib/api/secretary'
import type { AppointmentFilters } from '@/lib/api/secretary'

// ─── Helper ───────────────────────────────────────────────────────────────────
function useDoctorId() {
  const user = useAuthStore((s) => s.user)
  // For secretary: use their assigned doctorId from role_data
  // If not available (stale session), return empty string — backend auto-detects from auth token
  if (!user) return ''
  if (user.role === 'secretary') return user.doctorId ?? ''
  if (user.role === 'doctor') return user.id ?? ''
  return ''
}

// ─── Today's schedule ─────────────────────────────────────────────────────────
export function useTodaySchedule() {
  const doctorId = useDoctorId()
  return useQuery({
    queryKey: ['secretary', 'today', doctorId],
    queryFn: () => secretaryApi.getTodaySchedule(doctorId),
    // Fired even if doctorId is empty, backend will resolve from token if possible
    refetchInterval: 60000,
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
export function useCreateWalkIn() {
  const qc = useQueryClient()
  const doctorId = useDoctorId()
  return useMutation({
    mutationFn: (data: Omit<secretaryApi.WalkInPayload, 'doctor_id'>) =>
      secretaryApi.createWalkIn({ ...data, doctor_id: doctorId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretary', 'today'] }),
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
