// Component: Card
// Purpose: Reusable white surface container with shadow and border
export default function Card({ children, className = '', noPad = false }) {
  return (
    <div className={`bg-white rounded-2xl border border-stone-100 shadow-sm ${noPad ? '' : 'p-5'} ${className}`}>
      {children}
    </div>
  )
}
