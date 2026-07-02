// Service: repeating/types
// Purpose: Shared shape for every recurring item shown on the Repeating page.
//          Adapters normalize each source (tasks, workouts, …) into this.
//
// RepeatingItem = {
//   id:        string        — source item id
//   sourceId:  string        — same as id (origin record)
//   type:      'task' | 'workout'
//   name:      string
//   frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Custom'
//   scheduleLabel: string    — human summary (e.g. "Mon Wed Fri")
//   nextOccurrence: string|null — YYYY-MM-DD, or null if none
//   status:    'active' | 'paused'
//   endDate:   string|null
// }
export const REPEAT_TYPES = ['task', 'workout']
