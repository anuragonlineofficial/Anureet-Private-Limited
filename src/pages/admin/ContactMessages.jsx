import { useEffect, useState } from 'react'
import { Mail, Trash2, Search, Check, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllContactMessages, markMessageRead, deleteContactMessage } from '../../services/contactService'

export default function ContactMessages() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const load = async () => {
    setLoading(true)
    try { setList(await getAllContactMessages()) } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleRead = async (m) => {
    await markMessageRead(m.id, !m.read)
    load()
  }

  const remove = async () => {
    await deleteContactMessage(confirm)
    toast.success('Deleted!')
    setConfirm(null)
    load()
  }

  let filtered = list
  if (filter === 'unread') filtered = filtered.filter(m => !m.read)
  if (filter === 'read') filtered = filtered.filter(m => m.read)
  filtered = filtered.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase())
  )

  const unreadCount = list.filter(m => !m.read).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Contact Messages</h1>
        <p className="text-slate-600 text-sm mt-1">
          {unreadCount > 0 ? `${unreadCount} unread messages` : 'All messages read'}
        </p>
      </div>

      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="input pl-10" placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
              {f.toUpperCase()} ({f === 'all' ? list.length : f === 'unread' ? unreadCount : list.length - unreadCount})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          <Mail size={40} className="mx-auto text-slate-300 mb-3" />
          No messages found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(m => (
            <div key={m.id} className={`card p-4 ${!m.read ? 'border-l-4 border-l-blue-600' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900">{m.name}</h3>
                    {!m.read && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">NEW</span>}
                  </div>
                  <p className="text-sm text-slate-600 break-all">{m.email}</p>
                  <p className="font-semibold text-slate-900 mt-2">{m.subject}</p>
                  <p className="text-sm text-slate-600 line-clamp-2 mt-1">{m.message}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setView(m)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => toggleRead(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setConfirm(m.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setView(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Message from {view.name}</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Email</p>
                <a href={`mailto:${view.email}`} className="text-blue-700 break-all">{view.email}</a>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Subject</p>
                <p>{view.subject}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold">Message</p>
                <p className="whitespace-pre-wrap">{view.message}</p>
              </div>
            </div>
            <button onClick={() => setView(null)} className="btn-primary w-full mt-6">Close</button>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Delete Message?</h3>
            <p className="text-slate-600 text-sm mb-6">Cannot be undone.</p>
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