import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, LogOut, Home, Clock, CheckCircle2, XCircle, PlusCircle } from 'lucide-react'
import { getOperatorEntries } from '../../services/entryService'
import { getServices } from '../../services/serviceService'
import toast from 'react-hot-toast'

export default function OperatorDashboard() {
  const { userData, logout } = useAuth()
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ serviceId: '', customerName: '', mobile: '', remarks: '' })
  const [submitting, setSubmitting] = useState(false)
  const [confirm, setConfirm] = useState(null)

  const load = async () => {
    if (!userData?.uid) return
    setLoading(true)
    try {
      const [e, s] = await Promise.all([
        getOperatorEntries(userData.uid),
        getServices(true)
      ])
      setEntries(e)
      setServices(s)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => { load() }, [userData])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.serviceId || !form.customerName || !form.mobile) {
      return toast.error('Please fill all required fields')
    }
    if (!/^\d{10}$/.test(form.mobile)) return toast.error('Enter valid 10-digit mobile')
    
    setSubmitting(true)
    try {
      const selectedService = services.find(s => s.id === form.serviceId)
      const { createEntry } = await import('../../services/entryService')
      await createEntry({
        operatorId: userData.uid,
        operatorName: userData.name,
        vleId: userData.uid,
        vleName: userData.name,
        serviceId: form.serviceId,
        serviceName: selectedService?.name || '',
        category: selectedService?.category || '',
        customerName: form.customerName,
        mobile: form.mobile,
        remarks: form.remarks,
        status: 'pending'
      })
      toast.success('Entry submitted! Waiting for admin approval.')
      setShowForm(false)
      setForm({ serviceId: '', customerName: '', mobile: '', remarks: '' })
      load()
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteEntry = async () => {
    try {
      const { deleteEntry: del } = await import('../../services/entryService')
      await del(confirm)
      toast.success('Deleted')
      setConfirm(null)
      load()
    } catch { toast.error('Failed') }
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
            <p className="text-[10px] text-slate-300 tracking-wider">OPERATOR PANEL</p>
          </div>
        </div>

        <nav className="space-y-1">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/15">
            <LayoutDashboard size={18} /> Dashboard
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Welcome, {userData?.name || 'Operator'}!</h1>
            <p className="text-slate-600">Create and manage your entries</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <PlusCircle size={18} /> New Entry
          </button>
        </div>

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

        <div className="card overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg">My Entries</h2>
          </div>
          {loading ? (
            <p className="text-slate-500 text-sm p-6">Loading...</p>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 mb-4">No entries yet</p>
              <button onClick={() => setShowForm(true)} className="btn-primary btn-sm">Create Entry</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Service</th>
                    <th className="px-4 py-3 text-left">Mobile</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold">{e.customerName}</td>
                      <td className="px-4 py-3 text-slate-600">{e.serviceName}</td>
                      <td className="px-4 py-3 text-slate-600">{e.mobile}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          e.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          e.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>{e.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {e.status === 'pending' && (
                          <button onClick={() => setConfirm(e.id)} className="text-xs text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg font-semibold">
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4">New Entry</h2>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="label">Select Service *</label>
                  <select className="input" value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })} required>
                    <option value="">-- Choose Service --</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.category})</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Customer Name *</label>
                  <input className="input" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Mobile Number *</label>
                  <input className="input" maxLength={10} value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })} required />
                </div>
                <div>
                  <label className="label">Remarks</label>
                  <textarea rows={3} className="input" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                  ℹ️ Entry status will be <strong>Pending</strong>. Only Admin can approve.
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Submitting...' : 'Submit Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirm(null)}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-2">Delete Entry?</h3>
              <p className="text-slate-600 text-sm mb-6">This cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setConfirm(null)} className="btn-secondary">Cancel</button>
                <button onClick={deleteEntry} className="btn-danger">Delete</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}