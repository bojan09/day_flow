// Page: LandingPage
// Purpose: Assembles all landing sections — theme-aware background
import { useEffect } from 'react'
import Navbar          from '../components/landing/Navbar'
import HeroSection     from '../components/landing/HeroSection'
import StatsBand       from '../components/landing/StatsBand'
import FeaturesSection from '../components/landing/FeaturesSection'
import CTASection      from '../components/landing/CTASection'
import LandingFooter   from '../components/landing/LandingFooter'

export default function LandingPage() {
  // Reset to light theme on landing — dashboard theme doesn't bleed in
  useEffect(() => {
    const saved = localStorage.getItem('dayflow_theme') || 'light'
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Navbar />
      <HeroSection />
      <StatsBand />
      <FeaturesSection />
      <CTASection />
      <LandingFooter />
    </div>
  )
}
