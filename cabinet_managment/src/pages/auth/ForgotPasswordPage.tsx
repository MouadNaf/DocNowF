import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/constants/routes'
import { mockForgotPassword } from '@/lib/mock/auth.mock'

const schema = z.object({ email: z.string().email('Invalid email address') })

export function ForgotPasswordPage() {
  const [sentEmail, setSentEmail] = useState('')
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })
  return (
    <AuthLayout>
      <div className="auth-card auth-form-panel mx-auto w-full .max-w-\[400px\] p-6 text-center sm:p-8">
        {!sentEmail ? (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F1FB] dark:bg-blue-950/50">
              <Mail className="size-7 text-[#185FA5]" aria-hidden />
            </div>
            <h1 className="mb-2 text-[20px] font-semibold text-gray-900 dark:text-slate-100">Forgot your password?</h1>
            <p className="mb-6 text-sm leading-relaxed text-gray-500 dark:text-slate-500">Enter your email and we&apos;ll send you a reset link.</p>
            <form className="text-left" onSubmit={handleSubmit(async ({ email }) => { await mockForgotPassword(email); setSentEmail(email) })}>
              <div className="flex flex-col gap-4">
                <Input label="Email" icon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
                <Button type="submit" fullWidth loading={isSubmitting} size="lg" className="rounded-xl">
                  Send reset link
                </Button>
              </div>
            </form>
            <Link
              to={ROUTES.LOGIN}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75] dark:text-slate-500 dark:hover:text-slate-300"
            >
              <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
              Back to sign in
            </Link>
          </>
        ) : (
          <div>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF3DE] dark:bg-emerald-950/40">
              <CheckCircle2 className="size-7 text-[#1D9E75]" aria-hidden />
            </div>
            <h2 className="mb-2 text-[20px] font-semibold text-gray-900 dark:text-slate-100">Check your email</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              If an account exists for <span className="font-medium text-gray-900 dark:text-slate-100">{sentEmail}</span>, you&apos;ll receive a reset link.
            </p>
            <p className="mb-6 mt-1 text-xs text-gray-400 dark:text-slate-500">Link expires in 1 hour. Check your spam folder.</p>
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setSentEmail('')
                reset()
              }}
            >
              Send again
            </Button>
            <Link
              to={ROUTES.LOGIN}
              className="mt-4 inline-block text-xs font-semibold text-[#1D9E75] hover:underline dark:text-emerald-400"
            >
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
