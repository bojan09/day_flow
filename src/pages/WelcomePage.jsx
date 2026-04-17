// Page: WelcomePage
// Purpose: The dedicated entry page for logged-out users —
//          hero + features + how-it-works + CTA + footer
//          Always shows for unauthenticated visitors.
import { useEffect } from 'react'
import WelcomeNav       from '../components/welcome/WelcomeNav'
import WelcomeHero      from '../components/welcome/WelcomeHero'
import WelcomeFeatures  from '../components/welcome/WelcomeFeatures'
import WelcomeHowItWorks from '../components/welcome/WelcomeHowItWorks'
import WelcomeCTA       from '../components/welcome/WelcomeCTA'
import WelcomeFooter    from '../components/welcome/WelcomeFooter'
import StatsBand from '../components/landing/StatsBand'

export default function WelcomePage() {
  useEffect(() => {
    // Reset to light theme on welcome page
    const saved = localStorage.getItem('dayflow_theme') || 'light'
    document.documentElement.setAttribute('data-theme', saved)
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <WelcomeNav />
      <WelcomeHero />
      <StatsBand />
      <WelcomeFeatures />
      <WelcomeHowItWorks />
      <WelcomeCTA />
      <WelcomeFooter />
    </div>
  )
}
