import { ArrowRight, Building2, Hospital, Lock, Mail, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Divider } from '@/components/ui/Divider'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { ROLE_HOME, ROUTES } from '@/constants/routes'
import { authService } from '@/services/auth.service'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/store/auth.store'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

const roleTileClass =
  'group flex items-start gap-3 rounded-2xl border border-black/[0.04] p-4 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9E75]/40 dark:border-slate-600'

export function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: false },
  })
  const rememberMe = watch('rememberMe')

  const onSubmit = async (values: FormValues) => {
    setError('')
    try {
      const { user, token } = await authService.login(values)
      setAuth(user, token)
      if (user.status === 'pending_approval') return navigate(`${ROUTES.PENDING}?role=${user.role}`)
      if (user.status === 'pending_verification') return navigate(`${ROUTES.PENDING}?role=doctor`)
      if (user.status === 'suspended') return setError('Your account has been suspended')
      if (user.status === 'rejected') return setError('Your registration was not approved')
      navigate(ROLE_HOME[user.role])
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-form-panel mx-auto w-full .max-w-\[440px\] p-6 sm:p-8">
        <div className="mb-7 text-center">
          <h2 className="mb-1 text-[22px] font-bold tracking-tight text-gray-900 dark:text-slate-100">Welcome back</h2>
          <p className="text-sm text-gray-500 dark:text-slate-500">Sign in to your Takwit Health account to continue.</p>
        </div>
        {error && <Alert type="error" message={error} />}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email address" placeholder="you@example.com" icon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
          <PasswordInput label="Password" placeholder="Enter your password" icon={<Lock className="h-4 w-4" />} error={errors.password?.message} {...register('password')} />
          <div className="flex items-center justify-between gap-2">
            <Checkbox label="Remember me" checked={rememberMe} onChange={(v) => setValue('rememberMe', v)} />
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-xs font-semibold text-[#1D9E75] hover:underline focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75] dark:text-emerald-400"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" fullWidth loading={isSubmitting} size="lg" className="mt-2 rounded-xl">
            Sign in
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </form>
        <div className="my-6">
          <Divider />
        </div>
        <p className="mb-3 text-center text-xs text-gray-500 dark:text-slate-500">Don&apos;t have an account? Register as</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link to={ROUTES.REGISTER_DOCTOR} className={cn(roleTileClass, 'bg-[#E6F1FB] hover:border-[#185FA5]/25')}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#185FA5]/20 bg-white/90">
              <UserPlus className="h-5 w-5 text-[#0C447C]" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">Doctor</p>
              <p className="text-xs text-gray-600 dark:text-slate-400">Professional profile</p>
            </div>
          </Link>
          <Link to={ROUTES.REGISTER_CLINIC} className={cn(roleTileClass, 'bg-[#E1F5EE] hover:border-[#0F6E56]/25')}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#0F6E56]/20 bg-white/90">
              <Hospital className="h-5 w-5 text-[#085041]" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">Clinic</p>
              <p className="text-xs text-gray-600 dark:text-slate-400">Multi-doctor management</p>
            </div>
          </Link>
          <Link to={ROUTES.REGISTER_CABINET} className={cn(roleTileClass, 'bg-[#EEEDFE] hover:border-[#534AB7]/25')}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#534AB7]/20 bg-white/90">
              <Building2 className="h-5 w-5 text-[#3C3489]" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">Cabinet collectif</p>
              <p className="text-xs text-gray-600 dark:text-slate-400">Shared practice space</p>
            </div>
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
