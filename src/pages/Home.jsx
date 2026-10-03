import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import Hero from '../components/home/Hero'
import ServiceGrid from '../components/home/ServiceGrid'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ServiceGrid title="Our Services" limit={6} />
      </main>
      <Footer />
    </>
  )
}