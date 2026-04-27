// Component: FeatureCard
// Purpose: Single feature card with icon, title, and description
export default function FeatureCard({ icon, title, desc }) {
  return (
    <div className="group [background-color:var(--surface)] hover:[background-color:var(--accent-light)] border [border-color:var(--border-soft)] hover:[border-color:var(--accent-mid)] rounded-2xl p-6 transition-all duration-200">
      <div className="w-10 h-10 rounded-xl [background-color:var(--accent-light)] group-hover:[background-color:var(--accent-light)] border border-forest-100 flex items-center justify-center text-lg mb-4 transition-colors">
        {icon}
      </div>
      <h3 className="font-serif text-lg [color:var(--text)] mb-2">{title}</h3>
      <p className="text-sm [color:var(--text-muted)] leading-relaxed">{desc}</p>
    </div>
  )
}
