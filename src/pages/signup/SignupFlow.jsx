import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Step1Form from '../../components/signup/Step1Form'
import Step2EmailVerify from '../../components/signup/Step2EmailVerify'
import Step3Payment from '../../components/signup/Step3Payment'
import Step4Success from '../../components/signup/Step4Success'

export default function SignupFlow() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    shopName: '', name: '', fathersName: '',
    fullAddress: '', shopAddress: '',
    mobile: '', email: '',
    photo: null, photoUrl: '',
    aadharFront: null, aadharBack: null,
    emailVerified: false,
    paymentDone: false, paymentId: '',
    generatedPassword: '', userId: ''
  })
  const navigate = useNavigate()
  const updateFormData = (data) => setFormData(prev => ({ ...prev, ...data }))

  const steps = [
    { n: 1, label: 'Registration' },
    { n: 2, label: 'Email Verify' },
    { n: 3, label: 'Payment ₹151' },
    { n: 4, label: 'Complete' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map(({ n, label }) => (
              <div key={n} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= n ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step > n ? '✓' : n}
                  </div>
                  <p className={`text-xs mt-2 font-semibold ${step >= n ? 'text-blue-700' : 'text-slate-400'}`}>{label}</p>
                </div>
                {n < steps.length && <div className={`h-1 flex-1 mx-2 rounded ${step > n ? 'bg-blue-600' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {step === 1 && <Step1Form formData={formData} updateFormData={updateFormData} onNext={() => setStep(2)} />}
            {step === 2 && <Step2EmailVerify formData={formData} updateFormData={updateFormData} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <Step3Payment formData={formData} updateFormData={updateFormData} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
            {step === 4 && <Step4Success formData={formData} onGoToLogin={() => navigate('/login')} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}