import { useEffect, useState } from 'react'
import { Plus, Trash2, Ban, Check, X, Search, Eye, CheckCircle2, Clock, Shield, UserCog } from 'lucide-react'
import toast from 'react-hot-toast'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { auth, db } from '../../services/firebase'
import { getVLEUsers, updateUser, deleteUser } from '../../services/userService'

// 🔥 Secondary Firebase app for creating users WITHOUT logging out admin
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export default function UsersManage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(false)
  const [viewUser, setViewUser] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '', role: 'operator' })
  const [confirm, setConfirm] = useState(null)
  const [creating, setCreating] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setList(await getVLEUsers()) } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // 🔥 CREATE USER - Super Admin can create any role
  const create = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.name) return toast.error('Fill required fields')
    if (form.password.length < 6) return toast.error('Password min 6 chars')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error('Invalid email')
    
    setCreating(true)
    // Create a secondary Firebase app to avoid logging out the admin
    const secondaryApp = initializeApp(firebaseConfig, 'Secondary-' + Date.now())
    const secondaryAuth = getAuth(secondaryApp)
    
    try {
      // Create user in secondary auth (doesn't affect admin session)
      const cred = await createUserWithEmailAndPassword(secondaryAuth, form.email, form.password)
      
      // Save user to Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: form.name,
        email: form.email,
        mobile: form.mobile || '',
        role: form.role,        // 'admin' or 'operator'
        status: 'active',        // Admin-created users are active immediately
        createdBy: 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      // Cleanup
      await deleteApp(secondaryApp)
      
      toast.success(`${form.role === 'admin' ? 'Admin' : 'Operator'} created successfully!`)
      setModal(false)
      setForm({ name: '', email: '', password: '', mobile: '', role: 'operator' })
      load()
    } catch (err) {
      console.error(err)
      let msg = err.message?.replace('Firebase: ', '') || 'Failed to create user'
      if (err.code === 'auth/email-already-in-use') msg = 'Email already in use'
      if (err.code === 'auth/invalid-email') msg = 'Invalid email'
      if (err.code === 'auth/weak-password') msg = 'Password too weak (min 6 chars)'
      toast.error(msg)
      try { await deleteApp(secondaryApp) } catch {}
    } finally {
      setCreating(false)
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

  // Filter & search
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
  const adminCount = list.filter(u => {
    const r = u.role
    return r === 'admin' || r === 'super_admin' || r === 'owner'
  }).length
  const operatorCount = list.filter(u => {
    const r = u.role
    return r === 'operator' || r === 'vle'
  }).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">User Management</h1>
          <p className="text-slate-600 text-sm mt-1">Create and manage all users</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus size={18} /> Create User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <UserCog className="text-blue-600" size={16} />
            </div>
            <p className="text-xs font-semibold text-slate-500">Total Users</p>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{list.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Shield className="text-purple-600" size={16} />
            </div>
            <p className="text-xs font-semibold text-slate-500">Admins</p>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{adminCount}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <UserCog className="text-emerald-600" size={16} />
            </div>
            <p className="text-xs font-semibold text-slate-500">Operators</p>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{operatorCount}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="text-amber-600" size={16} />
            </div>
            <p className="text-xs font-semibold text-slate-500">Pending</p>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{pendingCount}</p>
        </div>
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
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">No users found. Click "Create User" to add.</td></tr>
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
                ['Payment', viewUser.paymentAmount ? `₹${viewUser.paymentAmount}` : '-'],
                ['Payment ID', viewUser.paymentId],
                ['Created', viewUser.createdAt?.seconds ? new Date(viewUser.createdAt.seconds * 1000).toLocaleString() : '-']
              ].map(([label, val]) => val && (
                <div key={label}>
                  <p className="text-xs font-bold text-slate-500 uppercase">{label}</p>
                  <p className="text-slate-900 break-words">{val}</p>
                </div>
              ))}
            </div>

            <button onClick={() => setViewUser(null)} className="btn-primary w-full">Close</button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !creating && setModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New User</h2>
              {!creating && <button onClick={() => setModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>}
            </div>
            
            <form onSubmit={create} className="space-y-3">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" required />
              </div>
              <div>
                <label className="label">Email *</label>
                <input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" required />
              </div>
              <div>
                <label className="label">Password * (min 6 chars)</label>
                <input type="text" className="input font-mono" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Set password" required minLength={6} />
                <p className="text-xs text-slate-500 mt-1">Ye password user ko batana hoga login ke liye</p>
              </div>
              <div>
                <label className="label">Mobile</label>
                <input className="input" maxLength={10} value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })} placeholder="10-digit mobile" />
              </div>
              <div>
                <label className="label">Role *</label>
                <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="operator">Operator (Limited Access)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  {form.role === 'admin' 
                    ? '⚠️ Admin ko poori website ka access milega' 
                    : 'ℹ️ Operator sirf apni entries manage kar sakta hai'}
                </p>
              </div>
              
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModal(false)} disabled={creating} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary">
                  {creating ? 'Creating...' : `Create ${form.role === 'admin' ? 'Admin' : 'Operator'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Delete User?</h3>
            <p className="text-slate-600 text-sm mb-6">This will remove the user record from Firestore. Auth account will remain in Firebase.</p>
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