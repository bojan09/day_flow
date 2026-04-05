// Layout: DashboardLayout
// Purpose: Sidebar + main content wrapper. Sidebar collapses to bottom nav on mobile.
import { useState } from 'react'
import SideNav  from '../components/dashboard/SideNav'
import BottomNav from '../components/dashboard/BottomNav'
import TopBar    from '../components/dashboard/TopBar'

export default function DashboardLayout({ children, activeTab, onTabChange }) {
  return (
    <div className="min-h-screen bg-parchment flex">
      {/* Sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-56 flex-shrink-0">
        <SideNav activeTab={activeTab} onTabChange={onTabChange} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar activeTab={activeTab} />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 px-4 sm:px-6 md:px-8 pt-4">
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
