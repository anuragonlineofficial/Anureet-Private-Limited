import { useState } from 'react'
import { ShieldCheck, Fingerprint, CheckCircle2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Step2KYC({ formData, updateFormData, onNext, onBack }) {
  const [aadharNumber, setAadharNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const sendOtp = () => {
    if (!/^\d{12}$/.test(aadharNumber)) return toast.error('Enter valid 12-digit Aadhaar number')
    setOtpSent(true)
    toast.success('OTP sent to Aadhaar-linked mobile')
  }

  const verifyOtp = () => {
    if (!/^\d{6}$/.test(otp)) return toast.error('Enter valid 6-digit OTP')
    setVerifying(true)
    setTimeout(() => {
      updateFormData({
        kycDone: true,
        kycData: {
          aadharLast4: aadharNumber.slice(-4),
          verifiedAt: new Date().toISOString()
        }
      })
      setVerifying(false)
      toast.success('eKYC verified!')
      onNext()
    }, 1500)
  }

  return (
    <div className="card p-6 md:p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
          <Fingerprint className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Aadhaar eKYC</h1>
        <p className="text-slate-600 text-sm mt-1">Verify your identity with Aadhaar</p>
      </div>

      <div className="max-w-md mx-auto">
        {!otpSent ? (
          <>
            <div className="p-4 bg-blue-50 rounded-xl mb-6">
              <p className="text-sm text-blue-800">
                <strong>eKYC ke liye:</strong> Aadhaar number daalein. OTP aapke Aadhaar-linked mobile par jayega.
              </p>
            </div>

            <div>
              <label className="label">Aadhaar Number</label>
              <input
                className="input text-center text-lg tracking-widest"
                maxLength={12}
                value={aadharNumber}
                onChange={e => setAadharNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="0000 0000 0000"
              />
              <p className="text-xs text-slate-500 mt-2 text-center">
                🔒 Your Aadhaar data is encrypted and secure
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 bg-emerald-50 rounded-xl mb-6">
              <CheckCircle2 className="text-emerald-600 mx-auto mb-2" size={32} />
              <p className="text-sm text-emerald-800 text-center">
                OTP sent to Aadhaar-linked mobile (XXXXXX{formData.mobile?.slice(-4)})
              </p>
            </div>

            <div>
              <label className="label">Enter OTP</label>
              <input
                className="input text-center text-lg tracking-widest"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
              />
              <button type="button" onClick={sendOtp} className="text-xs text-blue-600 mt-2 font-semibold">
                Resend OTP
              </button>
            </div>
          </>
        )}

        <div className="flex gap-3 mt-8">
          <button onClick={onBack} className="btn-secondary flex-1">
            ← Back
          </button>
          {!otpSent ? (
            <button onClick={sendOtp} className="btn-primary flex-1">
              Send OTP
            </button>
          ) : (
            <button onClick={verifyOtp} disabled={verifying} className="btn-primary flex-1">
              {verifying ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : 'Verify eKYC'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 text-center">
        🔐 <strong>Demo Mode:</strong> Koi bhi 12-digit number aur 6-digit OTP chalega. Real API ke liye UIDAI integration chahiye.
      </div>
    </div>
  )
}