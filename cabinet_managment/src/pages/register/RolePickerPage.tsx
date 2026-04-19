import { Building2, Hospital, UserPlus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils/cn'

const Item = ({
  title,
  desc,
  icon,
  onClick,
  popular,
  iconWrapClass,
  cardClass,
}: {
  title: string
  desc: string
  icon: ReactNode
  onClick?: () => void
  popular?: boolean
  iconWrapClass: string
  cardClass: string
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'role-card relative rounded-2xl border border-black\/\[0.06] p-5 text-left shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] dark:border-slate-600 dark:shadow-none dark:hover:border-slate-500',
      cardClass,
    )}
  >
    {popular && (
      <span className="absolute right-3 top-3 rounded-full bg-[#EAF3DE] px-2 py-0.5 text-[10px] font-medium text-[#27500A]">
        Most popular
      </span>
    )}
    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${iconWrapClass}`}>{icon}</div>
    <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-slate-100">{title}</p>
    <p className="text-xs leading-relaxed text-gray-500 dark:text-slate-500">{desc}</p>
  </button>
)

export function RolePickerPage() {
  const navigate = useNavigate()
  return (
    <AuthLayout>
      <div className="auth-card auth-form-panel mx-auto w-full .max-w-\[560px\] p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-500">Choose your account type to get started</p>
        </div>
        <div className="relative mb-5 rounded-2xl border-2 border-dashed border-gray-200/90 bg-gray-50/80 p-4 opacity-60 dark:border-slate-600 dark:bg-slate-900/30">
          <span className="absolute right-3 top-3 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-slate-700 dark:text-slate-400">
            Mobile app
          </span>
          <p className="text-sm text-gray-400 dark:text-slate-500">Patient — uses the mobile app only</p>
        </div>
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Item
            title="Doctor"
            desc="Professional profile, join organisations"
            popular
            cardClass="bg-[#E6F1FB] hover:border-[#185FA5]/20"
            iconWrapClass="border border-[#185FA5]/25 bg-white/90"
            icon={<UserPlus className="h-5 w-5 text-[#0C447C]" />}
            onClick={() => navigate(ROUTES.REGISTER_DOCTOR)}
          />
          <Item
            title="Clinic"
            desc="Manage multiple doctors centrally"
            cardClass="bg-[#E1F5EE] hover:border-[#0F6E56]/20"
            iconWrapClass="border border-[#0F6E56]/25 bg-white/90"
            icon={<Hospital className="h-5 w-5 text-[#085041]" />}
            onClick={() => navigate(ROUTES.REGISTER_CLINIC)}
          />
          <Item
            title="Cabinet collectif"
            desc="Shared space, independent doctors"
            cardClass="bg-[#EEEDFE] hover:border-[#534AB7]/20"
            iconWrapClass="border border-[#534AB7]/25 bg-white/90"
            icon={<Building2 className="h-5 w-5 text-[#3C3489]" />}
            onClick={() => navigate(ROUTES.REGISTER_CABINET)}
          />
        </div>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-slate-500">
          Already have an account?{' '}
          <Link
            to={ROUTES.LOGIN}
            className="font-medium text-[#1D9E75] hover:underline focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9E75] dark:text-emerald-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
