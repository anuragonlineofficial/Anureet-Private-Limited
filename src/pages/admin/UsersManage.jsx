import { useEffect, useState } from 'react'
import { Plus, Trash2, Ban, Check, X, Search, Eye, CheckCircle2, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../../services/firebase'
import { getVLEUsers, updateUser, deleteUser } from '../../services/userService'

export default function UsersManage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(false)
  const [viewUser, setViewUser] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '', role: 'operator' })
  const [confirm, setConfirm] = useState(null)

  const load = async () => {
    setLoading(true)
    try { setList(await getVLEUsers()) } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.name) return toast.error('Fill required fields')
    if (form.password.length < 6) return toast.error('Password min 6 chars')
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: form.name,
        email: form.email,
        mobile: form.mobile || '',
        role: form.role,
        status: 'active',  // Admin-created users are active
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      toast.success(`${form.role} created!`)
      setModal(false)
      setForm({ name: '', email: '', password: '', mobile: '', role: 'operator' })
      load()
    } catch (err) {
      let msg = err.message?.replace('Firebase: ', '') || 'Failed'
      if (err.code === 'auth/email-already-in-use') msg = 'Email already in use'
      toast.error(msg)
    }
  }

  const approveUser = async (u) => {
    await updateUser(u.id, { status: 'active', approvedAt: new Date().toISOString() })
    toast.success('User approved!')
    load()
  }

  const rejectUser = async (u) => {
    await updateUser(u.id, { status: 'rejected', rejectedAt: new Date().toISOString() })
    toast.success('User rejected')
    load()
  }

  const toggleStatus = async (u) => {
    if (u.status === 'pending') return toast.error('Pehle approve karo')
    await updateUser(u.id, { status: u.status === 'active' ? 'blocked' : 'active' })
    toast.success('Updated')
    load()
  }

  const changeRole = async (u, newRole) => {
    await updateUser(u.id, { role: newRole })
    toast.success(`Role changed to ${newRole}`)
    load()
  }

  const remove = async () => {
    await deleteUser(confirm)
    toast.success('Deleted!')
    setConfirm(null)
    load()
  }

  let filtered = list
  if (filter === 'pending') filtered = filtered.filter(u => u.status === 'pending')
  if (filter === 'active') filtered = filtered.filter(u => u.status === 'active')
  if (filter === 'blocked') filtered = filtered.filter(u => u.status === 'blocked')

  filtered = filtered.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.mobile?.includes(search) ||
    u.shopName?.toLowerCase().includes(search.toLowerCase())
  )

  const pendingCount = list.filter(u => u.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">User Management</h1>
          <p className="text-slate-600 text-sm mt-1">Approve pending accounts, manage users</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus size={18} /> Create User
        </button>
      </div>

      {pendingCount > 0 && (
        <div className="card p-4 bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-800 flex items-center gap-2">
            <Clock size={18} /> <strong>{pendingCount}</strong> pending approval(s) — Please review
          </p>
        </div>
      )}

      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="input pl-10" placeholder="Search by name, email, mobile, shop..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'active', 'blocked'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
              {f.toUpperCase()} ({f === 'all' ? list.length : list.filter(u => u.status === f).length})
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Shop / Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Mobile</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(u => {
                let role = u.role
                if (role === 'super_admin' || role === 'owner') role = 'admin'
                if (role === 'vle') role = 'operator'
                
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{u.shopName || u.name}</p>
                      {u.shopName && <p className="text-xs text-slate-500">{u.name}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 break-all">{u.email}</td>
                    <td className="px-4 py-3 text-slate-600">{u.mobile || '-'}</td>
                    <td className="px-4 py-3">
                      <select value={role} onChange={e => changeRole(u, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-lg font-semibold border-0 cursor-pointer ${
                          role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        <option value="admin">Admin</option>
                        <option value="operator">Operator</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        u.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        u.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{u.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {u.status === 'pending' && (
                        <>
                          <button onClick={() => approveUser(u)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Approve">
                            <CheckCircle2 size={16} />
                          </button>
                          <button onClick={() => rejectUser(u)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Reject">
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <button onClick={() => setViewUser(u)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="View">
                        <Eye size={16} />
                      </button>
                      {u.status !== 'pending' && (
                        <button onClick={() => toggleStatus(u)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg" title="Toggle">
                          {u.status === 'active' ? <Ban size={16} /> : <Check size={16} />}
                        </button>
                      )}
                      <button onClick={() => setConfirm(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewUser(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">User Details</h2>
              <button onClick={() => setViewUser(null)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {viewUser.photoUrl && (
                <div className="md:col-span-2">
                  <img src={viewUser.photoUrl} alt="User" className="w-32 h-32 rounded-xl object-cover" />
                </div>
              )}
              {[
                ['Shop Name', viewUser.shopName],
                ['Name', viewUser.name],
                ['Father\'s Name', viewUser.fathersName],
                ['Mobile', viewUser.mobile],
                ['Email', viewUser.email],
                ['Full Address', viewUser.fullAddress],
                ['Shop Address', viewUser.shopAddress],
                ['Role', viewUser.role],
                ['Status', viewUser.status],
                ['KYC Done', viewUser.kycDone ? 'Yes' : 'No'],
                ['Payment', viewUser.paymentAmount ? `₹${viewUser.paymentAmount}` : '-'],
                ['Payment ID', viewUser.paymentId]
              ].map(([label, val]) => val && (
                <div key={label}>
                  <p className="text-xs font-bold text-slate-500 uppercase">{label}</p>
                  <p className="text-slate-900 break-words">{val}</p>
                </div>
              ))}
            </div>

            {viewUser.aadharFrontUrl && (
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Aadhaar Front</p>
                <img src={viewUser.aadharFrontUrl} alt="Aadhaar Front" className="w-full max-w-xs rounded-xl" />
              </div>
            )}

            <button onClick={() => setViewUser(null)} className="btn-primary w-full">Close</button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create User</h2>
              <button onClick={() => setModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={create} className="space-y-3">
              <div><label className="label">Full Name *</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div><label className="label">Email *</label><input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
              <div><label className="label">Password *</label><input type="password" className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
              <div><label className="label">Mobile</label><input className="input" maxLength={10} value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })} /></div>
              <div>
                <label className="label">Role</label>
                <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="operator">Operator (Limited Access)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Delete User?</h3>
            <p className="text-slate-600 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirm(null)} className="btn-secondary">Cancel</button>
              <button onClick={remove} className="btn-danger">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}