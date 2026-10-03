import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import ServiceGrid from '../components/home/ServiceGrid'

export default function Services() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <ServiceGrid title="All Digital Services" />
      </main>
      <Footer />
    </>
  )
}