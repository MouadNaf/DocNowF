import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as secretaryApi from '@/lib/api/secretary'

export function useTodaySchedule() {
  return useQuery({
    queryKey: ['secretary', 'today'],
    queryFn: secretaryApi.getTodaySchedule,
    refetchInterval: 60000,
  })
}

export function useMarkAsArrived() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => secretaryApi.markAsArrived(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretary', 'today'] }),
  })
}

export function useMarkAsPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { paymentMethod: 'cash' | 'card' | 'ccp' | 'virement'; notes?: string } }) =>
      secretaryApi.markAsPaid(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['secretary', 'today'] })
      qc.invalidateQueries({ queryKey: ['secretary', 'appointments'] })
    },
  })
}

export function useMarkAsNoShow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => secretaryApi.markAsNoShow(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretary', 'today'] }),
  })
}

export function useCancelAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => secretaryApi.cancelAppointment(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['secretary', 'today'] })
      qc.invalidateQueries({ queryKey: ['secretary', 'appointments'] })
    },
  })
}

export function useCreateWalkIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: secretaryApi.createWalkIn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretary', 'today'] }),
  })
}

export function useWaitlist() {
  return useQuery({
    queryKey: ['secretary', 'waitlist'],
    queryFn: secretaryApi.getWaitlist,
    refetchInterval: 30000,
  })
}

export function usePromoteWaitlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, slotTime }: { id: string; slotTime: string }) => secretaryApi.promoteWaitlist(id, slotTime),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['secretary', 'waitlist'] })
      qc.invalidateQueries({ queryKey: ['secretary', 'today'] })
    },
  })
}

export function useRemoveFromWaitlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => secretaryApi.removeFromWaitlist(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretary', 'waitlist'] }),
  })
}

export function useNotifyWaitlistPatient() {
  return useMutation({
    mutationFn: (id: string) => secretaryApi.notifyWaitlistPatient(id),
  })
}

export function usePatients(search?: string) {
  return useQuery({
    queryKey: ['secretary', 'patients', search],
    queryFn: () => secretaryApi.getPatients(search),
    enabled: !search || search.length >= 2,
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: secretaryApi.createPatient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['secretary', 'patients'] }),
  })
}
