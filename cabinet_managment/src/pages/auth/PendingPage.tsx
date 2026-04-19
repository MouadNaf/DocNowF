import { CheckCircle2, Circle, Clock3, Mail } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/constants/routes'

const messages = {
  doctor: "Your medical license is being reviewed. We'll notify you once approved.",
  clinic: 'Your clinic registration is under review. Approval takes 24–48 hours.',
  cabinet: 'Your cabinet registration is under review. Approval takes 24–48 hours.',
}

export function PendingPage() {
  const [params] = useSearchParams()
  const role = (params.get('role') || 'doctor') as 'doctor' | 'clinic' | 'cabinet'
  const badgeConfig =
    role === 'clinic'
      ? { color: 'teal' as const, label: 'Clinic registration' }
      : role === 'cabinet'
        ? { color: 'purple' as const, label: 'Cabinet collectif' }
        : { color: 'green' as const, label: 'Doctor account' }

  return (
    <AuthLayout>
      <div className="auth-card auth-form-panel mx-auto w-full .max-w-\[440px\] p-6 sm:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FAEEDA]">
          <Clock3 className="size-7 text-[#BA7517]" aria-hidden />
        </div>
        <div className="mb-3 flex justify-center">
          <Badge color={badgeConfig.color} label={badgeConfig.label} />
        </div>
        <h1 className="mb-2 text-center text-[20px] font-semibold text-gray-900 dark:text-slate-100">Application submitted</h1>
        <p className="mb-5 text-center text-sm leading-relaxed text-gray-500 dark:text-slate-500">{messages[role]}</p>
        <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-400">Review process</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF3DE]">
                <CheckCircle2 className="size-3.5 text-[#3B6D11]" aria-hidden />
              </span>
              <p className="text-xs leading-relaxed text-gray-700 dark:text-slate-300">Application received and queued</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FAEEDA]">
                <span className="pulse-dot h-2 w-2 rounded-full bg-[#BA7517]" />
              </span>
              <p className="text-xs leading-relaxed text-gray-700 dark:text-slate-300">Admin reviews credentials (24–48 hours)</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
                <Circle className="size-3.5 text-gray-300 dark:text-slate-600" aria-hidden />
              </span>
              <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">Account activated — email &amp; SMS confirmation</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
                <Circle className="size-3.5 text-gray-300 dark:text-slate-600" aria-hidden />
              </span>
              <p className="text-xs leading-relaxed text-gray-400 dark:text-slate-500">
                {role === 'doctor'
                  ? 'Your profile goes live — patients can book you'
                  : role === 'clinic'
                    ? 'Invite doctors and go live'
                    : 'Invite member doctors and go live'}
              </p>
            </div>
          </div>
        </div>
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#BFDBFE] bg-[#E6F1FB] p-3.5 dark:border-blue-800 dark:bg-blue-950/50">
          <Mail className="mt-0.5 size-\[15px\] shrink-0 text-[#185FA5]" aria-hidden />
          <p className="text-xs leading-relaxed text-[#1E3A5F] dark:text-slate-300">Notification will be sent to your email and phone number</p>
        </div>
        <Link to={ROUTES.LOGIN} className="mb-3 block">
          <Button variant="outline" fullWidth className="rounded-xl">
            Back to sign in
          </Button>
        </Link>
        <p className="text-center text-xs text-gray-400 dark:text-slate-500">
          Questions?{' '}
          <a className="font-medium text-[#1D9E75] hover:underline dark:text-emerald-400" href="mailto:support@takwit.dz">
            Contact support
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}
