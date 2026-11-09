/** Framework-independent activity search. All dates are ISO instants. */
export interface Activity {
  id: string
  title: string
  path: string
  application: string
  project: string
  startedAt: string
  durationSeconds: number
}

export const searchFields = ['title', 'path', 'application', 'project'] as const
export type SearchField = (typeof searchFields)[number]

export interface SearchOptions {
  query: string
  field?: SearchField | 'all'
  project?: string
  /** Inclusive start, exclusive end; callers choose their calendar/time zone. */
  from?: string
  to?: string
}

export interface TextPart {
  text: string
  matched: boolean
}

const segmenter = new Intl.Segmenter('und', { granularity: 'grapheme' })

export function foldText(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/ς/g, 'σ')
}

/**
 * Map each folded UTF-16 offset back to a complete original grapheme.
 * This preserves accents, decomposed combining marks, and emoji in highlights.
 */
export function highlightMatches(text: string, query: string): TextPart[] {
  const needle = foldText(query.trim())
  if (!needle) return [{ text, matched: false }]

  let folded = ''
  const starts: number[] = []
  const ends: number[] = []
  for (const { segment, index } of segmenter.segment(text)) {
    const normalized = foldText(segment)
    folded += normalized
    for (let i = 0; i < normalized.length; i++) {
      starts.push(index)
      ends.push(index + segment.length)
    }
  }

  const ranges: { start: number; end: number }[] = []
  let offset = 0
  while (offset <= folded.length - needle.length) {
    const found = folded.indexOf(needle, offset)
    if (found < 0) break
    const range = { start: starts[found]!, end: ends[found + needle.length - 1]! }
    const previous = ranges.at(-1)
    if (previous && range.start <= previous.end) previous.end = Math.max(previous.end, range.end)
    else ranges.push(range)
    offset = found + needle.length
  }

  if (!ranges.length) return [{ text, matched: false }]
  const parts: TextPart[] = []
  let cursor = 0
  for (const { start, end } of ranges) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), matched: false })
    parts.push({ text: text.slice(start, end), matched: true })
    cursor = end
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), matched: false })
  return parts
}

export function searchActivities(activities: readonly Activity[], options: SearchOptions) {
  const query = foldText(options.query.trim())
  const fields = options.field && options.field !== 'all' ? [options.field] : searchFields
  const from = options.from ? Date.parse(options.from) : -Infinity
  const to = options.to ? Date.parse(options.to) : Infinity
  if (Number.isNaN(from) || Number.isNaN(to) || from > to) {
    throw new RangeError('Search date bounds must be valid ISO dates in ascending order.')
  }

  const results = activities.filter((activity) => {
    const started = Date.parse(activity.startedAt)
    return Number.isFinite(started)
      && started >= from && started < to
      && (!options.project || activity.project === options.project)
      && (!query || fields.some((field) => foldText(activity[field]).includes(query)))
  }).sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt) || a.id.localeCompare(b.id))

  return {
    activities: results,
    count: results.length,
    durationSeconds: results.reduce((total, activity) => total + activity.durationSeconds, 0),
  }
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  if (minutes === 0) return seconds === 0 ? '0m' : '<1m'
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`
}
