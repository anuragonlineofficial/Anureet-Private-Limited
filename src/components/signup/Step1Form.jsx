import { useState } from 'react'
import { Upload, User, Store, MapPin, Phone, Mail, UserCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Step1Form({ formData, updateFormData, onNext }) {
  const [form, setForm] = useState({
    shopName: formData.shopName || '',
    name: formData.name || '',
    fathersName: formData.fathersName || '',
    fullAddress: formData.fullAddress || '',
    shopAddress: formData.shopAddress || '',
    mobile: formData.mobile || '',
    email: formData.email || ''
  })
  const [photo, setPhoto] = useState(formData.photo)
  const [photoPreview, setPhotoPreview] = useState(formData.photoUrl || '')
  const [aadharFront, setAadharFront] = useState(formData.aadharFront)
  const [aadharBack, setAadharBack] = useState(formData.aadharBack)

  const handleFile = (file, type) => {
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return toast.error('File too large (max 2MB)')
    if (!file.type.startsWith('image/')) return toast.error('Only images allowed')

    const reader = new FileReader()
    reader.onload = (e) => {
      if (type === 'photo') { setPhoto(file); setPhotoPreview(e.target.result) }
      else if (type === 'aadharFront') setAadharFront(file)
      else if (type === 'aadharBack') setAadharBack(file)
    }
    reader.readAsDataURL(file)
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.shopName || !form.name || !form.fathersName || !form.fullAddress || !form.mobile || !form.email) {
      return toast.error('Please fill all required fields')
    }
    if (!/^\d{10}$/.test(form.mobile)) return toast.error('Enter valid 10-digit mobile')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error('Enter valid email')
    if (!photo) return toast.error('Photo upload is required')

    updateFormData({ ...form, photo, photoUrl: photoPreview, aadharFront, aadharBack })
    toast.success('Details saved!')
    onNext()
  }

  return (
    <div className="card p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Create Your Account</h1>
        <p className="text-slate-600 text-sm mt-1">Fill your details. Next: Phone verification + ₹151 payment.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Shop / Business Name *</label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input className="input pl-10" value={form.shopName}
              onChange={e => setForm({ ...form, shopName: e.target.value })} placeholder="Your shop name" required />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Your Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input className="input pl-10" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="label">Father's Name *</label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input className="input pl-10" value={form.fathersName}
                onChange={e => setForm({ ...form, fathersName: e.target.value })} required />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Mobile No. *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input className="input pl-10" maxLength={10} value={form.mobile}
                onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })} required />
            </div>
            <p className="text-xs text-slate-500 mt-1">Is number par OTP aayega</p>
          </div>
          <div>
            <label className="label">Email ID *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" className="input pl-10" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
        </div>

        <div>
          <label className="label">Full Address *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
            <textarea rows={2} className="input pl-10" value={form.fullAddress}
              onChange={e => setForm({ ...form, fullAddress: e.target.value })} required />
          </div>
        </div>

        <div>
          <label className="label">Shop Address</label>
          <div className="relative">
            <Store className="absolute left-3 top-3 text-slate-400" size={18} />
            <textarea rows={2} className="input pl-10" value={form.shopAddress}
              onChange={e => setForm({ ...form, shopAddress: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Your Photo * <span className="text-red-500">(Required)</span></label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-400">
            {photoPreview ? (
              <div className="relative inline-block">
                <img src={photoPreview} alt="preview" className="w-24 h-24 rounded-xl object-cover" />
                <button type="button" onClick={() => { setPhoto(null); setPhotoPreview('') }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                <label className="cursor-pointer text-blue-600 font-semibold text-sm">
                  Click to upload photo
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0], 'photo')} />
                </label>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG (max 2MB)</p>
              </>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Aadhaar Front <span className="text-xs text-slate-500">(Optional)</span></label>
            <label className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center cursor-pointer hover:border-blue-400 block">
              {aadharFront ? <p className="text-xs text-emerald-600 font-semibold">✓ {aadharFront.name}</p> : <p className="text-xs text-slate-500">Upload front</p>}
              <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0], 'aadharFront')} />
            </label>
          </div>
          <div>
            <label className="label">Aadhaar Back <span className="text-xs text-slate-500">(Optional)</span></label>
            <label className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center cursor-pointer hover:border-blue-400 block">
              {aadharBack ? <p className="text-xs text-emerald-600 font-semibold">✓ {aadharBack.name}</p> : <p className="text-xs text-slate-500">Upload back</p>}
              <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0], 'aadharBack')} />
            </label>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full">Continue to Phone Verify →</button>
      </form>
    </div>
  )
}