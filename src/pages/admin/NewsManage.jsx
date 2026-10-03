import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, X, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { createNews, getAllNews, updateNews, deleteNews } from '../../services/newsService'

const emptyForm = { title: '', content: '', image: '', published: false }

export default function NewsManage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const load = async () => {
    setLoading(true)
    try { setList(await getAllNews()) } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true) }
  const openEdit = (n) => {
    setForm({ title: n.title, content: n.content, image: n.image || '', published: n.published || false })
    setEditing(n.id)
    setModal(true)
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.title || !form.content) return toast.error('Title and content required')
    try {
      if (editing) {
        await updateNews(editing, form)
        toast.success('News updated!')
      } else {
        await createNews(form)
        toast.success('News created!')
      }
      setModal(false)
      load()
    } catch { toast.error('Failed') }
  }

  const togglePublish = async (n) => {
    await updateNews(n.id, { published: !n.published })
    toast.success(n.published ? 'Unpublished' : 'Published')
    load()
  }

  const remove = async () => {
    await deleteNews(confirm)
    toast.success('Deleted!')
    setConfirm(null)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">News & Updates</h1>
          <p className="text-slate-600 text-sm mt-1">Manage website news</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={18} /> Add News</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : list.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          No news yet. Click "Add News" to create one.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(n => (
            <div key={n.id} className="card p-5">
              {n.image && <img src={n.image} alt={n.title} className="w-full h-32 object-cover rounded-lg mb-3" />}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-slate-900">{n.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  n.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {n.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-3 line-clamp-3">{n.content}</p>
              <div className="flex gap-2">
                <button onClick={() => togglePublish(n)} className="btn-secondary btn-sm flex-1">
                  {n.published ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}
                </button>
                <button onClick={() => openEdit(n)} className="btn-secondary btn-sm">
                  <Edit size={14} />
                </button>
                <button onClick={() => setConfirm(n.id)} className="btn-danger btn-sm">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editing ? 'Edit News' : 'Add News'}</h2>
              <button onClick={() => setModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">Image URL (optional)</label>
                <input className="input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="label">Content *</label>
                <textarea rows={6} className="input" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />
                <span className="text-sm font-semibold">Publish immediately</span>
              </label>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Delete News?</h3>
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