import { useEffect, useState } from 'react'
import { Plus, Trash2, Ban, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getVLEUsers, updateUser, deleteUser } from '../../services/userService'

export default function VLEManage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', mobile: '', address: '' })
  const [confirm, setConfirm] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const users = await getVLEUsers()
      setList(users.filter(u => u.role === 'vle'))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleStatus = async (u) => {
    await updateUser(u.id, { status: u.status === 'active' ? 'blocked' : 'active' })
    toast.success('Updated')
    load()
  }

  const remove = async () => {
    await deleteUser(confirm)
    toast.success('Deleted!')
    setConfirm(null)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">VLE Management</h1>
          <p className="text-slate-600 text-sm mt-1">Manage VLE users</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={18} /> Create VLE</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Mobile</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{u.name}</td>
                  <td className="px-4 py-3 text-slate-600 break-all">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">{u.mobile || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => toggleStatus(u)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg">
                      {u.status === 'active' ? <Ban size={16} /> : <Check size={16} />}
                    </button>
                    <button onClick={() => setConfirm(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500">No VLE users. Firebase Console se create karo.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create VLE</h2>
              <button onClick={() => setModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <p className="text-sm text-slate-500 mb-4 bg-amber-50 p-3 rounded-lg">
              ⚠️ VLE create karne ke liye Firebase Console use karo:<br />
              Authentication → Add User → UID copy karo → Firestore mein users/UID document banao with role: "vle"
            </p>
            <button onClick={() => setModal(false)} className="btn-primary w-full">OK, samajh gaya</button>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Delete VLE?</h3>
            <p className="text-slate-600 text-sm mb-6">Ye user record delete ho jayega.</p>
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