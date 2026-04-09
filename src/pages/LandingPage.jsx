// Page: LandingPage
// Purpose: Full landing page — all sections assembled with correct IDs for nav links
import { useEffect } from 'react'
import Navbar             from '../components/landing/Navbar'
import HeroSection        from '../components/landing/HeroSection'
import StatsBand          from '../components/landing/StatsBand'
import FeaturesSection    from '../components/landing/FeaturesSection'
import HowItWorksSection  from '../components/landing/HowItWorksSection'
import CTASection         from '../components/landing/CTASection'
import LandingFooter      from '../components/landing/LandingFooter'

export default function LandingPage() {
  useEffect(() => {
    const saved = localStorage.getItem('dayflow_theme') || 'light'
    document.documentElement.setAttribute('data-theme', saved)
    // Scroll to top when landing page mounts
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Navbar />
      {/* id="hero" allows logo click to scroll to very top */}
      <div id="hero">
        <HeroSection />
      </div>
      <StatsBand />
      {/* id="features" — matches navbar "Features" link */}
      <FeaturesSection />
      {/* id="how-it-works" — matches navbar "How it works" link */}
      <HowItWorksSection />
      {/* id="pricing" — matches navbar "Pricing" link */}
      <CTASection />
      <LandingFooter />
    </div>
  )
}
