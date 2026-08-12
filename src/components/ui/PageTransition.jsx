// Component: PageTransition
// Purpose: Lightweight CSS transition when switching between dashboard tabs
export default function PageTransition({ children, tabKey }) {
  return (
    <div key={tabKey} className="animate-fade-up motion-reduce:animate-none">
      {children}
    </div>
  )
}
