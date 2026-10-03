import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, LogIn, ShieldCheck, Zap, Sparkles } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ x: [0, 50, 0], y: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl" />
        <motion.div animate={{ x: [0, -60, 0], y: [0, 40, 0] }} transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-10 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border mb-6">
            <Sparkles size={16} className="text-orange-500" />
            <span className="text-xs font-bold text-blue-700 tracking-wide">TRUSTED DIGITAL SERVICE PORTAL</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-tight mb-6">
            Your Trusted<br />
            <span className="gradient-text">Digital Service Partner</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Digital Services • Jan Seva • eDistrict • eCitizen • Online Services — all under one roof.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center">
            <Link to="/services" className="btn-primary text-lg px-8 py-4">
              Explore Services <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="border-2 border-blue-600 text-blue-700 bg-white px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-blue-50">
              <LogIn size={20} /> Login
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-16">
            {[
              { icon: ShieldCheck, label: 'Secure', value: '100%' },
              { icon: Zap, label: 'Fast Service', value: '24/7' },
              { icon: Sparkles, label: 'Trusted', value: '1000+' }
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="card p-4 text-center">
                <Icon className="text-blue-600 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}