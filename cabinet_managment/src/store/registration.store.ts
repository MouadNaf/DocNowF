import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AffilOption, DoctorType, InviteValidation } from '@/types/auth'

type SelectedRole = 'doctor' | 'clinic' | 'cabinet' | 'private_cabinet' | null

interface RegistrationState {
  selectedRole: SelectedRole
  doctorType: DoctorType | null
  affilOption: AffilOption
  invitationCode: string
  inviteValidation: InviteValidation | null
  onboardingStep: number
  setRole: (role: SelectedRole) => void
  setDoctorType: (type: DoctorType | null) => void
  setAffilOption: (option: AffilOption) => void
  setInvitationCode: (code: string) => void
  setInviteValidation: (value: InviteValidation | null) => void
  setOnboardingStep: (step: number) => void
  reset: () => void
}

const initial = {
  selectedRole: null,
  doctorType: null,
  affilOption: 'none' as AffilOption,
  invitationCode: '',
  inviteValidation: null,
  onboardingStep: 1,
}

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set) => ({
      ...initial,
      setRole: (role) => set({ selectedRole: role }),
      setDoctorType: (doctorType) => set({ doctorType }),
      setAffilOption: (affilOption) => set({ affilOption }),
      setInvitationCode: (invitationCode) => set({ invitationCode }),
      setInviteValidation: (inviteValidation) => set({ inviteValidation }),
      setOnboardingStep: (onboardingStep) => set({ onboardingStep }),
      reset: () => set(initial),
    }),
    { name: 'takwit_registration' },
  ),
)
