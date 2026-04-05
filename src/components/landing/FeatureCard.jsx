// Component: FeatureCard
// Purpose: Single feature card with icon, title, and description
export default function FeatureCard({ icon, title, desc }) {
  return (
    <div className="group bg-white hover:bg-forest-50 border border-stone-100 hover:border-forest-200 rounded-2xl p-6 transition-all duration-200">
      <div className="w-10 h-10 rounded-xl bg-forest-50 group-hover:bg-forest-100 border border-forest-100 flex items-center justify-center text-lg mb-4 transition-colors">
        {icon}
      </div>
      <h3 className="font-serif text-lg text-ink mb-2">{title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
    </div>
  )
}
