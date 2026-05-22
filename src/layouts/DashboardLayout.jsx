// Layout: DashboardLayout
// Purpose: App shell. Root is flex-row (sidebar + main-column).
//          OfflineBanner lives INSIDE main-column — not in root flex-row.
//          main-column is flex-col + min-h-screen so footer is always anchored.
import { useState }        from 'react'
import { useAuth }         from '../hooks/useAuth'
import { useOfflineQueueContext } from '../hooks/useOfflineQueue'
import OfflineBanner       from '../components/ui/OfflineBanner'
import SideNav             from '../components/dashboard/SideNav'
import BottomNav           from '../components/dashboard/BottomNav'
import MobileDrawer        from '../components/dashboard/MobileDrawer'
import TopBar              from '../components/dashboard/TopBar'
import AppFooter           from '../components/dashboard/AppFooter'
import PageTransition      from '../components/ui/PageTransition'
import MigrationBanner     from '../components/auth/MigrationBanner'
import InstallPromptBanner from '../components/ui/InstallPromptBanner'

export default function DashboardLayout({ children, activeTab, onTabChange, theme, onSetTheme }) {
  const { user }  = useAuth()
  const offline   = useOfflineQueueContext() || { isOnline: true, queueLength: 0, replaying: false }
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex" style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>

      {/* Desktop sidebar — fixed width, full height */}
      <aside className="hidden md:flex w-60 flex-shrink-0">
        <SideNav activeTab={activeTab} onTabChange={onTabChange} theme={theme} onSetTheme={onSetTheme} />
      </aside>

      {/* Main column — flex-col so footer sticks to bottom */}
      <div className="flex-1 flex flex-col min-w-0" style={{ minHeight: '100vh' }}>

        <TopBar activeTab={activeTab} onTabChange={onTabChange} theme={theme} onSetTheme={onSetTheme} />

        {/* OfflineBanner inside column — spans content width, never breaks sidebar */}
        <OfflineBanner isOnline={offline.isOnline} queueLength={offline.queueLength} replaying={offline.replaying} />

        <MigrationBanner userId={user?.id} />

        {/* flex-1 pushes AppFooter to the very bottom */}
        <main className="flex-1 overflow-y-auto pb-28 md:pb-4 px-4 sm:px-6 md:px-8 pt-5">
          <PageTransition tabKey={activeTab}>{children}</PageTransition>
        </main>

        {/* Footer — always anchored at column bottom */}
        <AppFooter />
      </div>

      {/* Mobile overlays — position:fixed, outside normal flow */}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} onOpenDrawer={() => setDrawerOpen(true)} />
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} activeTab={activeTab} onTabChange={onTabChange} theme={theme} onSetTheme={onSetTheme} />
      <InstallPromptBanner />
    </div>
  )
}
