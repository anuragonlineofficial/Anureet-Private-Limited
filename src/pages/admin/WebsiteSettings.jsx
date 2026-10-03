import { useEffect, useState } from 'react'
import { Save, Globe, Phone, Mail, MapPin, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { getWebsiteSettings, updateWebsiteSettings } from '../../services/serviceService'

export default function WebsiteSettings() {
  const [form, setForm] = useState({
    siteName: '', phone: '', email: '', address: '',
    maintenanceMode: false, registrationEnabled: true, paymentEnabled: true,
    registrationFee: 151
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getWebsiteSettings().then(data => {
      setForm(prev => ({ ...prev, ...data }))
    }).finally(() => setLoading(false))
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateWebsiteSettings(form)
      toast.success('Settings saved!')
    } catch { toast.error('Failed') }
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Website Settings</h1>
        <p className="text-slate-600 text-sm mt-1">Manage website configuration</p>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Contact Info */}
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Globe size={20} /> Business Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Site Name</label>
              <input className="input" value={form.siteName} onChange={e => setForm({ ...form, siteName: e.target.value })} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Address</label>
              <textarea rows={2} className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Shield size={20} /> Feature Toggles</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.maintenanceMode} onChange={e => setForm({ ...form, maintenanceMode: e.target.checked })} />
              <div>
                <p className="font-semibold text-slate-900">Maintenance Mode</p>
                <p className="text-xs text-slate-500">Website temporary closed for public</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.registrationEnabled} onChange={e => setForm({ ...form, registrationEnabled: e.target.checked })} />
              <div>
                <p className="font-semibold text-slate-900">Registration Enabled</p>
                <p className="text-xs text-slate-500">Allow new VLE registrations</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.paymentEnabled} onChange={e => setForm({ ...form, paymentEnabled: e.target.checked })} />
              <div>
                <p className="font-semibold text-slate-900">Payment Enabled</p>
                <p className="text-xs text-slate-500">Enable online payment gateway</p>
              </div>
            </label>
          </div>
        </div>

        {/* Fees */}
        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Registration Fee</h2>
          <div>
            <label className="label">VLE Registration Fee (₹)</label>
            <input type="number" className="input" value={form.registrationFee} onChange={e => setForm({ ...form, registrationFee: Number(e.target.value) })} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : <><Save size={18} /> Save Settings</>}
        </button>
      </form>
    </div>
  )
}