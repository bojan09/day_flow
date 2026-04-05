// Service: notificationService
// Purpose: Browser Notifications API wrapper for task and habit reminders
export const notifications = {
  isSupported: () => 'Notification' in window,

  async requestPermission() {
    if (!this.isSupported()) return 'unsupported'
    return Notification.requestPermission()
  },

  async getPermission() {
    if (!this.isSupported()) return 'unsupported'
    return Notification.permission
  },

  send(title, body, options = {}) {
    if (!this.isSupported() || Notification.permission !== 'granted') return
    const n = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    })
    setTimeout(() => n.close(), 6000)
    return n
  },

  scheduleReminder(task) {
    if (!task.reminderAt) return
    const delay = new Date(task.reminderAt).getTime() - Date.now()
    if (delay <= 0) return
    setTimeout(() => {
      this.send(`📋 Reminder: ${task.title}`, task.category || 'DayFlow reminder')
    }, delay)
  },

  sendStreakCelebration(streakCount) {
    this.send(`🔥 ${streakCount}-Day Streak!`, "You're on fire — keep your streak alive today!")
  },

  sendDailySummary(done, total) {
    this.send('✅ Daily Summary', `You completed ${done} of ${total} tasks today. Great work!`)
  },
}
