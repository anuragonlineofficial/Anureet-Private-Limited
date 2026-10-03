import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Trash2, Eye, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllEntries, updateEntryStatus, deleteEntry } from '../../services/entryService'

const statusFilters = ['all', 'pending', 'approved', 'rejected']

export default function EntriesManage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [view, setView] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const load = async () => {
    setLoading(true)
    try { setEntries(await getAllEntries()) } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const setStatus = async (id, status) => {
    await updateEntryStatus(id, status)
    toast.success(`Marked as ${status}`)
    load()
  }

  const remove = async () => {
    await deleteEntry(confirm)
    toast.success('Deleted!')
    setConfirm(null)
    load()
  }

  const filtered = entries.filter(e => {
    if (filter !== 'all' && e.status !== filter) return false
    const s = search.toLowerCase()
    return e.customerName?.toLowerCase().includes(s) ||
           e.mobile?.includes(s) ||
           e.serviceName?.toLowerCase().includes(s)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">All Entries</h1>
        <p className="text-slate-600 text-sm mt-1">Review, approve, reject entries</p>
      </div>

      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="input pl-10" placeholder="Search entries..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}>
              {f.toUpperCase()} ({f === 'all' ? entries.length : entries.filter(e => e.status === f).length})
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
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
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{e.customerName || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-600">{e.serviceName}</td>
                  <td className="px-4 py-3 text-slate-600">{e.mobile}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      e.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      e.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => setView(e)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Eye size={16} /></button>
                    <button onClick={() => setStatus(e.id, 'approved')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><CheckCircle2 size={16} /></button>
                    <button onClick={() => setStatus(e.id, 'rejected')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><XCircle size={16} /></button>
                    <button onClick={() => setConfirm(e.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500">No entries found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {view && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setView(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Entry Details</h2>
            <div className="space-y-3 text-sm">
              {['customerName','mobile','serviceName','category','remarks','adminRemarks'].map(k => (
                <div key={k}>
                  <p className="text-slate-500 text-xs uppercase font-bold">{k}</p>
                  <p className="text-slate-900">{view[k] || '-'}</p>
                </div>
              ))}
              <div>
                <p className="text-slate-500 text-xs uppercase font-bold">Status</p>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  view.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  view.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>{view.status}</span>
              </div>
            </div>
            <button onClick={() => setView(null)} className="btn-primary w-full mt-6">Close</button>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Delete Entry?</h3>
            <p className="text-slate-600 text-sm mb-6">This action cannot be undone.</p>
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