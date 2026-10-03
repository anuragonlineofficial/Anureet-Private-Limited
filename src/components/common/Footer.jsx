import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white pt-16 pb-8 mt-20">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                <span className="font-bold text-lg">A</span>
              </div>
              <div>
                <p className="font-extrabold text-lg">ANUREET</p>
                <p className="text-[10px] text-slate-400 tracking-wider">PRIVATE LIMITED</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your trusted digital service partner for Jan Seva, eDistrict, eCitizen and other online services.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-orange-400">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link to="/" className="hover:text-orange-400">Home</Link></li>
              <li><Link to="/services" className="hover:text-orange-400">Services</Link></li>
              <li><Link to="/about" className="hover:text-orange-400">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-orange-400">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-orange-400">Services</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Digital Services</li>
              <li>Jan Seva Services</li>
              <li>eDistrict Services</li>
              <li>eCitizen Services</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-orange-400">Contact Info</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-2">
                <Phone size={16} className="text-orange-400 shrink-0 mt-0.5" />
                <a href="tel:+919451228744" className="hover:text-orange-400">+91-9451228744</a>
              </li>
              <li className="flex gap-2">
                <Mail size={16} className="text-orange-400 shrink-0 mt-0.5" />
                <a href="mailto:ahardoi30@gmail.com" className="hover:text-orange-400 break-all">ahardoi30@gmail.com</a>
              </li>
              <li className="flex gap-2">
                <MapPin size={16} className="text-orange-400 shrink-0 mt-0.5" />
                <span>1/7 Kanshiram Colony, Hardoi, UP – 241001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700/50 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} Anureet Private Limited. All Rights Reserved.
        </div>
      </div>
    </footer>
  )
}