import { useEffect, useState } from 'react'
import { Activity, Search, RefreshCw } from 'lucide-react'
import { getActivityLogs } from '../../services/activityService'

export default function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try { setLogs(await getActivityLogs(200)) } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = logs.filter(l =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.details?.toLowerCase().includes(search.toLowerCase()) ||
    l.userName?.toLowerCase().includes(search.toLowerCase())
  )

  const formatTime = (ts) => {
    if (!ts?.seconds) return '-'
    return new Date(ts.seconds * 1000).toLocaleString('en-IN')
  }

  const getColor = (action) => {
    if (action?.includes('delete')) return 'bg-red-100 text-red-700'
    if (action?.includes('create')) return 'bg-emerald-100 text-emerald-700'
    if (action?.includes('update') || action?.includes('edit')) return 'bg-blue-100 text-blue-700'
    if (action?.includes('approve')) return 'bg-emerald-100 text-emerald-700'
    if (action?.includes('reject')) return 'bg-red-100 text-red-700'
    return 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Activity Logs</h1>
          <p className="text-slate-600 text-sm mt-1">Recent system activity</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={18} /> Refresh</button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="input pl-10" placeholder="Search activity..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          <Activity size={40} className="mx-auto text-slate-300 mb-3" />
          No activity logs yet.
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtered.map(log => (
            <div key={log.id} className="p-4 hover:bg-slate-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getColor(log.action)}`}>
                      {log.action?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-900">{log.details}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    By: <strong>{log.userName}</strong> • {formatTime(log.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}