import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, LogOut, Home, Clock, CheckCircle2, XCircle, PlusCircle } from 'lucide-react'
import { getVLEEntries } from '../../services/entryService'

export default function VLEDashboard() {
  const { userData, logout } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userData?.uid) return
    getVLEEntries(userData.uid).then(setEntries).finally(() => setLoading(false))
  }, [userData])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <aside className="lg:w-64 bg-gradient-to-b from-slate-900 to-blue-900 text-white p-6 lg:min-h-screen">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
            <span className="font-bold text-lg">A</span>
          </div>
          <div>
            <p className="font-extrabold text-sm">ANUREET</p>
            <p className="text-[10px] text-slate-300 tracking-wider">VLE PANEL</p>
          </div>
        </div>

        <nav className="space-y-1">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/15">
            <LayoutDashboard size={18} /> Dashboard
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 cursor-pointer">
            <PlusCircle size={18} /> New Entry
          </div>
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 cursor-pointer">
            <ClipboardList size={18} /> My Entries
          </div>
        </nav>

        <div className="mt-8 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:bg-white/5">
            <Home size={18} /> Back to Website
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-300 hover:bg-red-500/20">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Welcome, {userData?.name || 'VLE'}!
        </h1>
        <p className="text-slate-600 mb-8">Manage your service entries</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: entries.length, color: 'from-blue-500 to-blue-700', icon: ClipboardList },
            { label: 'Pending', value: entries.filter(e => e.status === 'pending').length, color: 'from-amber-500 to-amber-600', icon: Clock },
            { label: 'Approved', value: entries.filter(e => e.status === 'approved').length, color: 'from-emerald-500 to-emerald-700', icon: CheckCircle2 },
            { label: 'Rejected', value: entries.filter(e => e.status === 'rejected').length, color: 'from-red-500 to-red-700', icon: XCircle }
          ].map(({ label, value, color, icon: Icon }) => (
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
          <h2 className="font-bold text-lg mb-4">Recent Entries</h2>
          {loading ? (
            <p className="text-slate-500 text-sm">Loading...</p>
          ) : entries.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500 text-sm">No entries yet.</p>
            </div>
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
                  {entries.slice(0, 5).map(e => (
                    <tr key={e.id}>
                      <td className="px-4 py-3 font-medium">{e.customerName}</td>
                      <td className="px-4 py-3 text-slate-600">{e.serviceName}</td>
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
      </main>
    </div>
  )
}