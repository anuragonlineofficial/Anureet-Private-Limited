import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Services from './pages/Services'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import SignupFlow from './pages/signup/SignupFlow'
import PaymentStatus from './pages/PaymentStatus'
import AdminDashboard from './pages/admin/AdminDashboard'
import OperatorDashboard from './pages/operator/OperatorDashboard'
import ProtectedRoute from './components/common/ProtectedRoute'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { userData } = useAuth()

  let role = userData?.role
  if (role === 'super_admin' || role === 'owner') role = 'admin'
  if (role === 'vle') role = 'operator'

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      
      <Route path="/login" element={
        userData ? <Navigate to={role === 'admin' ? '/admin' : '/operator'} replace /> : <Login />
      } />
      
      <Route path="/signup" element={
        userData ? <Navigate to={role === 'admin' ? '/admin' : '/operator'} replace /> : <SignupFlow />
      } />
      
      <Route path="/payment-status" element={<PaymentStatus />} />
      
      <Route path="/admin/*" element={
        <ProtectedRoute requireRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/operator" element={
        <ProtectedRoute requireRole="operator">
          <OperatorDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}