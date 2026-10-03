import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, requireRole }) {
  const { user, userData, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  )
  if (!user || !userData) return <Navigate to="/login" replace />
  if (userData.status !== 'active') return <Navigate to="/login" replace />
  if (requireRole && userData.role !== requireRole) {
    return <Navigate to={userData.role === 'admin' ? '/admin' : '/vle'} replace />
  }
  return children
}