import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock, Shield, UserCog } from 'lucide-react'
import toast from 'react-hot-toast'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'admin' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user, userData, loading: authLoading } = useAuth()

  // ✅ Auto-redirect if already logged in
  useEffect(() => {
    if (authLoading) return
    if (user && userData) {
      let role = userData.role
      if (role === 'super_admin' || role === 'owner') role = 'admin'
      if (role === 'vle') role = 'operator'
      navigate(role === 'admin' ? '/admin' : '/operator', { replace: true })
    }
  }, [user, userData, authLoading, navigate])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, form.email, form.password)
      
      const snap = await getDoc(doc(db, 'users', cred.user.uid))
      if (!snap.exists()) {
        await signOut(auth)
        return toast.error('User record not found')
      }
      
      const userData = snap.data()
      let role = userData.role
      if (role === 'super_admin' || role === 'owner') role = 'admin'
      if (role === 'vle') role = 'operator'
      
      if (userData.status === 'pending') {
        await signOut(auth)
        return toast.error('Account pending approval. Admin approval ke baad login kar paoge.')
      }
      if (userData.status === 'blocked') {
        await signOut(auth)
        return toast.error('Account blocked. Contact admin.')
      }
      if (userData.status !== 'active') {
        await signOut(auth)
        return toast.error('Account not active. Contact admin.')
      }
      
      const roleMatch = (form.role === 'admin' && role === 'admin') ||
                       (form.role === 'operator' && role === 'operator')
      
      if (!roleMatch) {
        await signOut(auth)
        return toast.error(`You are not authorized as ${form.role}. Please select "${role}" tab.`)
      }
      
      toast.success('Login successful!')
      // Auto-redirect will happen via useEffect
      
    } catch (err) {
      console.error(err)
      let msg = err.message?.replace('Firebase: ', '') || 'Login failed'
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password'
      }
      if (err.code === 'auth/user-not-found') msg = 'User not found'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-600 font-semibold">Checking session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-4">ANUREET</h1>
          <p className="text-xs text-slate-500 font-semibold tracking-widest">PRIVATE LIMITED</p>
          <p className="text-slate-600 mt-4 text-sm">Sign in to continue</p>
        </div>

        <div className="card p-8">
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
            {[
              { value: 'admin', label: 'Admin', icon: Shield },
              { value: 'operator', label: 'Operator', icon: UserCog }
            ].map(({ value, label, icon: Icon }) => (
              <button key={value} type="button"
                onClick={() => setForm({ ...form, role: value })}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  form.role === value ? 'bg-white shadow text-blue-700' : 'text-slate-500'
                }`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email or Mobile</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" className="input pl-10" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email or mobile" required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" className="input pl-10" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center space-y-2">
            <p className="text-sm text-slate-600">
              Don't have an account? <Link to="/signup" className="text-blue-700 font-semibold">Sign Up (₹151)</Link>
            </p>
            <Link to="/" className="block text-sm text-slate-500 hover:text-blue-700">← Back to Home</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}