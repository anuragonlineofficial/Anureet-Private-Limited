import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

export default function PaymentStatus() {
  const [params] = useSearchParams()
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('Verifying your payment...')

  useEffect(() => {
    const orderId = params.get('order_id')
    const uid = params.get('uid')

    if (!orderId || !uid) {
      setStatus('error')
      setMessage('Invalid payment response')
      return
    }

    const verify = async () => {
      try {
        const response = await fetch('/api/verify-cashfree-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: orderId })
        })

        const data = await response.json()

        if (data.order_status === 'PAID') {
          await updateDoc(doc(db, 'users', uid), {
            status: 'pending',
            paymentDone: true,
            paymentId: orderId,
            paymentAmount: 151,
            paymentDate: new Date().toISOString()
          })

          setStatus('success')
          setMessage('Payment successful! Account created. Admin approval pending.')
        } else {
          setStatus('pending')
          setMessage('Payment not completed yet. Please try again.')
        }
      } catch (err) {
        console.error(err)
        setStatus('error')
        setMessage('Failed to verify payment. Contact support.')
      }
    }

    verify()
  }, [params])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="mx-auto text-blue-600 animate-spin mb-4" size={64} />
            <h1 className="text-2xl font-bold mb-2">Verifying Payment</h1>
            <p className="text-slate-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto text-emerald-600 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-emerald-700 mb-2">Payment Successful!</h1>
            <p className="text-slate-600 mb-6">{message}</p>

            <div className="p-4 bg-amber-50 rounded-xl mb-6">
              <Clock className="text-amber-600 mx-auto mb-2" size={32} />
              <p className="text-sm text-amber-800">
                <strong>Account Pending Approval</strong><br />
                Admin approve karega 24-48 ghante mein. Approval ke baad login kar paoge.
              </p>
            </div>

            <Link to="/login" className="btn-primary w-full">Go to Login</Link>
          </>
        )}

        {status === 'pending' && (
          <>
            <Clock className="mx-auto text-amber-600 mb-4" size={64} />
            <h1 className="text-2xl font-bold mb-2">Payment Pending</h1>
            <p className="text-slate-600 mb-6">{message}</p>
            <Link to="/signup" className="btn-primary w-full">Try Again</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto text-red-600 mb-4" size={64} />
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-slate-600 mb-6">{message}</p>
            <Link to="/signup" className="btn-primary w-full">Try Again</Link>
          </>
        )}
      </div>
    </div>
  )
}