// Component: PageTransition
// Purpose: GSAP-powered fade+slide transition when switching between dashboard tabs
import { useEffect, useRef } from 'react'

export default function PageTransition({ children, tabKey }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    // Use CSS animation as GSAP fallback — works without npm install
    ref.current.style.opacity = '0'
    ref.current.style.transform = 'translateY(10px)'

    const frame = requestAnimationFrame(() => {
      if (!ref.current) return
      ref.current.style.transition = 'opacity 0.28s ease, transform 0.28s ease'
      ref.current.style.opacity    = '1'
      ref.current.style.transform  = 'translateY(0)'
    })

    // If GSAP is available, use it for a richer effect
    if (typeof window !== 'undefined' && window.gsap) {
      cancelAnimationFrame(frame)
      window.gsap.fromTo(ref.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' }
      )
    }

    return () => cancelAnimationFrame(frame)
  }, [tabKey])

  return (
    <div ref={ref} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}
