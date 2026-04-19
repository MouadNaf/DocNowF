import { Navigate } from 'react-router-dom'
import { PENDING_ROUTE, ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/store/auth.store'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated || !user) return <Navigate to={ROUTES.LOGIN} replace />
  if (user.status === 'pending_approval') return <Navigate to={PENDING_ROUTE[user.role] ?? ROUTES.PENDING} replace />
  return <>{children}</>
}
