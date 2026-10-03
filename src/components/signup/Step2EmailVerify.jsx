import { useState, useEffect } from 'react'
import { Mail, CheckCircle2, Loader2, Shield, AlertCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import emailjs from '@emailjs/browser'
import { db } from '../../services/firebase'

export default function Step2EmailVerify({ formData, updateFormData, onNext, onBack }) {
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [sending, setSending] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

  const sendOtp = async () => {
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      return toast.error('Valid email address required')
    }
    setSending(true)
    try {
      const newOtp = generateOtp()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

      const oldOtps = await getDocs(query(collection(db, 'email_otps'), where('email', '==', formData.email)))
      for (const d of oldOtps.docs) {
        await deleteDoc(doc(db, 'email_otps', d.id))
      }

      await addDoc(collection(db, 'email_otps'), {
        email: formData.email,
        otp: newOtp,
        verified: false,
        expiresAt: expiresAt.toISOString(),
        createdAt: serverTimestamp()
      })

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID,
        {
          to_name: formData.name || 'User',
          to_email: formData.email,
          otp_code: newOtp
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )

      setOtpSent(true)
      setResendTimer(60)
      toast.success(`OTP sent to ${formData.email}`)
    } catch (err) {
      console.error('Send OTP error:', err)
      let msg = 'Failed to send OTP'
      if (err.text) msg = err.text
      if (err.status === 429) msg = 'Too many emails. Try after some time.'
      toast.error(msg)
    } finally {
      setSending(false)
    }
  }

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) return toast.error('Enter valid 6-digit OTP')
    setVerifying(true)
    try {
      const snap = await getDocs(query(collection(db, 'email_otps'), where('email', '==', formData.email)))
      if (snap.empty) {
        setVerifying(false)
        return toast.error('No OTP found. Please request again.')
      }
      const otpDoc = snap.docs[0]
      const otpData = otpDoc.data()

      if (new Date(otpData.expiresAt) < new Date()) {
        await deleteDoc(doc(db, 'email_otps', otpDoc.id))
        setVerifying(false)
        return toast.error('OTP expired. Please request again.')
      }
      if (otpData.otp !== otp) {
        setVerifying(false)
        return toast.error('Invalid OTP. Try again.')
      }

      await deleteDoc(doc(db, 'email_otps', otpDoc.id))
      updateFormData({ emailVerified: true, verifiedAt: new Date().toISOString() })
      toast.success('Email verified!')
      onNext()
    } catch (err) {
      console.error('Verify error:', err)
      toast.error('Verification failed. Try again.')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="card p-6 md:p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
          <Mail className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Verify Your Email</h1>
        <p className="text-slate-600 text-sm mt-1">Email OTP verification</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="p-4 bg-blue-50 rounded-xl mb-6 flex items-start gap-3">
          <Shield className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p><strong>OTP will be sent to:</strong></p>
            <p className="font-mono">{formData.email}</p>
          </div>
        </div>

        {!otpSent ? (
          <button onClick={sendOtp} disabled={sending} className="btn-primary w-full">
            {sending ? <><Loader2 size={18} className="animate-spin" /> Sending OTP...</> : 'Send OTP to Email'}
          </button>
        ) : (
          <>
            <div className="p-4 bg-emerald-50 rounded-xl mb-6">
              <CheckCircle2 className="text-emerald-600 mx-auto mb-2" size={32} />
              <p className="text-sm text-emerald-800 text-center">
                OTP sent to <strong>{formData.email}</strong>
              </p>
              <p className="text-xs text-slate-500 text-center mt-1">Check inbox and spam folder</p>
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
              <div className="flex justify-between items-center mt-3">
                <button type="button" onClick={sendOtp} disabled={sending || resendTimer > 0}
                  className="text-xs text-blue-600 font-semibold disabled:text-slate-400 flex items-center gap-1">
                  <RefreshCw size={12} />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3 mt-8">
          <button onClick={onBack} disabled={verifying} className="btn-secondary flex-1">← Back</button>
          {otpSent && (
            <button onClick={verifyOtp} disabled={verifying} className="btn-primary flex-1">
              {verifying ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : 'Verify Email'}
            </button>
          )}
        </div>

        <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>Email aane mein 30-60 seconds lag sakte hain. Spam folder bhi check karo.</p>
        </div>
      </div>
    </div>
  )
}