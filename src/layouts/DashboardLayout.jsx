// Layout: DashboardLayout
// Purpose: App shell — sidebar on desktop, bottom nav on mobile, theme-aware background
import SideNav    from '../components/dashboard/SideNav'
import BottomNav  from '../components/dashboard/BottomNav'
import TopBar     from '../components/dashboard/TopBar'
import PageTransition from '../components/ui/PageTransition'

export default function DashboardLayout({ children, activeTab, onTabChange }) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0">
        <SideNav activeTab={activeTab} onTabChange={onTabChange} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar activeTab={activeTab} onTabChange={onTabChange} />
        <main className="flex-1 overflow-y-auto pb-28 md:pb-10 px-4 sm:px-6 md:px-8 pt-5">
          <PageTransition tabKey={activeTab}>
            {children}
          </PageTransition>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
