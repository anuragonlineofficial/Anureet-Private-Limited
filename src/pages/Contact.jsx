import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import { Phone, Mail, MapPin, Send } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const submit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return toast.error('Please fill all fields')
    toast.success('Message sent! We will contact you soon.')
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <>
      <Header />
      <main className="pt-32 pb-20">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Get in Touch</h1>
            <p className="text-lg text-slate-600">We're here to help you with all your digital service needs</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="space-y-4">
              {[
                { icon: Phone, title: 'Call Us', value: '+91-9451228744', href: 'tel:+919451228744' },
                { icon: Mail, title: 'Email Us', value: 'ahardoi30@gmail.com', href: 'mailto:ahardoi30@gmail.com' },
                { icon: MapPin, title: 'Visit Us', value: '1/7 Kanshiram Colony, Lucknow Road, Hardoi, UP – 241001', href: null }
              ].map(({ icon: Icon, title, value, href }) => (
                <div key={title} className="card p-6 flex items-start gap-4 card-hover">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center shrink-0">
                    <Icon className="text-white" size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{title}</h4>
                    {href ? (
                      <a href={href} className="text-slate-600 hover:text-blue-700 break-all">{value}</a>
                    ) : (
                      <p className="text-slate-600">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={submit} className="card p-6 md:p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Send us a Message</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Your Name</label>
                  <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter your name" />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea rows={5} className="input" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us how we can help..." />
                </div>
                <button type="submit" className="btn-primary w-full">
                  <Send size={18} /> Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}