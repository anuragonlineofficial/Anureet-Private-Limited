import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { userData } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const dash = userData?.role === 'admin' ? '/admin' : userData?.role === 'vle' ? '/vle' : null

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-md py-2' : 'bg-white/90 backdrop-blur py-3'
      }`}>
      <div className="container-custom flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-orange-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div className="hidden sm:block">
            <p className="font-extrabold text-blue-800 text-sm leading-tight">ANUREET</p>
            <p className="text-[10px] text-slate-500 tracking-wider">PRIVATE LIMITED</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive ? 'text-blue-700 bg-blue-50' : 'text-slate-700 hover:text-blue-700 hover:bg-slate-50'
                }`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {userData && dash ? (
            <button onClick={() => navigate(dash)} className="btn-primary hidden sm:inline-flex">
              <LayoutDashboard size={16} /> Dashboard
            </button>
          ) : (
            <Link to="/login" className="btn-primary hidden sm:inline-flex">
              <LogIn size={16} /> Login
            </Link>
          )}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-t overflow-hidden">
            <nav className="container-custom py-4 flex flex-col gap-1">
              {links.map(l => (
                <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
                  className={({ isActive }) => `px-4 py-3 rounded-xl font-semibold text-sm ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700'}`}>
                  {l.label}
                </NavLink>
              ))}
              <div className="pt-2 border-t mt-2">
                {userData && dash ? (
                  <button onClick={() => { navigate(dash); setOpen(false) }} className="btn-primary w-full">
                    <LayoutDashboard size={16} /> Dashboard
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)} className="btn-primary w-full">
                    <LogIn size={16} /> Login
                  </Link>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}