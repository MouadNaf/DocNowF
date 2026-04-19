import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Check, ChevronLeft, Mail, Phone } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { DocumentUpload } from '@/components/ui/DocumentUpload'
import { Divider } from '@/components/ui/Divider'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { PasswordStrength } from '@/components/ui/PasswordStrength'
import { Select } from '@/components/ui/Select'
import { MEDICAL_SPECIALITY_OPTIONS, MEDICAL_SPECIALITY_SLUGS } from '@/constants/medical-specialities'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/services/auth.service'
import { cn } from '@/lib/utils/cn'
import { useRegistrationStore } from '@/store/registration.store'

const schema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^(\+213|0)(5|6|7)\d{8}$/, 'Enter a valid Algerian phone'),
  speciality: z
    .string()
    .min(1, 'Select a speciality')
    .refine((s) => MEDICAL_SPECIALITY_SLUGS.has(s), { message: 'Select a valid speciality' }),
  password: z.string().min(8).regex(/[A-Z]/).regex(/\d/),
  confirmPassword: z.string(),
  agreedToTerms: z.literal(true),
}).refine((d) => d.confirmPassword === d.password, { path: ['confirmPassword'], message: 'Passwords do not match' })
type FormValues = z.infer<typeof schema>

const REQUIRED_DOC_KEYS = ['medical_license', 'national_id'] as const
type DoctorDocKey = (typeof REQUIRED_DOC_KEYS)[number]

const STEP_LABELS = ['', 'Personal', 'Account', 'Professional'] as const

export function DoctorRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [apiError, setApiError] = useState('')
  const [documents, setDocuments] = useState<Record<DoctorDocKey, File | null>>({
    medical_license: null,
    national_id: null,
  })
  const setRole = useRegistrationStore((s) => s.setRole)
  const setDoctorType = useRegistrationStore((s) => s.setDoctorType)
  const { register, watch, setValue, handleSubmit, trigger, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { speciality: '' },
  })
  const agreed = watch('agreedToTerms')
  const passwordWatch = watch('password')

  const validateDocuments = () => REQUIRED_DOC_KEYS.every((k) => documents[k] !== null)
  const docUploadedCount = REQUIRED_DOC_KEYS.filter((k) => documents[k] !== null).length

  const onSubmit = async (values: FormValues) => {
    if (!validateDocuments()) {
      setApiError('Please upload all required documents')
      return
    }
    try {
      await authService.registerDoctor(values, documents)
      setRole('doctor')
      setDoctorType('doctor_only')
      navigate(`${ROUTES.PENDING}?role=doctor`)
    } catch (e) {
      setApiError((e as Error).message)
    }
  }

  const goNext = async () => {
    setApiError('')
    if (step === 1) {
      const ok = await trigger(['firstName', 'lastName', 'email', 'phone', 'speciality'])
      if (ok) setStep(2)
      return
    }
    if (step === 2) {
      const ok = await trigger(['password', 'confirmPassword'])
      if (ok) setStep(3)
    }
  }

  const goBack = () => {
    setApiError('')
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s))
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-form-panel mx-auto w-full max-w-[560px] p-6 sm:p-8">
        <Badge color="blue" label="Doctor registration" />
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Create your doctor account</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-500">
          Step {step} of 3 — {STEP_LABELS[step]}
        </p>

        <nav className="mt-6" aria-label="Registration progress">
          <ol className="flex items-center">
            {([1, 2, 3] as const).map((n, idx) => (
              <li key={n} className="flex min-w-0 flex-1 items-center last:flex-none last:basis-auto">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                      step > n && 'bg-[#1D9E75] text-white',
                      step === n && 'bg-[#1D9E75] text-white shadow-[0_0_0_4px_rgba(29,158,117,0.2)]',
                      step < n && 'border-2 border-gray-200 bg-white text-gray-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500',
                    )}
                  >
                    {step > n ? <Check className="size-4" strokeWidth={3} aria-hidden /> : n}
                  </div>
                  <span className="hidden text-[10px] font-medium text-gray-500 sm:block dark:text-slate-400">
                    {STEP_LABELS[n]}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={cn('mx-1 h-0.5 min-w-[8px] flex-1 rounded-full sm:mx-2', step > n ? 'bg-[#1D9E75]' : 'bg-gray-200 dark:bg-slate-600')}
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>

        {apiError && (
          <div className="mt-4">
            <Alert type="error" message={apiError} />
          </div>
        )}

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={cn(step !== 1 && 'hidden')} aria-hidden={step !== 1}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="Email address" icon={<Mail className="h-4 w-4" />} placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <div>
              <Input label="Phone number" icon={<Phone className="h-4 w-4" />} error={errors.phone?.message} {...register('phone')} />
              <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">+213 prefix added automatically</p>
            </div>
            <Select
              label="Speciality"
              placeholder="Select speciality"
              options={MEDICAL_SPECIALITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              error={errors.speciality?.message}
              {...register('speciality')}
            />
            <Button type="button" fullWidth size="lg" className="mt-2 rounded-xl" onClick={goNext}>
              Continue
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>

          <div className={cn(step !== 2 && 'hidden')} aria-hidden={step !== 2}>
            <PasswordInput label="Password" error={errors.password?.message} {...register('password')} />
            <div className="-mt-1">
              <PasswordStrength password={passwordWatch || ''} />
            </div>
            <PasswordInput label="Confirm password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" className="rounded-xl sm:order-1 sm:w-auto" onClick={goBack}>
                <ChevronLeft className="size-4" aria-hidden />
                Back
              </Button>
              <Button type="button" fullWidth size="lg" className="rounded-xl sm:order-2 sm:max-w-[240px] sm:flex-1" onClick={goNext}>
                Continue
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </div>
          </div>

          <div className={cn(step !== 3 && 'hidden')} aria-hidden={step !== 3}>
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

            <div className="mt-1">
              <Checkbox
                checked={agreed}
                onChange={(v) => setValue('agreedToTerms', v as true)}
                error={errors.agreedToTerms?.message}
                label={
                  <span>
                    I agree to the{' '}
                    <Link className="font-medium text-[#1D9E75] hover:underline dark:text-emerald-400" to="/terms">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link className="font-medium text-[#1D9E75] hover:underline dark:text-emerald-400" to="/privacy">
                      Privacy Policy
                    </Link>
                  </span>
                }
              />
            </div>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" className="rounded-xl sm:w-auto" onClick={goBack}>
                <ChevronLeft className="size-4" aria-hidden />
                Back
              </Button>
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isSubmitting}
                disabled={docUploadedCount < 2}
                className="rounded-xl sm:max-w-none sm:flex-1"
              >
                Create doctor account
              </Button>
            </div>
          </div>
        </form>

        <div className="my-6">
          <Divider />
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-slate-500">
          Already have an account?{' '}
          <Link
            className="font-medium text-[#1D9E75] hover:underline focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75] dark:text-emerald-400"
            to={ROUTES.LOGIN}
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
