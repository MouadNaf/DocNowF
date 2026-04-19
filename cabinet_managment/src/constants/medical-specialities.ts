/** Stable ids + French labels (common in Algeria) for registration forms */
export const MEDICAL_SPECIALITY_OPTIONS = [
  { value: 'general_medicine', label: 'Médecine générale' },
  { value: 'cardiology', label: 'Cardiologie' },
  { value: 'dermatology', label: 'Dermatologie' },
  { value: 'endocrinology', label: 'Endocrinologie & diabétologie' },
  { value: 'gastroenterology', label: 'Gastro-entérologie' },
  { value: 'gynecology_obstetrics', label: 'Gynécologie & obstétrique' },
  { value: 'hematology', label: 'Hématologie' },
  { value: 'infectious_diseases', label: 'Maladies infectieuses' },
  { value: 'internal_medicine', label: 'Médecine interne' },
  { value: 'nephrology', label: 'Néphrologie' },
  { value: 'neurology', label: 'Neurologie' },
  { value: 'oncology', label: 'Oncologie' },
  { value: 'ophthalmology', label: 'Ophtalmologie' },
  { value: 'orthopedics', label: 'Orthopédie & traumatologie' },
  { value: 'ent', label: 'ORL' },
  { value: 'pediatrics', label: 'Pédiatrie' },
  { value: 'psychiatry', label: 'Psychiatrie' },
  { value: 'pulmonology', label: 'Pneumologie' },
  { value: 'radiology', label: 'Radiologie & imagerie médicale' },
  { value: 'rheumatology', label: 'Rhumatologie' },
  { value: 'surgery_general', label: 'Chirurgie générale' },
  { value: 'surgery_vascular', label: 'Chirurgie vasculaire' },
  { value: 'urology', label: 'Urologie' },
  { value: 'dentistry', label: 'Odontologie / stomatologie' },
  { value: 'physiotherapy', label: 'Médecine physique & réadaptation' },
  { value: 'anesthesiology', label: 'Anesthésie-réanimation' },
  { value: 'emergency', label: 'Urgences' },
  { value: 'laboratory', label: 'Biologie médicale (laboratoire)' },
] as const

export const MEDICAL_SPECIALITY_SLUGS = new Set<string>(
  MEDICAL_SPECIALITY_OPTIONS.map((o) => o.value),
)

export type MedicalSpecialitySlug = (typeof MEDICAL_SPECIALITY_OPTIONS)[number]['value']

export function medicalSpecialityLabel(slug: string): string {
  return MEDICAL_SPECIALITY_OPTIONS.find((o) => o.value === slug)?.label ?? slug
}
