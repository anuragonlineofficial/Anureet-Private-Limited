import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, ArrowRight } from 'lucide-react'
import { getServices } from '../../services/serviceService'

export default function ServiceGrid({ title = 'Our Services', limit }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getServices(true).then(data => {
      setServices(limit ? data.slice(0, limit) : data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [limit])

  return (
    <section className="py-20 bg-slate-50" id="services">
      <div className="container-custom">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-14">
          <h2 className="section-title">{title}</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">Explore our wide range of digital services</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <FileText size={48} className="mx-auto mb-3 text-slate-300" />
            <p>No services available right now.</p>
            <p className="text-sm mt-2">Admin dashboard se services add karo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div key={service.id}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card card-hover p-6 group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="text-white" size={26} />
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold inline-block mb-2">
                  {service.category || 'General'}
                </span>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{service.name}</h3>
                <p className="text-sm text-slate-600 mb-3">{service.description}</p>
                {service.fee && <p className="text-sm font-bold text-orange-600 mb-3">Fee: ₹{service.fee}</p>}
                <Link to="/login" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 group-hover:gap-2 transition-all">
                  Apply Now <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/services" className="btn-primary">
            View All Services <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}