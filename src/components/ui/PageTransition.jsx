// Component: PageTransition
// Purpose: Fade+slide transition when switching between dashboard tabs
import { useEffect, useRef } from 'react'

export default function PageTransition({ children, tabKey }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    ref.current.style.opacity = '0'
    ref.current.style.transform = 'translateY(10px)'

    const frame = requestAnimationFrame(() => {
      if (!ref.current) return
      ref.current.style.transition = 'opacity 0.28s ease, transform 0.28s ease'
      ref.current.style.opacity    = '1'
      ref.current.style.transform  = 'translateY(0)'
    })

    return () => cancelAnimationFrame(frame)
  }, [tabKey])

  return (
    <div ref={ref} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}
