import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, MapPin } from 'lucide-react'
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
import { WILAYAS } from '@/constants/algeria'
import { MEDICAL_SPECIALITY_OPTIONS, MEDICAL_SPECIALITY_SLUGS } from '@/constants/medical-specialities'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/services/auth.service'
import { useRegistrationStore } from '@/store/registration.store'
import { Alert } from '@/components/ui/Alert'

const schema = z.object({
  firstName: z.string().min(2), lastName: z.string().min(2), email: z.string().email(),
  phone: z.string().regex(/^(\+213|0)(5|6|7)\d{8}$/), password: z.string().min(8), confirmPassword: z.string(),
  cabinetName: z.string().min(3), wilaya: z.string().min(1), address: z.string().min(4),
  speciality: z
    .string()
    .min(1, 'Select a speciality')
    .refine((s) => MEDICAL_SPECIALITY_SLUGS.has(s), { message: 'Select a valid speciality' }),
  agreedToTerms: z.literal(true),
}).refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
type V = z.infer<typeof schema>

const REQUIRED_DOC_KEYS = ['cabinet_registration', 'admin_national_id'] as const
type CabinetDocKey = (typeof REQUIRED_DOC_KEYS)[number]

export function CabinetRegisterPage() {
  const navigate = useNavigate()
  const setRole = useRegistrationStore((s) => s.setRole)
  const [documents, setDocuments] = useState<Record<CabinetDocKey, File | null>>({
    cabinet_registration: null,
    admin_national_id: null,
  })
  const [apiError, setApiError] = useState('')
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<V>({ 
    resolver: zodResolver(schema),
    defaultValues: { agreedToTerms: false as any }
  })

  const validateDocuments = () => REQUIRED_DOC_KEYS.every((k) => documents[k] !== null)
  const docUploadedCount = REQUIRED_DOC_KEYS.filter((k) => documents[k] !== null).length
  return (
    <AuthLayout>
      <div className="auth-card auth-form-panel mx-auto w-full max-w-[560px] p-6 sm:p-8">
        <Badge color="purple" label="Cabinet collectif" />
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Register your cabinet collectif</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-500">Shared space for independent doctors.</p>
        <div className="mb-5 mt-5 rounded-2xl border border-gray-200 bg-[#f4f5f4] p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="mb-2 text-xs font-medium text-gray-700 dark:text-slate-300">How cabinet collectif works</p>
          <ul className="space-y-1.5 text-xs leading-relaxed text-gray-600 dark:text-slate-400">
            <li className="flex gap-2"><span className="text-[#3B6D11]">✓</span> Each doctor manages their own schedule</li>
            <li className="flex gap-2"><span className="text-[#3B6D11]">✓</span> Shared physical space and reception</li>
            <li className="flex gap-2"><span className="text-[#3B6D11]">✓</span> Shared secretary can serve all members</li>
            <li className="flex gap-2"><span className="text-[#3B6D11]">✓</span> Each doctor bills patients separately</li>
            <li className="flex gap-2 text-gray-400 dark:text-slate-500"><span>✗</span> Admin cannot edit member doctor schedules</li>
            <li className="flex gap-2 text-gray-400 dark:text-slate-500"><span>✗</span> No shared patient records between doctors</li>
          </ul>
          <Link
            to={ROUTES.REGISTER_CLINIC}
            className="mt-3 block text-xs font-semibold text-[#1D9E75] hover:underline dark:text-emerald-400"
          >
            Need centralised control? Register as a clinic &rarr;
          </Link>
        </div>

        {apiError && (
          <div className="mb-4">
            <Alert type="error" message={apiError} />
          </div>
        )}

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(async (v) => {
            if (!validateDocuments()) {
              setApiError('Please upload all required documents')
              return
            }
            try {
              await authService.registerCabinet(v, documents)
              setRole('cabinet_admin')
              navigate(`${ROUTES.PENDING}?role=cabinet`)
            } catch (e: any) {
              setApiError(e.response?.data?.message || (e as Error).message)
            }
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
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-400">Cabinet information</p>
            <Input label="Cabinet name" icon={<Building2 className="h-4 w-4" />} error={errors.cabinetName?.message} {...register('cabinetName')} />
            <div className="mt-3">
              <Select label="Wilaya" options={WILAYAS.map((w) => ({ value: w.name, label: `${w.code} - ${w.name}` }))} placeholder="Select" error={errors.wilaya?.message} {...register('wilaya')} />
            </div>
            <div className="mt-3">
              <Input label="Address" icon={<MapPin className="h-4 w-4" />} error={errors.address?.message} {...register('address')} />
            </div>
            <div className="mt-3">
              <Select
                label="Primary speciality"
                placeholder="Select speciality"
                options={MEDICAL_SPECIALITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                error={errors.speciality?.message}
                {...register('speciality')}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">One main focus for this cabinet collectif (shown to patients).</p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-400">Documents</p>
            <p className="mb-3 text-xs text-gray-600 dark:text-slate-400">{docUploadedCount} of 2 documents</p>
            <div className="flex flex-col gap-4">
              <DocumentUpload
                label="Cabinet registration document"
                description="Official cabinet collectif registration document"
                value={documents.cabinet_registration}
                onChange={(f) => setDocuments((d) => ({ ...d, cabinet_registration: f }))}
              />
              <DocumentUpload
                label="Administrator national ID"
                description="National ID of the cabinet administrator"
                value={documents.admin_national_id}
                onChange={(f) => setDocuments((d) => ({ ...d, admin_national_id: f }))}
              />
            </div>
          </div>
          <Checkbox checked={watch('agreedToTerms')} onChange={(v) => setValue('agreedToTerms', v as true)} error={errors.agreedToTerms?.message} label="I agree to terms" />
          <Button type="submit" fullWidth loading={isSubmitting} disabled={docUploadedCount < 2} size="lg" className="mt-2 rounded-xl">
            Register cabinet collectif account
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
