// Utils: Time-based greeting and rotating motivational quotes
export function getGreeting(name = '') {
  const hour = new Date().getHours()
  const base =
    hour < 5  ? 'Good night'      :
    hour < 12 ? 'Good morning'    :
    hour < 17 ? 'Good afternoon'  :
    hour < 21 ? 'Good evening'    :
                'Good night'
  return name ? `${base}, ${name}` : base
}

const QUOTES = [
  "Small steps every day lead to big results.",
  "What you do today is what matters most.",
  "Progress, not perfection.",
  "One focused hour beats three scattered ones.",
  "Show up. Do the work. Trust the process.",
  "You don't have to be extreme. Just consistent.",
  "Make today so good that yesterday gets jealous.",
  "Discipline is just choosing between what you want now and what you want most.",
  "The secret is to show up — even when you don't feel like it.",
  "Your habits are quietly shaping who you become.",
  "Every master was once a beginner who just refused to stop.",
  "Done is better than perfect.",
  "Start where you are. Use what you have. Do what you can.",
  "The present moment is where your power lives.",
  "Be the person your future self will be proud of.",
]

export function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  return QUOTES[dayOfYear % QUOTES.length]
}
