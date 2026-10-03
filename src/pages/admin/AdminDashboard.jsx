import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link, Routes, Route, NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, ClipboardList, LogOut, Home, Clock, CheckCircle2, XCircle, TrendingUp, Tags } from 'lucide-react'
import { getAllEntries } from '../../services/entryService'
import { getServices } from '../../services/serviceService'
import { getVLEUsers } from '../../services/userService'
import ServicesManage from './ServicesManage'
import CategoriesManage from './CategoriesManage'
import EntriesManage from './EntriesManage'
import UsersManage from './UsersManage'

function DashboardOverview() {
  const { userData } = useAuth()
  const [stats, setStats] = useState({ services: 0, users: 0, entries: 0, pending: 0, approved: 0, rejected: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAllEntries(), getServices(), getVLEUsers()])
      .then(([entries, services, users]) => {
        setStats({
          services: services.length,
          users: users.length,
          entries: entries.length,
          pending: entries.filter(e => e.status === 'pending').length,
          approved: entries.filter(e => e.status === 'approved').length,
          rejected: entries.filter(e => e.status === 'rejected').length
        })
        setRecent(entries.slice(0, 5))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    { label: 'Total Services', value: stats.services, icon: FileText, color: 'from-blue-500 to-blue-700' },
    { label: 'Total Users', value: stats.users, icon: Users, color: 'from-orange-500 to-orange-600' },
    { label: 'Total Entries', value: stats.entries, icon: ClipboardList, color: 'from-indigo-500 to-indigo-700' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-amber-500 to-amber-600' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-700' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-red-700' }
  ]

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Welcome, {userData?.name || 'Admin'}!
        </h1>
        <p className="text-slate-600">Full control of your website</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="text-white" size={18} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-blue-600" /> Recent Entries
        </h2>
        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : recent.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map(e => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 font-medium">{e.customerName || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-600">{e.serviceName || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        e.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        e.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default function AdminDashboard() {
  const { userData, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/services', label: 'Services', icon: FileText },
    { to: '/admin/categories', label: 'Categories', icon: Tags },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/entries', label: 'All Entries', icon: ClipboardList }
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-900 to-blue-900 text-white transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
              <span className="font-bold text-lg">A</span>
            </div>
            <div>
              <p className="font-extrabold text-sm">ANUREET</p>
              <p className="text-[10px] text-slate-300 tracking-wider">ADMIN PANEL</p>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {navLinks.map(l => (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                    isActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/5'
                  }`}>
                <l.icon size={18} /> {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="space-y-2 pt-4 border-t border-white/10">
            <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:bg-white/5">
              <Home size={18} /> Back to Website
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-300 hover:bg-red-500/20">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 min-w-0">
        <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
            <LayoutDashboard size={22} />
          </button>
          <p className="font-bold">ANUREET ADMIN</p>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-white font-bold">
            {userData?.name?.[0]?.toUpperCase() || 'A'}
          </div>
        </header>

        <div className="p-6 lg:p-8">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="services" element={<ServicesManage />} />
            <Route path="categories" element={<CategoriesManage />} />
            <Route path="users" element={<UsersManage />} />
            <Route path="entries" element={<EntriesManage />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}