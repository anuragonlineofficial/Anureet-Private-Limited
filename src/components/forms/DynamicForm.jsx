import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Upload, X } from 'lucide-react'

export default function DynamicForm({ fields, initialData = {}, onSubmit, submitting = false, submitLabel = 'Submit' }) {
  const [formData, setFormData] = useState(initialData)
  const [files, setFiles] = useState({})

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const updateField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFile = (fieldName, file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('File too large (max 5MB)')
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) return toast.error('Only JPG, PNG, PDF allowed')
    setFiles(prev => ({ ...prev, [fieldName]: file }))
  }

  const submit = (e) => {
    e.preventDefault()
    
    // Validation
    for (const field of fields) {
      if (field.required) {
        const value = field.type === 'file' ? files[field.name] : formData[field.name]
        if (!value || (typeof value === 'string' && !value.trim())) {
          return toast.error(`${field.label} is required`)
        }
        // Email validation
        if (field.type === 'email' && !/^\S+@\S+\.\S+$/.test(value)) {
          return toast.error(`Invalid email: ${field.label}`)
        }
        // Mobile validation
        if (field.type === 'mobile' && !/^\d{10}$/.test(value)) {
          return toast.error(`Invalid mobile: ${field.label}`)
        }
      }
    }
    
    onSubmit({ ...formData, _files: files })
  }

  const renderField = (field) => {
    const value = formData[field.name] || ''
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            rows={3}
            className="input"
            value={value}
            onChange={e => updateField(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.required}
          />
        )
      
      case 'select':
        return (
          <select
            className="input"
            value={value}
            onChange={e => updateField(field.name, e.target.value)}
            required={field.required}
          >
            <option value="">-- Select {field.label} --</option>
            {(field.options || []).map(opt => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        )
      
      case 'radio':
        return (
          <div className="space-y-2">
            {(field.options || []).map(opt => (
              <label key={opt.value || opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value || opt}
                  checked={value === (opt.value || opt)}
                  onChange={e => updateField(field.name, e.target.value)}
                  required={field.required}
                />
                <span className="text-sm">{opt.label || opt}</span>
              </label>
            ))}
          </div>
        )
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {(field.options || []).map(opt => {
              const optVal = opt.value || opt
              const values = Array.isArray(value) ? value : []
              const checked = values.includes(optVal)
              return (
                <label key={optVal} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={e => {
                      const newValues = e.target.checked
                        ? [...values, optVal]
                        : values.filter(v => v !== optVal)
                      updateField(field.name, newValues)
                    }}
                  />
                  <span className="text-sm">{opt.label || opt}</span>
                </label>
              )
            })}
          </div>
        )
      
      case 'file':
        return (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-400">
            {files[field.name] ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-emerald-600 font-semibold">
                  ✓ {files[field.name].name}
                </span>
                <button
                  type="button"
                  onClick={() => setFiles(prev => {
                    const { [field.name]: _, ...rest } = prev
                    return rest
                  })}
                  className="text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                <label className="cursor-pointer text-blue-600 font-semibold text-sm">
                  Click to upload {field.label}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={e => handleFile(field.name, e.target.files[0])}
                    required={field.required}
                  />
                </label>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG, PDF (max 5MB)</p>
              </>
            )}
          </div>
        )
      
      case 'date':
        return (
          <input
            type="date"
            className="input"
            value={value}
            onChange={e => updateField(field.name, e.target.value)}
            required={field.required}
          />
        )
      
      case 'number':
        return (
          <input
            type="number"
            className="input"
            value={value}
            onChange={e => updateField(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.required}
          />
        )
      
      case 'mobile':
        return (
          <input
            type="tel"
            className="input"
            maxLength={10}
            value={value}
            onChange={e => updateField(field.name, e.target.value.replace(/\D/g, ''))}
            placeholder={field.placeholder || '10-digit mobile'}
            required={field.required}
          />
        )
      
      default: // text, email, etc.
        return (
          <input
            type={field.type === 'email' ? 'email' : 'text'}
            className="input"
            value={value}
            onChange={e => updateField(field.name, e.target.value)}
            placeholder={field.placeholder || ''}
            required={field.required}
          />
        )
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {fields.map(field => (
        <div key={field.name}>
          <label className="label">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(field)}
          {field.hint && (
            <p className="text-xs text-slate-500 mt-1">{field.hint}</p>
          )}
        </div>
      ))}
      
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Processing...' : submitLabel}
      </button>
    </form>
  )
}