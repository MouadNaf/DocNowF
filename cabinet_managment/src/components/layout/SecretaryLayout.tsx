import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { SecretarySidebar } from '@/components/layout/SecretarySidebar'
import { SecretaryTopbar } from '@/components/layout/SecretaryTopbar'
import { useAuthStore } from '@/store/auth.store'
import { ROUTES } from '@/constants/routes'

export function SecretaryLayout({ title, children }: { title: string; children: ReactNode }) {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SecretarySidebar
        onLogout={() => {
          logout()
          navigate(ROUTES.LOGIN, { replace: true })
        }}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <SecretaryTopbar title={title} />
        <main className="overflow-y-auto flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
