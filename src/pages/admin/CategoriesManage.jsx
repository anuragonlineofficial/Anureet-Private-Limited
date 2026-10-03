import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/serviceService'

export default function CategoriesManage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const load = async () => {
    setLoading(true)
    try { setList(await getCategories()) } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm({ name: '', description: '' }); setEditing(null); setModal(true) }
  const openEdit = (c) => { setForm({ name: c.name, description: c.description || '' }); setEditing(c.id); setModal(true) }

  const save = async (e) => {
    e.preventDefault()
    if (!form.name) return toast.error('Name required')
    try {
      if (editing) {
        await updateCategory(editing, form)
        toast.success('Updated!')
      } else {
        await createCategory(form)
        toast.success('Created!')
      }
      setModal(false)
      load()
    } catch { toast.error('Failed') }
  }

  const remove = async () => {
    await deleteCategory(confirm)
    toast.success('Deleted!')
    setConfirm(null)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Categories</h1>
          <p className="text-slate-600 text-sm mt-1">Manage service categories</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={18} /> Add Category</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(c => (
            <div key={c.id} className="card p-5">
              <h3 className="font-bold text-slate-900">{c.name}</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">{c.description || 'No description'}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="btn-secondary btn-sm flex-1"><Edit size={14} /> Edit</button>
                <button onClick={() => setConfirm(c.id)} className="btn-danger btn-sm"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <p className="text-slate-500 col-span-full text-center py-10">No categories yet. Click "Add Category" to create one.</p>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editing ? 'Edit' : 'Add'} Category</h2>
              <button onClick={() => setModal(false)} className="p-1 hover:bg-slate-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="label">Name *</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea rows={3} className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
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
            <h3 className="text-lg font-bold mb-2">Delete Category?</h3>
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