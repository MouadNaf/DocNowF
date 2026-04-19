import { CheckCircle2, Phone, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { OTPInput } from '@/components/ui/OTPInput'
import { ROUTES } from '@/constants/routes'
import { mockVerifyOTP } from '@/lib/mock/auth.mock'
import { useRegistrationStore } from '@/store/registration.store'

export function VerifyOTPPage() {
  const navigate = useNavigate()
  const role = useRegistrationStore((s) => s.selectedRole)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setCountdown((v) => (v > 0 ? v - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])

  const goNext = () => {
    if (role === 'clinic') return navigate(ROUTES.CLINIC_DASHBOARD)
    if (role === 'cabinet') return navigate(ROUTES.CABINET_DASHBOARD)
    navigate(ROUTES.DOCTOR_DASHBOARD)
  }

  const handleVerify = async (otp = code) => {
    if (otp.length !== 6) return
    setLoading(true); setError('')
    try {
      await mockVerifyOTP(otp)
      setSuccess(true)
      setTimeout(goNext, 1200)
    } catch {
      setError('Incorrect code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="auth-card auth-form-panel mx-auto w-full .max-w-\[380px\] p-6 text-center sm:p-8">
        {!success ? (
          <>
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F1FB] dark:bg-blue-950/50">
              <Phone className="size-5 text-[#185FA5]" aria-hidden />
            </div>
            <h1 className="mb-2 text-[20px] font-semibold text-gray-900 dark:text-slate-100">Verify your phone</h1>
            <p className="mb-7 text-sm leading-relaxed text-gray-500 dark:text-slate-500">Enter the 6-digit code sent to your phone via SMS.</p>
            <div className="mb-6">
              <OTPInput onChange={setCode} onComplete={handleVerify} hasError={!!error} />
            </div>
            {error && (
              <div className="mb-4 text-left">
                <Alert type="error" message={error} />
              </div>
            )}
            <Button className="mb-5 rounded-xl" fullWidth size="lg" loading={loading} onClick={() => handleVerify()}>
              Verify code
            </Button>
            <div className="text-xs text-gray-400 dark:text-slate-500">
              {countdown > 0 ? (
                `Resend code in ${countdown}s`
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-semibold text-[#1D9E75] hover:underline focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75] dark:text-emerald-400"
                  onClick={() => setCountdown(60)}
                >
                  <RefreshCw className="size-3 shrink-0" aria-hidden />
                  Resend code
                </button>
              )}
            </div>
          </>
        ) : (
          <div>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF3DE] dark:bg-emerald-950/40">
              <CheckCircle2 className="size-7 text-[#1D9E75]" aria-hidden />
            </div>
            <h2 className="text-[20px] font-semibold text-gray-900 dark:text-slate-100">Phone verified!</h2>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
