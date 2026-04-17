// Layout: DashboardLayout
// Purpose: App shell — sidebar, topbar, main content, app footer, mobile bottom nav.
//          AppFooter is the logged-in footer (dynamic). No glassmorphism.
import { useAuth }         from '../hooks/useAuth'
import SideNav             from '../components/dashboard/SideNav'
import BottomNav           from '../components/dashboard/BottomNav'
import TopBar              from '../components/dashboard/TopBar'
import AppFooter           from '../components/dashboard/AppFooter'
import PageTransition      from '../components/ui/PageTransition'
import MigrationBanner     from '../components/auth/MigrationBanner'

export default function DashboardLayout({ children, activeTab, onTabChange }) {
  const { user } = useAuth()

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0">
        <SideNav activeTab={activeTab} onTabChange={onTabChange} />
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar activeTab={activeTab} onTabChange={onTabChange} />

        {/* Migration banner — only on first Supabase login */}
        <MigrationBanner userId={user?.id} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-28 md:pb-4 px-4 sm:px-6 md:px-8 pt-5">
          <PageTransition tabKey={activeTab}>
            {children}
          </PageTransition>
        </main>

        {/* Logged-in footer — desktop only */}
        <AppFooter onTabChange={onTabChange} />
      </div>

      {/* Mobile bottom nav */}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
