// Service: mappers
// Purpose: Convert between camelCase (JS/React) and snake_case (Supabase columns).
//          All writes go through toDB(), all reads come through fromDB().
//          This avoids changing either the schema or the hook field names.

// ── Generic converters ──────────────────────────────────────────────────────
const toSnake = str => str.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)
const toCamel = str => str.replace(/_([a-z])/g, (_, l) => l.toUpperCase())

function convertKeys(obj, keyFn) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(item => convertKeys(item, keyFn))
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [keyFn(k), v])
  )
}

// ── Task mappers ────────────────────────────────────────────────────────────
export const taskMapper = {
  toDB: (task) => ({
    id:             task.id,
    user_id:        task.user_id,
    title:          task.title,
    priority:       task.priority,
    category:       task.category,
    date:           task.date,
    completed:      task.completed,
    completed_at:   task.completedAt   ?? null,
    is_focus:       task.isFocus       ?? false,
    estimate_mins:  task.estimateMins  ?? null,
    is_recurring:   task.isRecurring   ?? false,
    recur_days:     task.recurDays     ?? [],
    recurring_from: task.recurringFrom ?? null,
    recur_status:   task.recurStatus   ?? 'active',
    recur_end_date: task.recurEndDate  ?? null,
    project_id:     task.projectId     ?? null,
    sub_tasks:      task.subTasks      ?? [],
    notes:          task.notes         ?? '',
    reminder_time:  task.reminderTime  ?? null,
    reminder_at:    task.reminderAt    ?? null,
    reminder_sent:  task.reminderSent  ?? false,
    created_at:     task.createdAt,
  }),

  fromDB: (row) => ({
    id:             row.id,
    user_id:        row.user_id,
    title:          row.title,
    priority:       row.priority,
    category:       row.category,
    date:           row.date,
    completed:      row.completed,
    completedAt:    row.completed_at   ?? null,
    isFocus:        row.is_focus       ?? false,
    estimateMins:   row.estimate_mins  ?? null,
    isRecurring:    row.is_recurring   ?? false,
    recurDays:      row.recur_days     ?? [],
    recurringFrom:  row.recurring_from ?? null,
    recurStatus:    row.recur_status   ?? 'active',
    recurEndDate:   row.recur_end_date ?? null,
    projectId:      row.project_id     ?? null,
    subTasks:       row.sub_tasks      ?? [],
    notes:          row.notes          ?? '',
    reminderTime:   row.reminder_time  ?? null,
    reminderAt:     row.reminder_at    ?? null,
    reminderSent:   row.reminder_sent  ?? false,
    createdAt:      row.created_at,
  }),
}

// ── Note mappers ────────────────────────────────────────────────────────────
export const noteMapper = {
  toDB: (note) => ({
    id:         note.id,
    user_id:    note.user_id,
    title:      note.title,
    content:    note.content    ?? '',
    tags:       note.tags       ?? [],
    pinned:     note.pinned     ?? false,
    created_at: note.createdAt,
    updated_at: note.updatedAt  ?? new Date().toISOString(),
  }),

  fromDB: (row) => ({
    id:         row.id,
    user_id:    row.user_id,
    title:      row.title,
    content:    row.content    ?? '',
    tags:       row.tags       ?? [],
    pinned:     row.pinned     ?? false,
    createdAt:  row.created_at,
    updatedAt:  row.updated_at,
  }),
}

// ── Idea mappers ────────────────────────────────────────────────────────────
export const ideaMapper = {
  toDB: (idea) => ({
    id:              idea.id,
    user_id:         idea.user_id,
    title:           idea.title,
    description:     idea.description    ?? '',
    category:        idea.category       ?? 'Other',
    status:          idea.status         ?? 'Raw',
    stars:           idea.stars          ?? 0,
    tags:            idea.tags           ?? [],
    linked_goal_id:  idea.linkedGoalId   ?? null,
    created_at:      idea.createdAt,
    updated_at:      idea.updatedAt      ?? new Date().toISOString(),
  }),

  fromDB: (row) => ({
    id:             row.id,
    user_id:        row.user_id,
    title:          row.title,
    description:    row.description    ?? '',
    category:       row.category       ?? 'Other',
    status:         row.status         ?? 'Raw',
    stars:          row.stars          ?? 0,
    tags:           row.tags           ?? [],
    linkedGoalId:   row.linked_goal_id ?? null,
    createdAt:      row.created_at,
    updatedAt:      row.updated_at,
  }),
}

// ── Goal mappers ────────────────────────────────────────────────────────────
export const goalMapper = {
  toDB: (goal) => ({
    id:           goal.id,
    user_id:      goal.user_id,
    title:        goal.title,
    description:  goal.description  ?? '',
    type:         goal.type         ?? 'Yearly',
    category:     goal.category     ?? 'Personal',
    target_date:  goal.targetDate   ?? null,
    milestones:   goal.milestones   ?? [],
    completed:    goal.completed    ?? false,
    created_at:   goal.createdAt,
  }),

  fromDB: (row) => ({
    id:           row.id,
    user_id:      row.user_id,
    title:        row.title,
    description:  row.description  ?? '',
    type:         row.type         ?? 'Yearly',
    category:     row.category     ?? 'Personal',
    targetDate:   row.target_date  ?? null,
    milestones:   row.milestones   ?? [],
    completed:    row.completed    ?? false,
    createdAt:    row.created_at,
  }),
}

// ── Project mappers ─────────────────────────────────────────────────────────
export const projectMapper = {
  toDB: (p) => ({
    id:          p.id,
    user_id:     p.user_id,
    name:        p.name,
    description: p.description ?? '',
    category:    p.category    ?? 'Personal',
    status:      p.status      ?? 'Active',
    color:       p.color       ?? '#3B6B4B',
    due_date:    p.dueDate     ?? null,
    created_at:  p.createdAt,
  }),

  fromDB: (row) => ({
    id:          row.id,
    user_id:     row.user_id,
    name:        row.name,
    description: row.description ?? '',
    category:    row.category    ?? 'Personal',
    status:      row.status      ?? 'Active',
    color:       row.color       ?? '#3B6B4B',
    dueDate:     row.due_date    ?? null,
    createdAt:   row.created_at,
  }),
}

// ── Bookmark mappers ────────────────────────────────────────────────────────
export const bookmarkMapper = {
  toDB: (b) => ({
    id:         b.id,
    user_id:    b.user_id,
    url:        b.url,
    title:      b.title,
    note:       b.note       ?? '',
    tags:       b.tags       ?? [],
    read:       b.read       ?? false,
    remind_at:  b.remindAt   ?? null,
    created_at: b.createdAt,
  }),

  fromDB: (row) => ({
    id:         row.id,
    user_id:    row.user_id,
    url:        row.url,
    title:      row.title,
    note:       row.note     ?? '',
    tags:       row.tags     ?? [],
    read:       row.read     ?? false,
    remindAt:   row.remind_at ?? null,
    createdAt:  row.created_at,
  }),
}
