import { Navigate } from 'react-router-dom'
import { ROLE_HOME } from '@/constants/routes'
import { useAuthStore } from '@/store/auth.store'

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated && user) return <Navigate to={ROLE_HOME[user.role]} replace />
  return <>{children}</>
}
