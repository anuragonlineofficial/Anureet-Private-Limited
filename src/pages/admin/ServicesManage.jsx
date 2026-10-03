import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Search, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getServices, createService, updateService, deleteService, getCategories } from '../../services/serviceService'

const emptyForm = { name: '', category: '', description: '', fullDescription: '', fee: '', requiredDocuments: '', displayOrder: 0, status: 'active' }

export default function ServicesManage() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [s, c] = await Promise.all([getServices(), getCategories()])
      setServices(s)
      setCategories(c)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal(true) }
  const openEdit = (s) => { setForm({ ...s, fee: s.fee || '' }); setEditing(s.id); setModal(true) }

  const save = async (e) => {
    e.preventDefault()
    if (!form.name || !form.category) return toast.error('Name and Category required')
    try {
      const payload = {
        ...form,
        fee: form.fee ? Number(form.fee) : 0,
        displayOrder: Number(form.displayOrder) || 0
      }
      if (editing) {
        await updateService(editing, payload)
        toast.success('Service updated!')
      } else {
        await createService(payload)
        toast.success('Service created!')
      }
      setModal(false)
      load()
    } catch (err) { console.error(err); toast.error('Failed') }
  }

  const remove = async () => {
    try {
      await deleteService(confirm)
      toast.success('Deleted!')
      setConfirm(null)
      load()
    } catch { toast.error('Failed') }
  }

  const toggle = async (s) => {
    await updateService(s.id, { status: s.status === 'active' ? 'inactive' : 'active' })
    toast.success('Status updated')
    load()
  }

  const filtered = services.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Services Management</h1>
          <p className="text-slate-600 text-sm mt-1">Add, edit, delete services</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={18} /> Add Service
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="input pl-10" placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Fee</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold">{s.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold">{s.category}</span>
                    </td>
                    <td className="px-4 py-3">{s.fee ? `₹${s.fee}` : '-'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(s)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {s.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => setConfirm(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-slate-500">No services found. Click "Add Service" to create one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editing ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => setModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Service Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <input className="input" list="cats" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required />
                  <datalist id="cats">
                    {categories.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
                </div>
                <div>
                  <label className="label">Fee (₹)</label>
                  <input type="number" className="input" value={form.fee} onChange={e => setForm({ ...form, fee: e.target.value })} />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Short Description</label>
                <textarea rows={2} className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Required Documents</label>
                <textarea rows={2} className="input" value={form.requiredDocuments} onChange={e => setForm({ ...form, requiredDocuments: e.target.value })} placeholder="Aadhaar, PAN, etc." />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirm(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2">Delete Service?</h3>
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