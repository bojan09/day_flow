// Component: LandingFooter
// Purpose: Simple footer for the landing page
export default function LandingFooter() {
  return (
    <footer className="border-t border-stone-100 py-6 px-5 flex flex-wrap items-center justify-between gap-3">
      <span className="font-serif text-lg text-ink">
        Day<em className="not-italic text-forest-500">Flow</em>
      </span>
      <p className="text-xs text-ink-faint">© 2026 DayFlow. Built for focused humans.</p>
    </footer>
  )
}
