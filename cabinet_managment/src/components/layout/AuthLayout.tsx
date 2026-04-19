import { AuthHeroPanel } from '@/components/layout/AuthHeroPanel'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0f3d2f] lg:grid lg:grid-cols-[minmax(0,40%)_1fr] lg:bg-[#eef2f0] dark:lg:bg-slate-950">
      <AuthHeroPanel className="shrink-0 lg:min-h-0" />
      <div className="relative flex min-h-0 flex-1 flex-col bg-[#eef2f0] px-4 py-8 sm:px-6 lg:overflow-y-auto lg:px-10 lg:py-12 dark:bg-slate-950">
        <div className="flex flex-1 items-center justify-center pb-4 lg:pb-0">
          <div className="auth-shell-enter w-\[100px\] max-w-\[520px\] lg:max-w-\[560px\]">{children}</div>
        </div>
      </div>
    </div>
  )
}
