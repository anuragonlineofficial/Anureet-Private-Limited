import { useState, useEffect, useRef } from 'react'
import { Phone, CheckCircle2, Loader2, Shield, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '../../services/firebase'

export default function Step2PhoneVerify({ formData, updateFormData, onNext, onBack }) {
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [sending, setSending] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState(null)
  const recaptchaRef = useRef(null)

  // Cleanup recaptcha on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear()
        } catch (e) { /* ignore */ }
        window.recaptchaVerifier = null
      }
    }
  }, [])

  const setupRecaptcha = () => {
    // Agar already exist karta hai toh clear karo
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear()
      } catch (e) { /* ignore */ }
      window.recaptchaVerifier = null
    }

    // Container khaali karo
    const container = document.getElementById('recaptcha-container')
    if (container) container.innerHTML = ''

    // Naya recaptcha banao
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {}
    })

    return window.recaptchaVerifier
  }

  const sendOtp = async () => {
    if (!formData.mobile || !/^\d{10}$/.test(formData.mobile)) {
      return toast.error('Valid 10-digit mobile number required')
    }
    setSending(true)
    try {
      const verifier = setupRecaptcha()
      const phoneNumber = `+91${formData.mobile}`
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier)
      setConfirmationResult(confirmation)
      setOtpSent(true)
      toast.success('OTP sent to +91 ' + formData.mobile)
    } catch (err) {
      console.error('Send OTP error:', err)
      let msg = err.message || 'Failed to send OTP'
      if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Try after some time.'
      if (err.code === 'auth/invalid-phone-number') msg = 'Invalid phone number'
      if (err.code === 'auth/billing-not-enabled') msg = 'Firebase Blaze plan needed for real SMS. Add test number in Firebase Console.'
      toast.error(msg)
      
      // Cleanup on error
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear() } catch (e) {}
        window.recaptchaVerifier = null
      }
    } finally {
      setSending(false)
    }
  }

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) return toast.error('Enter valid 6-digit OTP')
    if (!confirmationResult) return toast.error('Please send OTP first')
    
    setVerifying(true)
    try {
      await confirmationResult.confirm(otp)
      updateFormData({ phoneVerified: true, verifiedAt: new Date().toISOString() })
      toast.success('Phone verified!')
      onNext()
    } catch (err) {
      console.error('Verify error:', err)
      toast.error('Invalid OTP. Try again.')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="card p-6 md:p-8">
      <div id="recaptcha-container"></div>

      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
          <Phone className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Verify Your Phone</h1>
        <p className="text-slate-600 text-sm mt-1">SMS OTP verification</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="p-4 bg-blue-50 rounded-xl mb-6 flex items-start gap-3">
          <Shield className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p><strong>OTP sent to:</strong> +91 {formData.mobile}</p>
            <p className="text-xs mt-1">Firebase se real SMS aayega</p>
          </div>
        </div>

        {!otpSent ? (
          <button onClick={sendOtp} disabled={sending} className="btn-primary w-full">
            {sending ? <><Loader2 size={18} className="animate-spin" /> Sending OTP...</> : 'Send OTP'}
          </button>
        ) : (
          <>
            <div className="p-4 bg-emerald-50 rounded-xl mb-6">
              <CheckCircle2 className="text-emerald-600 mx-auto mb-2" size={32} />
              <p className="text-sm text-emerald-800 text-center">
                OTP sent to +91 {formData.mobile}
              </p>
            </div>

            <div>
              <label className="label">Enter 6-digit OTP</label>
              <input
                className="input text-center text-2xl tracking-widest font-mono"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                autoFocus
              />
              <button type="button" onClick={sendOtp} disabled={sending} className="text-xs text-blue-600 mt-2 font-semibold">
                Resend OTP
              </button>
            </div>
          </>
        )}

        <div className="flex gap-3 mt-8">
          <button onClick={onBack} disabled={verifying} className="btn-secondary flex-1">← Back</button>
          {otpSent && (
            <button onClick={verifyOtp} disabled={verifying} className="btn-primary flex-1">
              {verifying ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : 'Verify OTP'}
            </button>
          )}
        </div>

        <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Note (Test ke liye):</p>
            <p>Real SMS ke liye Firebase Blaze plan chahiye. Test ke liye Firebase Console → Authentication → Phone → Test numbers add karo: <strong>+91 9451228744 / OTP: 123456</strong></p>
          </div>
        </div>
      </div>
    </div>
  )
}