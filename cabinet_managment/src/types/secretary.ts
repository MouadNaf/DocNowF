// Types for secretary API responses

export interface SecretaryAppointment {
  id: number
  status: string
  scheduled_at: string
  date: string
  time: string
  patient_id: number | null
  name: string | null
  phone: string | null
  gender: string | null
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
