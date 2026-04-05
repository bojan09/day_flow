// Page: LandingPage
// Purpose: Assembles all landing sections into one scrollable page
import Navbar         from '../components/landing/Navbar'
import HeroSection    from '../components/landing/HeroSection'
import StatsBand      from '../components/landing/StatsBand'
import FeaturesSection from '../components/landing/FeaturesSection'
import CTASection     from '../components/landing/CTASection'
import LandingFooter  from '../components/landing/LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />
      <HeroSection />
      <StatsBand />
      <FeaturesSection />
      <CTASection />
      <LandingFooter />
    </div>
  )
}
