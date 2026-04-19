import { zodResolver } from '@hookform/resolvers/zod'
import { Building2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DocumentUpload } from '@/components/ui/DocumentUpload'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Select } from '@/components/ui/Select'
import { MEDICAL_SPECIALITY_OPTIONS, MEDICAL_SPECIALITY_SLUGS } from '@/constants/medical-specialities'
import { ROUTES } from '@/constants/routes'
import { mockRegisterDoctor } from '@/lib/mock/auth.mock'
import { useRegistrationStore } from '@/store/registration.store'

const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^(\+213|0)(5|6|7)\d{8}$/, 'Enter a valid Algerian phone'),
  password: z.string().min(8).regex(/[A-Z]/).regex(/\d/),
  confirmPassword: z.string(),
  cabinetName: z.string().min(3),
  speciality: z
    .string()
    .min(1, 'Select a speciality')
    .refine((s) => MEDICAL_SPECIALITY_SLUGS.has(s), { message: 'Select a valid speciality' }),
}).refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
type FormValues = z.infer<typeof schema>

const REQUIRED_DOC_KEYS = ['medical_license', 'national_id'] as const
type DoctorDocKey = (typeof REQUIRED_DOC_KEYS)[number]

export function PrivateCabinetRegisterPage() {
  const navigate = useNavigate()
  const setRole = useRegistrationStore((s) => s.setRole)
  const setDoctorType = useRegistrationStore((s) => s.setDoctorType)
  const [documents, setDocuments] = useState<Record<DoctorDocKey, File | null>>({
    medical_license: null,
    national_id: null,
  })
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const validateDocuments = () => REQUIRED_DOC_KEYS.every((k) => documents[k] !== null)
  const docUploadedCount = REQUIRED_DOC_KEYS.filter((k) => documents[k] !== null).length
  return (
    <AuthLayout>
      <div className="auth-card auth-form-panel mx-auto w-full max-w-[520px] p-6 sm:p-8">
        <Badge color="green" label="Doctor with private cabinet" />
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Create your private cabinet</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-500">Your own bookable page. Patients find and book you directly.</p>
        <div className="mb-5 mt-5 flex flex-col gap-3 rounded-2xl bg-[#E6F1FB] p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-[#0C447C]">Work inside a clinic?</p>
            <p className="mt-0.5 text-xs text-[#185FA5]">Register as doctor only and join an organisation</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-auto rounded-xl border-[#185FA5] px-3 py-1.5 text-xs text-[#0C447C] hover:bg-white/60 dark:hover:bg-slate-800/60"
            onClick={() => navigate(ROUTES.REGISTER_DOCTOR)}
          >
            Switch &rarr;
          </Button>
        </div>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(async (v) => {
            if (!validateDocuments()) return
            await mockRegisterDoctor(v)
            setRole('private_cabinet')
            setDoctorType('private_cabinet')
            navigate(`${ROUTES.PENDING}?role=doctor`)
          })}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
          </div>
          <Input label="Email" error={errors.email?.message} {...register('email')} />
          <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          <PasswordInput label="Password" error={errors.password?.message} {...register('password')} />
          <PasswordInput label="Confirm password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <div className="border-t border-gray-100 pt-4 dark:border-slate-700">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-400">Your private cabinet</p>
            <Input
              label="Cabinet name"
              icon={<Building2 className="h-4 w-4" />}
              placeholder="Cabinet Dr. Amrani — Cardiologie"
              hint="Shown to patients on the booking page"
              error={errors.cabinetName?.message}
              {...register('cabinetName')}
            />
            <div className="mt-3">
              <Select
                label="Primary speciality"
                placeholder="Select speciality"
                options={MEDICAL_SPECIALITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                error={errors.speciality?.message}
                {...register('speciality')}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">Your main medical focus for this cabinet (one speciality).</p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-400">Documents</p>
            <p className="mb-3 text-xs text-gray-600 dark:text-slate-400">{docUploadedCount} of 2 documents</p>
            <div className="flex flex-col gap-4">
              <DocumentUpload
                label="Medical license (Ordre des médecins)"
                description="Official license issued by the national medical order"
                value={documents.medical_license}
                onChange={(f) => setDocuments((d) => ({ ...d, medical_license: f }))}
              />
              <DocumentUpload
                label="National ID (Carte nationale)"
                description="Front and back of your national identity card"
                value={documents.national_id}
                onChange={(f) => setDocuments((d) => ({ ...d, national_id: f }))}
              />
            </div>
          </div>
          <Button type="submit" fullWidth loading={isSubmitting} disabled={docUploadedCount < 2} size="lg" className="mt-2 rounded-xl">
            Create private cabinet account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-500">
          Already have an account?{' '}
          <Link
            to={ROUTES.LOGIN}
            className="font-medium text-[#1D9E75] hover:underline dark:text-emerald-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
