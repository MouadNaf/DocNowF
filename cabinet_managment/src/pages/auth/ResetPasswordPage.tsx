import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { PasswordStrength } from '@/components/ui/PasswordStrength'
import { ROUTES } from '@/constants/routes'
import { mockResetPassword } from '@/lib/mock/auth.mock'

const schema = z.object({
  password: z.string().min(8).regex(/[A-Z]/).regex(/\d/),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()
  const [done, setDone] = useState(false)
  const { register, watch, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

  if (!token) {
    return (
      <AuthLayout>
        <div className="auth-card auth-form-panel mx-auto w-full .max-w-\[400px\] p-6 text-center sm:p-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#FCEBEB] dark:bg-red-950/40">
            <AlertCircle className="size-7 text-red-600" aria-hidden />
          </div>
          <h1 className="text-[20px] font-semibold text-gray-900 dark:text-slate-100">Invalid reset link</h1>
          <p className="mb-6 mt-1 text-sm text-gray-500 dark:text-slate-500">This link is invalid or has expired.</p>
          <Button fullWidth size="lg" className="rounded-xl" onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}>
            Request new reset link
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-form-panel mx-auto w-full .max-w-\[400px\] p-6 text-center sm:p-8">
        {!done ? (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-[20px] font-semibold text-gray-900 dark:text-slate-100">Set a new password</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-slate-500">Choose a strong password for your account.</p>
            </div>
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit(async ({ password }) => {
                await mockResetPassword(token, password)
                setDone(true)
              })}
            >
              <div className="flex flex-col gap-2">
                <PasswordInput label="Password" error={errors.password?.message} {...register('password')} />
                <PasswordStrength password={watch('password') || ''} />
              </div>
              <PasswordInput label="Confirm password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
              <Button type="submit" fullWidth loading={isSubmitting} size="lg" className="rounded-xl">
                Reset password
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF3DE] dark:bg-emerald-950/40">
              <CheckCircle2 className="size-7 text-[#1D9E75]" aria-hidden />
            </div>
            <h2 className="text-[20px] font-semibold text-gray-900 dark:text-slate-100">Password updated!</h2>
            <p className="mb-6 mt-2 text-sm text-gray-600 dark:text-slate-400">You can now sign in with your new password.</p>
            <Button fullWidth size="lg" className="rounded-xl" onClick={() => navigate(ROUTES.LOGIN)}>
              Go to sign in
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
