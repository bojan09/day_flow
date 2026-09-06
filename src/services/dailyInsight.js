// Service: dailyInsight
// Purpose: "A thought worth carrying forward... generated only when useful"
//          — spec §29.
//
// This was originally an AI-generated observation. With AI removed from the
// app entirely, the honest non-AI equivalent is not a synthesized insight
// dressed up to sound like one — it is the single strongest pattern already
// present in the user's own counted answers (buildWeeklyReflection), stated
// as a plain fact. Nothing here infers cause, motive, or meaning; it only
// reports what was actually chosen or written, and only when repeated
// enough times (3+) that it is a real pattern rather than noise — which is
// what "generated only when useful" means without a model to judge context.
export function dailyInsight(weekly) {
  if (!weekly?.enough) return null

  const candidates = []
  if (weekly.topIntention?.count >= 3) {
    candidates.push({
      count: weekly.topIntention.count,
      text: `${weekly.topIntention.count} days this week you set out to be ${String(weekly.topIntention.value).toLowerCase()}.`,
    })
  }
  if (weekly.topFeeling?.count >= 3) {
    candidates.push({
      count: weekly.topFeeling.count,
      text: `${weekly.topFeeling.count} days this week felt ${String(weekly.topFeeling.value).toLowerCase()}.`,
    })
  }
  if (!candidates.length) return null

  candidates.sort((a, b) => b.count - a.count)
  return candidates[0].text
}
