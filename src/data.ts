import type { Activity } from './search'

export const projects = [
  { name: 'Atlas website', color: 'purple', description: 'Design & development' },
  { name: 'Client work', color: 'blue', description: 'Projects & collaboration' },
  { name: 'Learning', color: 'green', description: 'A little better, every day' },
  { name: 'Admin', color: 'amber', description: 'Keeping things running' },
] as const

// Entirely synthetic fixtures; these are not imported from Timing or the host.
export const activities: Activity[] = [
  { id: '01', title: 'Homepage exploration — Atlas', path: 'figma.com/design/atlas/homepage', application: 'Figma', project: 'Atlas website', startedAt: '2026-11-09T15:10:00Z', durationSeconds: 2820 },
  { id: '02', title: 'Search component implementation', path: '/Projects/atlas/src/components/Search.tsx', application: 'VS Code', project: 'Atlas website', startedAt: '2026-11-09T14:00:00Z', durationSeconds: 3900 },
  { id: '03', title: 'Atlas — weekly design review', path: 'meet.google.com/atlas-review', application: 'Google Meet', project: 'Atlas website', startedAt: '2026-11-09T13:15:00Z', durationSeconds: 1800 },
  { id: '04', title: 'Feedback on the new direction', path: 'mail.google.com/mail/u/0/#inbox/client-feedback', application: 'Safari', project: 'Client work', startedAt: '2026-11-09T11:30:00Z', durationSeconds: 960 },
  { id: '05', title: 'Café branding — visual references', path: 'are.na/studio/café-branding', application: 'Safari', project: 'Client work', startedAt: '2026-11-09T10:40:00Z', durationSeconds: 2100 },
  { id: '06', title: 'React accessibility patterns', path: 'react.dev/learn/accessibility', application: 'Safari', project: 'Learning', startedAt: '2026-11-09T10:00:00Z', durationSeconds: 1500 },
  { id: '07', title: 'November invoices', path: '/Documents/Finance/November-invoices.numbers', application: 'Numbers', project: 'Admin', startedAt: '2026-11-09T09:20:00Z', durationSeconds: 1320 },
  { id: '08', title: 'A quiet moment', path: 'music.apple.com/library', application: 'Music', project: 'Unassigned', startedAt: '2026-11-09T09:00:00Z', durationSeconds: 600 },
  { id: '09', title: 'Atlas typography & spacing', path: 'figma.com/design/atlas/design-system', application: 'Figma', project: 'Atlas website', startedAt: '2026-11-08T14:00:00Z', durationSeconds: 3300 },
  { id: '10', title: 'API integration: search?q=atlas', path: '/Projects/atlas/src/api/search.ts', application: 'VS Code', project: 'Atlas website', startedAt: '2026-11-07T11:00:00Z', durationSeconds: 2400 },
  { id: '11', title: 'Propuesta de diseño — Café del Sur', path: '/Documents/Clients/Café-del-Sur/Propuesta.pdf', application: 'Preview', project: 'Client work', startedAt: '2026-11-06T15:00:00Z', durationSeconds: 2700 },
  { id: '12', title: 'Working with Unicode in JavaScript', path: 'developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize', application: 'Safari', project: 'Learning', startedAt: '2026-11-06T10:00:00Z', durationSeconds: 1680 },
  { id: '13', title: 'Quarterly planning & team notes', path: '/Documents/Studio/Planning.md', application: 'Notes', project: 'Admin', startedAt: '2026-11-05T09:00:00Z', durationSeconds: 2100 },
  { id: '14', title: 'Navigation prototypes — responsive states, keyboard interactions, and long document titles', path: 'figma.com/design/atlas/navigation', application: 'Figma', project: 'Atlas website', startedAt: '2026-11-04T14:30:00Z', durationSeconds: 3600 },
  { id: '15', title: 'Search [draft].tsx — edge cases', path: '/Projects/atlas/tests/search.test.ts', application: 'VS Code', project: 'Atlas website', startedAt: '2026-11-03T13:00:00Z', durationSeconds: 1920 },
  { id: '16', title: 'Welcome to the new client workspace', path: 'app.slack.com/client/studio/general', application: 'Slack', project: 'Client work', startedAt: '2026-11-03T09:00:00Z', durationSeconds: 1080 },
]

export type DateScope = 'week' | 'today' | 'all'
export const dateBounds: Record<DateScope, { from?: string; to?: string }> = {
  today: { from: '2026-11-09T00:00:00Z', to: '2026-11-10T00:00:00Z' },
  week: { from: '2026-11-03T00:00:00Z', to: '2026-11-10T00:00:00Z' },
  all: {},
}
