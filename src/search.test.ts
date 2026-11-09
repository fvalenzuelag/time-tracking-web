import { describe, expect, it } from 'vitest'
import { activities } from './data'
import { foldText, formatDuration, highlightMatches, searchActivities, type SearchField } from './search'

describe('literal Unicode search', () => {
  it.each(['cafe', 'CAFÉ', 'cafe\u0301', '  Café  '])('matches accents and case: %s', (query) => {
    expect(searchActivities(activities, { query }).activities.map((a) => a.id)).toEqual(['05', '11'])
  })

  it.each(['', ' ', '\n\t', '\u0301'])('treats a normalized empty query as unfiltered: %j', (query) => {
    expect(searchActivities(activities, { query }).count).toBe(16)
  })

  it.each(['[draft]', 'search?q=atlas', 'Search.tsx'])('treats metacharacters literally: %s', (query) => {
    expect(searchActivities(activities, { query }).count).toBe(1)
  })

  it('does not invent regex, boolean operators, or multi-term matching', () => {
    for (const query of ['.*', 'atlas || cafe', 'atlas && search', 'homepage figma']) {
      expect(searchActivities(activities, { query }).count).toBe(0)
    }
  })

  it.each([
    ['title', 'Café', 2], ['path', 'github.com', 0], ['path', '/Projects/', 3],
    ['application', 'SAFARI', 4], ['project', 'Learning', 2], ['title', 'Safari', 0],
  ] as [SearchField, string, number][])('restricts %s to %s', (field, query, count) => {
    expect(searchActivities(activities, { query, field }).count).toBe(count)
  })

  it('intersects query, project, and half-open date scope', () => {
    const result = searchActivities(activities, {
      query: 'atlas', project: 'Atlas website',
      from: '2026-11-09T00:00:00Z', to: '2026-11-10T00:00:00Z',
    })
    expect(result.activities.map((a) => a.id)).toEqual(['01', '02', '03'])
    expect(result.durationSeconds).toBe(8520)
  })

  it('uses inclusive start and exclusive end', () => {
    expect(searchActivities(activities, {
      query: '', from: activities[0]!.startedAt, to: activities[0]!.startedAt,
    }).count).toBe(0)
  })

  it('keeps scopes when the text is cleared', () => {
    expect(searchActivities(activities, { query: '', project: 'Learning' }).count).toBe(2)
  })

  it('sorts without mutating input and calculates totals from the same result set', () => {
    const input = [...activities].reverse()
    const original = [...input]
    const result = searchActivities(input, { query: '' })
    expect(input).toEqual(original)
    expect(result.activities.map((a) => a.id)).toEqual(activities.map((a) => a.id))
    expect(result.durationSeconds).toBe(activities.reduce((sum, a) => sum + a.durationSeconds, 0))
  })

  it('rejects invalid bounds instead of silently returning no data', () => {
    expect(() => searchActivities(activities, { query: '', from: 'invalid' })).toThrow(RangeError)
    expect(() => searchActivities(activities, { query: '', from: '2026-11-10', to: '2026-11-09' })).toThrow(RangeError)
  })
})

describe('original-text highlight mapping', () => {
  it.each([
    ['A Café visit', 'cafe', 'Café'],
    ['A Cafe\u0301 visit', 'cafe', 'Cafe\u0301'],
    ['🧑🏽‍💻 Café', 'cafe', 'Café'],
    ['CAFÉ + café', 'CAFE', 'CAFÉcafé'],
    ['Search [draft].tsx', '[draft]', '[draft]'],
    ['ΟΣ', 'ος', 'ΟΣ'],
    ['👩🏽‍💻 Coding', '👩', '👩🏽‍💻'],
  ])('preserves graphemes in %s', (text, query, matched) => {
    const parts = highlightMatches(text, query)
    expect(parts.map((p) => p.text).join('')).toBe(text)
    expect(parts.filter((p) => p.matched).map((p) => p.text).join('')).toBe(matched)
  })

  it('handles empty queries and nonmatches', () => {
    expect(highlightMatches('Café', '   ')).toEqual([{ text: 'Café', matched: false }])
    expect(highlightMatches('Café', 'tea')).toEqual([{ text: 'Café', matched: false }])
    expect(foldText('Café')).toBe('cafe')
    expect(foldText('ΟΣ')).toBe(foldText('ος'))
  })

  it('renders safe text parts rather than HTML', () => {
    expect(highlightMatches('<script>alert(1)</script>', 'script').map((p) => p.text).join(''))
      .toBe('<script>alert(1)</script>')
  })
})

it.each([[0, '0m'], [30, '<1m'], [60, '1m'], [3599, '59m'], [3600, '1h 0m'], [3900, '1h 5m']] as const)(
  'formats %s seconds', (seconds, formatted) => expect(formatDuration(seconds)).toBe(formatted),
)
