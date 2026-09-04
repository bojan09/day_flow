// Service: stoicReferences
// Purpose: Curated, attributed Stoic passages for the Daily Reflection.
//
// ─────────────────────────────────────────────────────────────────────────────
// THIS FILE IS A CURATED SOURCE OF TRUTH. DO NOT GENERATE ENTRIES WITH AI.
//
// The feature spec is explicit: "Never use AI to invent quotations… If the
// exact wording/source cannot be verified, do not present it as a quotation."
// Wording is therefore tied to a named public-domain translation, because
// translations differ substantially — Long, Hays and Carter render the same
// passage in very different words, and quoting one while citing another is
// still a misattribution.
//
// Rules for adding an entry:
//   1. Quote a specific published translation and name it in `translation`.
//   2. Give `section` ONLY if you are certain of it. Omit it otherwise —
//      an approximate citation is worse than none.
//   3. If you cannot verify the wording against the actual text, leave it out.
//
// The set is intentionally short. Breadth is not worth a fabricated citation.
// ─────────────────────────────────────────────────────────────────────────────

export const THEMES = [
  'control', 'discipline', 'patience', 'perspective', 'acceptance',
  'time', 'adversity', 'presence', 'responsibility', 'relationships',
]

export const STOIC_REFERENCES = [
  {
    id: 'ench-1',
    quote: 'Some things are in our control and others not.',
    author: 'Epictetus',
    work: 'Enchiridion',
    section: '1',
    translation: 'Elizabeth Carter (1758), public domain',
    themes: ['control'],
    meaning: 'The opening move of Stoic practice: separate what you actually govern — your judgements, intentions and effort — from what you do not, such as outcomes, other people, and the past.',
  },
  {
    id: 'ench-5',
    quote: 'Men are disturbed, not by things, but by the principles and notions which they form concerning things.',
    author: 'Epictetus',
    work: 'Enchiridion',
    section: '5',
    translation: 'Elizabeth Carter (1758), public domain',
    themes: ['perspective', 'control'],
    meaning: 'The event and your interpretation of it are two different things. The second is where you have room to work.',
  },
  {
    id: 'med-2-1',
    quote: 'Begin the morning by saying to thyself, I shall meet with the busybody, the ungrateful, arrogant, deceitful, envious, unsocial.',
    author: 'Marcus Aurelius',
    work: 'Meditations',
    section: 'Book II, 1',
    translation: 'George Long (1862), public domain',
    themes: ['relationships', 'patience'],
    meaning: 'Expect friction from other people before the day starts, and it loses its power to knock you off course when it arrives.',
  },
  {
    id: 'med-5-1',
    quote: 'In the morning when thou risest unwillingly, let this thought be present — I am rising to the work of a human being.',
    author: 'Marcus Aurelius',
    work: 'Meditations',
    section: 'Book V, 1',
    translation: 'George Long (1862), public domain',
    themes: ['discipline', 'presence'],
    meaning: 'Not motivation but purpose: the reason to begin is that the work is yours to do, whether or not you feel like it.',
  },
  {
    id: 'med-8-47',
    quote: 'If thou art pained by any external thing, it is not this thing that disturbs thee, but thy own judgement about it. And it is in thy power to wipe out this judgement now.',
    author: 'Marcus Aurelius',
    work: 'Meditations',
    section: 'Book VIII, 47',
    translation: 'George Long (1862), public domain',
    themes: ['control', 'adversity', 'perspective'],
    meaning: 'The judgement is the part you can revise, and you can revise it immediately.',
  },
  {
    id: 'med-6-6',
    quote: 'The best way of avenging thyself is not to become like the wrongdoer.',
    author: 'Marcus Aurelius',
    work: 'Meditations',
    section: 'Book VI, 6',
    translation: 'George Long (1862), public domain',
    themes: ['relationships', 'responsibility'],
    meaning: 'Someone else behaving badly is not a reason to abandon your own standard of conduct.',
  },
  {
    id: 'med-4-3',
    quote: 'Men seek retreats for themselves, houses in the country, sea-shores, and mountains… but this is altogether a mark of the most common sort of men, for it is in thy power whenever thou shalt choose to retire into thyself.',
    author: 'Marcus Aurelius',
    work: 'Meditations',
    section: 'Book IV, 3',
    translation: 'George Long (1862), public domain',
    themes: ['presence', 'perspective'],
    meaning: 'You do not need different circumstances to get a moment of quiet; the retreat is available wherever you are.',
  },
  {
    id: 'sen-let-1',
    quote: 'Nothing, Lucilius, is ours, except time.',
    author: 'Seneca',
    work: 'Moral Letters to Lucilius',
    section: 'Letter 1',
    translation: 'Richard Mott Gummere (1917), public domain',
    themes: ['time'],
    meaning: 'Time is the only possession you spend irreversibly, which makes how you spend today the real decision.',
  },
  {
    id: 'sen-let-13',
    quote: 'We suffer more often in imagination than in reality.',
    author: 'Seneca',
    work: 'Moral Letters to Lucilius',
    section: 'Letter 13',
    translation: 'Richard Mott Gummere (1917), public domain',
    themes: ['adversity', 'perspective'],
    meaning: 'Most of what you brace for never arrives. Worth asking what is actually in front of you today.',
  },
]

// Deterministic pick: the same day shows the same reference to everyone using
// the app, and re-opening the morning review doesn't shuffle it.
export function referenceForDate(dateKey, pool = STOIC_REFERENCES) {
  if (!pool.length) return null
  const n = String(dateKey).split('-').reduce((sum, part) => sum + Number(part), 0)
  return pool[n % pool.length]
}

export function referenceByTheme(theme, pool = STOIC_REFERENCES) {
  return pool.filter(r => r.themes.includes(theme))
}
