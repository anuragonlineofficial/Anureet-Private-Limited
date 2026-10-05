"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Menu, X, Zap, Shield, Star, Phone, Mail, MapPin,
  ArrowRight, FileText, LayoutDashboard,
} from "lucide-react";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg shadow-md">A</div>
            <div className="leading-tight">
              <h1 className="font-bold text-base sm:text-lg">Anureet</h1>
              <p className="text-[10px] sm:text-xs text-gray-500">Private Limited</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {["Home:#home","Services:#services","About:#about","Contact:#contact"].map((item) => {
              const [label, href] = item.split(":");
              return (
                <a key={label} href={href} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">{label}</a>
              );
            })}
            <Link href="/login" className="ml-2 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-all shadow-md shadow-brand-600/20 active:scale-95">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          </nav>

          <div className="flex md:hidden items-center gap-2">
            <Link href="/login" className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-md active:scale-95">
              <LayoutDashboard size={14} /> Dashboard
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-transform" aria-label="Toggle menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
            <nav className="px-4 py-3 flex flex-col">
              {[
                { label: "Home", href: "#home" },
                { label: "Services", href: "#services" },
                { label: "About", href: "#about" },
                { label: "Contact", href: "#contact" },
              ].map((item) => (
                <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}
                   className="py-3 px-3 text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-blue-50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs sm:text-sm font-semibold mb-5 sm:mb-6">
            <Star size={14} className="fill-brand-600 text-brand-600" />
            Trusted Digital Service Portal
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-tight">
            Your Trusted{" "}
            <span className="bg-gradient-to-r from-brand-600 to-blue-600 bg-clip-text text-transparent">Digital Service Partner</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
            Digital Services · Jan Seva · eDistrict · eCitizen · Online Services — all under one roof.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4 sm:px-0">
            <a href="#services" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 active:scale-95 transition-all">
              Explore Services <ArrowRight size={20} />
            </a>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-brand-600 bg-white px-6 sm:px-8 py-3.5 sm:py-4 text-base sm:text-lg font-semibold text-brand-600 hover:bg-brand-50 active:scale-95 transition-all">
              <LayoutDashboard size={20} /> Login
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              { icon: <Shield size={26} />, title: "100% Secure", desc: "Bank-grade security with Cashfree payments", color: "from-green-500 to-emerald-600" },
              { icon: <Zap size={26} />, title: "24/7 Fast Service", desc: "Applications processed quickly and reliably", color: "from-blue-500 to-brand-600" },
              { icon: <Star size={26} />, title: "1000+ Trusted", desc: "Serving VLE operators across Uttar Pradesh", color: "from-amber-500 to-orange-600" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center shadow-md`}>{f.icon}</div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 leading-snug">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-14 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Our Services</h2>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">Explore our wide range of digital services</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { name: "New Ration Card", price: "₹1200", tag: "New" },
              { name: "Unit Add Ration Card", price: "₹800", tag: "Popular" },
              { name: "Aadhaar Update", price: "₹100", tag: "" },
              { name: "PAN Card Apply", price: "₹150", tag: "" },
              { name: "Income Certificate", price: "₹80", tag: "" },
              { name: "Domicile Certificate", price: "₹80", tag: "" },
            ].map((s, i) => (
              <div key={i} className="group rounded-2xl bg-white border border-gray-100 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-md">
                    <FileText size={22} />
                  </div>
                  {s.tag && <span className="text-[10px] font-bold uppercase bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full">{s.tag}</span>}
                </div>
                <h3 className="text-base sm:text-lg font-bold mb-1 text-gray-900">{s.name}</h3>
                <p className="text-sm text-gray-500 mb-4">Fee: <span className="text-brand-600 font-bold text-lg">{s.price}</span></p>
                <Link href="/login" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 transition-all">
                  Apply Now <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-12">
            <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 sm:px-8 py-3.5 sm:py-4 text-base font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 active:scale-95 transition-all">
              View All Services <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-14 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">About Anureet Private Limited</h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">
            Your trusted digital service partner for Jan Seva, eDistrict, eCitizen and other online services. We empower VLE operators to deliver essential government and digital services to citizens with speed, transparency and trust.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-14 sm:py-20 bg-gradient-to-br from-brand-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">Get In Touch</h2>
            <p className="text-brand-100 text-sm sm:text-base md:text-lg">We&apos;d love to hear from you</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <a href="tel:+919451228744" className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all">
              <Phone className="mx-auto mb-3" size={28} />
              <h3 className="font-bold mb-1">Mobile</h3>
              <p className="text-brand-100 text-sm">+91-9451228744</p>
            </a>
            <a href="mailto:ahardoi30@gmail.com" className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all">
              <Mail className="mx-auto mb-3" size={28} />
              <h3 className="font-bold mb-1">Email</h3>
              <p className="text-brand-100 text-xs sm:text-sm break-all">ahardoi30@gmail.com</p>
            </a>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <MapPin className="mx-auto mb-3" size={28} />
              <h3 className="font-bold mb-1">Address</h3>
              <p className="text-brand-100 text-xs sm:text-sm">1/7 Kanshiram Colony, Lucknow Road, Hardoi, UP 241001</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold">A</div>
              <div>
                <h3 className="text-white font-bold">Anureet</h3>
                <p className="text-xs text-gray-500">Private Limited</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">Your trusted digital service partner for Jan Seva, eDistrict, eCitizen and other online services.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#home" className="hover:text-white">Home</a></li>
              <li><a href="#services" className="hover:text-white">Services</a></li>
              <li><a href="#about" className="hover:text-white">About Us</a></li>
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white">Digital Services</Link></li>
              <li><Link href="/login" className="hover:text-white">Jan Seva Services</Link></li>
              <li><Link href="/login" className="hover:text-white">eDistrict Services</Link></li>
              <li><Link href="/login" className="hover:text-white">eCitizen Services</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><Phone size={16} className="mt-0.5 shrink-0 text-brand-400" /><a href="tel:+919451228744">+91-9451228744</a></li>
              <li className="flex items-start gap-2"><Mail size={16} className="mt-0.5 shrink-0 text-brand-400" /><a href="mailto:ahardoi30@gmail.com" className="break-all">ahardoi30@gmail.com</a></li>
              <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-brand-400" /><span>1/7 Kanshiram Colony, Hardoi, UP – 241001</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Anureet Private Limited. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
