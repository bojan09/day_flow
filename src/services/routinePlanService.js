// Service: routinePlanService
// Purpose: AI-drafted routine steps or goal milestones from a plain-text
//          description. Draft is always returned for user review — never
//          auto-saved by this module.
import { callClaude } from './aiService'

const ROUTINE_SYSTEM_PROMPT = `Given a one-sentence goal, draft a short routine as a JSON array of steps, no prose:
[{"text": "step description", "duration": minutes_as_number_or_null}]. Keep it to 3-6 steps.`

const GOAL_SYSTEM_PROMPT = `Given a one-sentence goal, draft milestones as a JSON array, no prose:
[{"title": "milestone title", "description": "one short sentence"}]. Keep it to 3-5 milestones.`

export async function draftRoutine(goalText) {
  try {
    const raw = await callClaude(ROUTINE_SYSTEM_PROMPT, goalText)
    const parsed = JSON.parse(raw.trim())
    return Array.isArray(parsed) ? parsed.map((s, i) => ({ id: `draft-${i}`, text: s.text, duration: s.duration ?? null })) : []
  } catch {
    return []
  }
}

export async function draftGoalMilestones(goalText) {
  try {
    const raw = await callClaude(GOAL_SYSTEM_PROMPT, goalText)
    const parsed = JSON.parse(raw.trim())
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
