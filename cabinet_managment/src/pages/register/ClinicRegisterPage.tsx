import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Building2, Hash, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { DocumentUpload } from '@/components/ui/DocumentUpload'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Select } from '@/components/ui/Select'
import { SpecialityMultiSelect } from '@/components/ui/SpecialityMultiSelect'
import { WILAYAS } from '@/constants/algeria'
import { MEDICAL_SPECIALITY_SLUGS } from '@/constants/medical-specialities'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/services/auth.service'
import { useRegistrationStore } from '@/store/registration.store'

const schema = z.object({
  firstName: z.string().min(2), lastName: z.string().min(2), email: z.string().email(),
  phone: z.string().regex(/^(\+213|0)(5|6|7)\d{8}$/), password: z.string().min(8), confirmPassword: z.string(),
  clinicName: z.string().min(3), wilaya: z.string().min(1), registrationNumber: z.string().min(2), address: z.string().min(4),
  specialities: z
    .array(z.string())
    .min(1, 'Select at least one speciality')
    .refine((arr) => arr.every((s) => MEDICAL_SPECIALITY_SLUGS.has(s)), {
      message: 'Invalid speciality selection',
    }),
  agreedToTerms: z.literal(true),
}).refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
type V = z.infer<typeof schema>

const REQUIRED_DOC_KEYS = ['clinic_registration', 'admin_national_id'] as const
type ClinicDocKey = (typeof REQUIRED_DOC_KEYS)[number]

export function ClinicRegisterPage() {
  const navigate = useNavigate()
  const setRole = useRegistrationStore((s) => s.setRole)
  const [documents, setDocuments] = useState<Record<ClinicDocKey, File | null>>({
    clinic_registration: null,
    admin_national_id: null,
  })
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<V>({
    resolver: zodResolver(schema),
    defaultValues: { specialities: [] },
  })
  const clinicSpecialities = watch('specialities')

  const validateDocuments = () => REQUIRED_DOC_KEYS.every((k) => documents[k] !== null)
  const docUploadedCount = REQUIRED_DOC_KEYS.filter((k) => documents[k] !== null).length
  return (
    <AuthLayout>
      <div className="auth-card auth-form-panel mx-auto w-full .max-w-\[560px\] p-6 sm:p-8">
        <Badge color="teal" label="Clinic" />
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Register your clinic</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-500">Manage doctors, schedules, and appointments centrally.</p>
        <div className="mb-5 mt-5 rounded-2xl border border-gray-200 bg-[#f4f5f4] p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="mb-3 text-xs font-medium text-gray-700 dark:text-slate-300">Clinic vs cabinet collectif</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-[#085041]">Clinic (this form)</p>
              <p className="text-xs leading-relaxed text-gray-500 dark:text-slate-500">You control doctor schedules centrally.</p>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-[#3C3489]">Cabinet collectif</p>
              <p className="text-xs leading-relaxed text-gray-500 dark:text-slate-500">Doctors stay fully independent.</p>
            </div>
          </div>
          <Link
            to={ROUTES.REGISTER_CABINET}
            className="mt-3 block text-xs font-semibold text-[#1D9E75] hover:underline dark:text-emerald-400"
          >
            Register as cabinet collectif instead &rarr;
          </Link>
        </div>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(async (v) => {
            if (!validateDocuments()) return
            await authService.registerClinic(v, documents)
            setRole('clinic')
            navigate(`${ROUTES.PENDING}?role=clinic`)
          })}
        >
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-400">Account administrator</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
            </div>
          </div>
          <Input label="Email" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <PasswordInput label="Password" error={errors.password?.message} {...register('password')} />
            <PasswordInput label="Confirm password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          </div>
          <div className="mt-1 border-t border-gray-100 pt-5 dark:border-slate-700">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-400">Clinic information</p>
            <Input label="Clinic name" icon={<Building2 className="h-4 w-4" />} error={errors.clinicName?.message} {...register('clinicName')} />
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select label="Wilaya" options={WILAYAS.map((w) => ({ value: w.name, label: `${w.code} - ${w.name}` }))} placeholder="Select" error={errors.wilaya?.message} {...register('wilaya')} />
              <Input label="Registration number" icon={<Hash className="h-4 w-4" />} hint="Official clinic registration number" error={errors.registrationNumber?.message} {...register('registrationNumber')} />
            </div>
            <div className="mt-3">
              <Input label="Address" icon={<MapPin className="h-4 w-4" />} error={errors.address?.message} {...register('address')} />
            </div>
            <div className="mt-4">
              <SpecialityMultiSelect
                label="Medical specialities"
                hint="Select every speciality your clinic offers. You can choose more than one."
                value={clinicSpecialities}
                onChange={(next) => setValue('specialities', next, { shouldValidate: true })}
                error={errors.specialities?.message}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-400">Documents</p>
            <p className="mb-3 text-xs text-gray-600 dark:text-slate-400">{docUploadedCount} of 2 documents</p>
            <div className="flex flex-col gap-4">
              <DocumentUpload
                label="Clinic registration document (RC)"
                description="Official registration from the Commerce Ministry"
                value={documents.clinic_registration}
                onChange={(f) => setDocuments((d) => ({ ...d, clinic_registration: f }))}
              />
              <DocumentUpload
                label="Administrator national ID"
                description="National ID of the clinic administrator"
                value={documents.admin_national_id}
                onChange={(f) => setDocuments((d) => ({ ...d, admin_national_id: f }))}
              />
            </div>
          </div>
          <div className="flex gap-3 rounded-xl border border-[#FAC775] bg-[#FAEEDA] p-3.5">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#BA7517]" aria-hidden />
            <div>
              <p className="text-xs font-semibold text-[#633806]">Platform review required</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[#854F0B]">Clinic registrations are reviewed within 24–48h.</p>
            </div>
          </div>
          <Checkbox checked={watch('agreedToTerms')} onChange={(v) => setValue('agreedToTerms', v as true)} error={errors.agreedToTerms?.message} label="I agree to terms" />
          <Button type="submit" fullWidth loading={isSubmitting} disabled={docUploadedCount < 2} size="lg" className="mt-2 rounded-xl">
            Register clinic account
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
