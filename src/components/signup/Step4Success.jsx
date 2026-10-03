import { CheckCircle2, AlertCircle, LogIn } from 'lucide-react'

export default function Step4Success({ formData, onGoToLogin }) {
  return (
    <div className="card p-6 md:p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="text-emerald-600" size={48} />
      </div>
      
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
        Registration Complete!
      </h1>
      <p className="text-slate-600 mb-6">
        Payment successful. Account ban gaya hai.
      </p>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 flex items-start gap-3 text-left">
        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-amber-800">
          <p className="font-bold mb-1">⏳ Waiting for Admin Approval</p>
          <p>Aapka account <strong>24-48 ghante</strong> mein approve hoga. Approval ke baad hi login kar paoge.</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-5 text-left mb-6">
        <h3 className="font-bold text-slate-900 mb-3">📋 Your Login Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Login ID:</span>
            <span className="font-mono">{formData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Mobile:</span>
            <span className="font-mono">{formData.mobile}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Password:</span>
            <span className="font-mono">(Jo aapne set kiya)</span>
          </div>
        </div>
      </div>

      <button onClick={onGoToLogin} className="btn-primary w-full">
        <LogIn size={18} /> Go to Login Page
      </button>

      <p className="text-xs text-slate-500 mt-4">
        Admin approval notification aapke mobile/email par aayega.
      </p>
    </div>
  )
}