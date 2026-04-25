// Layout: DashboardLayout
// Purpose: App shell — desktop sidebar, topbar, main content, mobile bottom nav + drawer.
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useOfflineQueueContext } from "../hooks/useOfflineQueue";

import OfflineBanner from "../components/ui/OfflineBanner";
import SideNav from "../components/dashboard/SideNav";
import BottomNav from "../components/dashboard/BottomNav";
import MobileDrawer from "../components/dashboard/MobileDrawer";
import TopBar from "../components/dashboard/TopBar";
import AppFooter from "../components/dashboard/AppFooter";
import PageTransition from "../components/ui/PageTransition";
import MigrationBanner from "../components/auth/MigrationBanner";
import InstallPromptBanner from "../components/ui/InstallPromptBanner";

export default function DashboardLayout({
  children,
  activeTab,
  onTabChange,
  theme,
  onSetTheme,
}) {
  const { user } = useAuth();
  const offline = useOfflineQueueContext() || {
    isOnline: true,
    queueLength: 0,
    replaying: false,
  };
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg)" }}>
      <OfflineBanner
        isOnline={offline.isOnline}
        queueLength={offline.queueLength}
        replaying={offline.replaying}
      />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-shrink-0">
        <SideNav
          activeTab={activeTab}
          onTabChange={onTabChange}
          theme={theme}
          onSetTheme={onSetTheme}
        />
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activeTab={activeTab}
          onTabChange={onTabChange}
          theme={theme}
          onSetTheme={onSetTheme}
        />

        <MigrationBanner userId={user?.id} />

        <main className="flex-1 overflow-y-auto pb-28 md:pb-4 px-4 sm:px-6 md:px-8 pt-5">
          <PageTransition tabKey={activeTab}>{children}</PageTransition>
        </main>

        <AppFooter onTabChange={onTabChange} />
      </div>

      {/* Mobile bottom nav */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      {/* Mobile full drawer — all tabs + profile + theme */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeTab={activeTab}
        onTabChange={onTabChange}
        theme={theme}
        onSetTheme={onSetTheme}
      />

      {/* PWA install prompt – shown once to eligible users */}
      <InstallPromptBanner />
    </div>
  );
}
