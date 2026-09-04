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
  'time', 'mortality', 'gratitude', 'simplicity', 'self-control',
  'adversity', 'presence', 'responsibility', 'relationships', 'courage',
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

  // ── Marcus Aurelius ───────────────────────────────────────────────────────
  {
    id: 'med-4-17',
    quote: 'Do not act as if thou wert going to live ten thousand years… while thou livest, while it is in thy power, be good.',
    author: 'Marcus Aurelius',
    work: 'Meditations',
    section: 'Book IV, 17',
    translation: 'George Long (1862), public domain',
    themes: ['mortality', 'time', 'discipline'],
    meaning: 'The point is not morbidity but urgency: the good you intend is only ever available now.',
  },
  {
    id: 'med-5-16',
    quote: 'Such as are thy habitual thoughts, such also will be the character of thy mind; for the soul is dyed by the thoughts.',
    author: 'Marcus Aurelius',
    work: 'Meditations',
    section: 'Book V, 16',
    translation: 'George Long (1862), public domain',
    themes: ['discipline', 'perspective', 'self-control'],
    meaning: 'What you dwell on repeatedly becomes what you are like. Attention is character, over time.',
  },
  {
    id: 'med-7-59',
    quote: 'Look within. Within is the fountain of good, and it will ever bubble up, if thou wilt ever dig.',
    author: 'Marcus Aurelius',
    work: 'Meditations',
    section: 'Book VII, 59',
    translation: 'George Long (1862), public domain',
    themes: ['presence', 'gratitude'],
    meaning: 'The resource you need is not somewhere else, and it does not arrive on its own — it takes digging.',
  },
  {
    id: 'med-4-43',
    quote: 'Time is like a river made up of the events which happen, and a violent stream; for as soon as a thing has been seen, it is carried away.',
    author: 'Marcus Aurelius',
    work: 'Meditations',
    section: 'Book IV, 43',
    translation: 'George Long (1862), public domain',
    themes: ['time', 'mortality', 'acceptance'],
    meaning: 'Nothing holds still long enough to be gripped. That is a reason to act today, not to despair.',
  },
  {
    id: 'med-4-7',
    quote: 'Take away thy opinion, and then there is taken away the complaint… Take away the complaint, and the harm is taken away.',
    author: 'Marcus Aurelius',
    work: 'Meditations',
    section: 'Book IV, 7',
    translation: 'George Long (1862), public domain',
    themes: ['control', 'perspective', 'acceptance'],
    meaning: 'Much of what stings is the verdict you attach to an event, and the verdict is yours to withdraw.',
  },

  // ── Epictetus ─────────────────────────────────────────────────────────────
  {
    id: 'ench-8',
    quote: 'Demand not that events should happen as you wish; but wish them to happen as they do happen, and you will go on well.',
    author: 'Epictetus',
    work: 'Enchiridion',
    section: '8',
    translation: 'Elizabeth Carter (1758), public domain',
    themes: ['acceptance', 'control'],
    meaning: 'Not passivity — it means spending your effort on your response rather than on protesting the facts.',
  },
  {
    id: 'ench-20',
    quote: 'Remember that it is not he who gives abuse or blows, who affronts; but the view we take of these things as insulting.',
    author: 'Epictetus',
    work: 'Enchiridion',
    section: '20',
    translation: 'Elizabeth Carter (1758), public domain',
    themes: ['relationships', 'self-control', 'patience'],
    meaning: 'The gap between what someone did and how wounded you feel is occupied by your own interpretation.',
  },
  {
    id: 'ench-11',
    quote: 'Never say of anything, I have lost it; but, I have restored it.',
    author: 'Epictetus',
    work: 'Enchiridion',
    section: '11',
    translation: 'Elizabeth Carter (1758), public domain',
    themes: ['acceptance', 'gratitude', 'mortality'],
    meaning: 'A hard teaching about holding things loosely — what you had was always on loan.',
  },
  {
    id: 'ench-43',
    quote: 'Everything has two handles: the one by which it may be borne, the other by which it may not.',
    author: 'Epictetus',
    work: 'Enchiridion',
    section: '43',
    translation: 'Elizabeth Carter (1758), public domain',
    themes: ['perspective', 'adversity'],
    meaning: 'The same situation can be picked up in a way that carries or a way that cuts. You choose the grip.',
  },

  // ── Seneca ────────────────────────────────────────────────────────────────
  {
    id: 'sen-let-2',
    quote: 'To be everywhere is to be nowhere.',
    author: 'Seneca',
    work: 'Moral Letters to Lucilius',
    section: 'Letter 2',
    translation: 'Richard Mott Gummere (1917), public domain',
    themes: ['presence', 'simplicity', 'discipline'],
    meaning: 'Scattering attention across everything is how a day passes without anything actually being done.',
  },
  {
    id: 'sen-brev-1',
    quote: 'It is not that we have a short time to live, but that we waste a lot of it.',
    author: 'Seneca',
    work: 'On the Shortness of Life',
    section: 'I',
    translation: 'John W. Basore (1932), public domain',
    themes: ['time', 'mortality', 'discipline'],
    meaning: 'The complaint is usually about how the time was spent, not how much of it there was.',
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
