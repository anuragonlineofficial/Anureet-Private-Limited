import { useState } from 'react'
import { CreditCard, IndianRupee, CheckCircle2, Loader2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, storage } from '../../services/firebase'
import emailjs from '@emailjs/browser'

export default function Step3Payment({ formData, updateFormData, onNext, onBack }) {
  const [processing, setProcessing] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handlePayment = async () => {
    if (!password || password.length < 6) return toast.error('Password must be at least 6 characters')
    if (password !== confirmPassword) return toast.error('Passwords do not match')

    setProcessing(true)
    try {
      let photoUrl = ''
      if (formData.photo) {
        const photoRef = ref(storage, `signup/${Date.now()}_${formData.photo.name}`)
        await uploadBytes(photoRef, formData.photo)
        photoUrl = await getDownloadURL(photoRef)
      }
      
      let aadharFrontUrl = '', aadharBackUrl = ''
      if (formData.aadharFront) {
        const ref1 = ref(storage, `signup/${Date.now()}_aadhar_front.jpg`)
        await uploadBytes(ref1, formData.aadharFront)
        aadharFrontUrl = await getDownloadURL(ref1)
      }
      if (formData.aadharBack) {
        const ref2 = ref(storage, `signup/${Date.now()}_aadhar_back.jpg`)
        await uploadBytes(ref2, formData.aadharBack)
        aadharBackUrl = await getDownloadURL(ref2)
      }

      const cred = await createUserWithEmailAndPassword(auth, formData.email, password)
      await updateProfile(cred.user, { displayName: formData.name })

      await setDoc(doc(db, 'users', cred.user.uid), {
        shopName: formData.shopName,
        name: formData.name,
        fathersName: formData.fathersName,
        fullAddress: formData.fullAddress,
        shopAddress: formData.shopAddress || formData.fullAddress,
        mobile: formData.mobile,
        email: formData.email,
        photoUrl,
        aadharFrontUrl,
        aadharBackUrl,
        emailVerified: formData.emailVerified,
        paymentDone: false,
        role: 'operator',
        status: 'pending_payment',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_WELCOME_TEMPLATE_ID,
          {
            to_name: formData.name,
            to_email: formData.email,
            user_email: formData.email,
            user_password: password
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        )
      } catch (emailErr) {
        console.warn('Welcome email failed:', emailErr)
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/create-cashfree-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_amount: 151,
          order_currency: 'INR',
          customer_details: {
            customer_id: cred.user.uid,
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.mobile
          },
          order_meta: {
            return_url: `${window.location.origin}/payment-status?order_id={order_id}&uid=${cred.user.uid}`
          }
        })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to create payment order')
      }
      
      const orderData = await response.json()

      if (!window.Cashfree) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
          script.onload = resolve
          script.onerror = () => reject(new Error('Failed to load Cashfree SDK'))
          document.body.appendChild(script)
        })
      }

      const cashfree = window.Cashfree({
        mode: import.meta.env.VITE_CASHFREE_MODE || 'sandbox'
      })

      await cashfree.checkout({
        paymentSessionId: orderData.payment_session_id,
        redirectTarget: '_modal'
      })
      
    } catch (err) {
      console.error(err)
      let msg = err.message || 'Payment failed'
      if (err.code === 'auth/email-already-in-use') msg = 'Email already registered'
      toast.error(msg)
      setProcessing(false)
    }
  }

  return (
    <div className="card p-6 md:p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
          <IndianRupee className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">One-Time Payment</h1>
        <p className="text-slate-600 text-sm mt-1">₹151 — Sirf ek baar</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-700">Account Registration</span>
            <span className="font-bold text-slate-900">₹151</span>
          </div>
          <div className="border-t border-slate-300 pt-4 flex items-center justify-between">
            <span className="font-bold text-lg">Total</span>
            <span className="font-extrabold text-2xl text-blue-700">₹151</span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="label">Set Your Password *</label>
            <input type="password" className="input" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="label">Confirm Password *</label>
            <input type="password" className="input" value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" />
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl mb-6 flex items-start gap-3">
          <Shield className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div className="text-xs text-amber-800">
            <p className="font-bold mb-1">Important:</p>
            <p>Payment ke baad account <strong>pending approval</strong> rahega. Admin approve karega tab login kar paoge.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onBack} disabled={processing} className="btn-secondary flex-1">← Back</button>
          <button onClick={handlePayment} disabled={processing} className="btn-primary flex-1">
            {processing ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <><CreditCard size={18} /> Pay ₹151</>}
          </button>
        </div>
      </div>
    </div>
  )
}