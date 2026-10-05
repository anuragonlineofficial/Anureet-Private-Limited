"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Zap, Shield, Rocket, Phone, Mail, MapPin } from "lucide-react";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-lg">A</div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Anureet</h1>
              <p className="text-xs text-gray-500 leading-tight">Private Limited</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-gray-700 hover:text-brand-600 font-medium">Home</a>
            <a href="#services" className="text-gray-700 hover:text-brand-600 font-medium">Services</a>
            <a href="#about" className="text-gray-700 hover:text-brand-600 font-medium">About</a>
            <a href="#contact" className="text-gray-700 hover:text-brand-600 font-medium">Contact</a>
            <Link href="/login" className="btn-primary py-2.5 px-5 text-sm">Login</Link>
          </nav>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2" aria-label="Menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in">
            <div className="px-4 py-4 flex flex-col gap-4">
              <a href="#home" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">Home</a>
              <a href="#services" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">Services</a>
              <a href="#about" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">About</a>
              <a href="#contact" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">Contact</a>
              <Link href="/login" className="btn-primary text-center">Login</Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-blue-50 py-20 md:py-32">
        <div className="relative max-w-7xl mx-auto px-4 text-center animate-fade-up">
          <div className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold mb-6">
            🇮🇳 Trusted Digital Services Platform
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            Anureet <span className="bg-gradient-to-r from-brand-600 to-blue-600 bg-clip-text text-transparent">Private Limited</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
            Professional digital services for VLE operators and citizens across India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#services" className="btn-primary text-lg px-8 py-4">Explore Services →</a>
            <Link href="/login" className="btn-secondary text-lg px-8 py-4">Login</Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 text-lg">Built for speed, security and reliability</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap size={28} />, title: "Fast Processing", desc: "Applications processed quickly with verified payments." },
              { icon: <Shield size={28} />, title: "100% Secure", desc: "Bank-grade security with Cashfree payment gateway." },
              { icon: <Rocket size={28} />, title: "Trusted Platform", desc: "Serving VLE operators across Uttar Pradesh." },
            ].map((f, i) => (
              <div key={i} className="card p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-gray-600 text-lg">Login to browse and apply for available services</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Ration Card Services", price: "₹50" },
              { name: "Aadhaar Update", price: "₹100" },
              { name: "PAN Card Apply", price: "₹150" },
              { name: "Income Certificate", price: "₹80" },
              { name: "Domicile Certificate", price: "₹80" },
              { name: "Caste Certificate", price: "₹80" },
            ].map((s, i) => (
              <div key={i} className="card p-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-bold mb-4">{s.name[0]}</div>
                <h3 className="text-lg font-bold mb-2">{s.name}</h3>
                <p className="text-gray-500 text-sm mb-4">Apply online through our secure portal</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-brand-600">{s.price}</span>
                  <Link href="/login" className="text-brand-600 font-semibold text-sm hover:underline">Apply →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">About Anureet Private Limited</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Anureet Private Limited is a professional digital services platform based in Hardoi, Uttar Pradesh.
            We empower VLE operators to deliver essential government and digital services to citizens with speed, transparency and trust.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 bg-gradient-to-br from-brand-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
            <p className="text-brand-100 text-lg">We'd love to hear from you</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Phone className="mx-auto mb-3" size={32} />
              <h3 className="font-bold mb-1">Mobile</h3>
              <a href="tel:+919451228744" className="text-brand-100 hover:text-white">+91-9451228744</a>
            </div>
            <div className="text-center">
              <Mail className="mx-auto mb-3" size={32} />
              <h3 className="font-bold mb-1">Email</h3>
              <a href="mailto:ahardoi30@gmail.com" className="text-brand-100 hover:text-white break-all">ahardoi30@gmail.com</a>
            </div>
            <div className="text-center">
              <MapPin className="mx-auto mb-3" size={32} />
              <h3 className="font-bold mb-1">Address</h3>
              <p className="text-brand-100 text-sm">1/7 Kanshiram Colony, Lucknow Road, Hardoi, UP 241001</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">Anureet Private Limited</h3>
            <p className="text-sm">Digital Services Platform</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#home" className="hover:text-white">Home</a></li>
              <li><a href="#services" className="hover:text-white">Services</a></li>
              <li><a href="#about" className="hover:text-white">About</a></li>
              <li><Link href="/login" className="hover:text-white">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#contact" className="hover:text-white">Contact</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms &amp; Conditions</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>📞 +91-9451228744</li>
              <li>✉️ ahardoi30@gmail.com</li>
              <li>📍 Hardoi, UP 241001</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-8 pt-8 border-t border-gray-800">
          © {new Date().getFullYear()} Anureet Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
