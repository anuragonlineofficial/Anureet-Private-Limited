import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import { CheckCircle2 } from 'lucide-react'

export default function About() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-20">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
              About <span className="gradient-text">Anureet</span>
            </h1>
            <p className="text-lg text-slate-600">
              Simplifying Digital Services for Everyone
            </p>
          </div>

          <div className="card p-8 space-y-6">
            <p className="text-slate-700 leading-relaxed">
              Anureet Private Limited provides convenient digital and online service assistance to
              customers. We aim to make online applications, documentation and government-related
              services easier and more accessible for everyone.
            </p>
            <ul className="space-y-3">
              {[
                'Convenient digital and online service assistance',
                'Fast, reliable and secure processing',
                'Wide range of government-related services',
                'Trusted by thousands of customers'
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                  <span className="text-slate-700">{point}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-slate-500 italic pt-4 border-t">
              Note: We are an independent service provider and not an official government portal.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}