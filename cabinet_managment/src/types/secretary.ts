// Types for secretary API responses

export interface SecretaryAppointment {
  id: number
  status: string
  payment_status: string
  fee: number
  notes: string | null
  scheduled_at: string
  date: string
  time: string
  patient_id: number | null
  name: string | null
  phone: string | null
  gender: string | null
  arrived_at: string | null
}

export interface SecretaryPatient {
  id: number
  name: string | null
  phone: string | null
  email: string | null
  gender: string | null
  city: string | null
  visits: number
}
