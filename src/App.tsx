import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity as ActivityIcon, ArrowDown, ArrowUpRight, BookOpen, CalendarDays,
  Check, ChevronRight, Circle, Clock3, Code2, Compass, FileText,
  FlaskConical, Folder, Info, Layers3, Search, Sparkles, Timer, X,
} from 'lucide-react'
import { activities, dateBounds, projects, type DateScope } from './data'
import { Evidence } from './Evidence'
import { formatDuration, highlightMatches, searchActivities, type Activity, type SearchField } from './search'

type Page = 'activities' | 'evidence'
const fieldLabels = { all: 'Everywhere', title: 'Title', path: 'Path or URL', application: 'Application', project: 'Project' }
const dateFormatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' })
const timeFormatter = new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' })
const fullDateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' })

function Highlight({ text, query }: { text: string; query: string }) {
  return <>{highlightMatches(text, query).map((part, i) => part.matched ? <mark key={i}>{part.text}</mark> : <span key={i}>{part.text}</span>)}</>
}

function AppIcon({ application }: { application: string }) {
  const Icon = application === 'VS Code' ? Code2 : application === 'Safari' ? Compass
    : application === 'Figma' ? Layers3 : application === 'Preview' ? FileText
      : application === 'Notes' ? BookOpen : ActivityIcon
  return <span className={`app-icon app-${application.toLowerCase().replaceAll(' ', '-')}`}><Icon size={19} strokeWidth={1.8} /></span>
}

function ProjectDot({ project }: { project: string }) {
  const color = projects.find((p) => p.name === project)?.color ?? 'gray'
  return <span className={`project-dot ${color}`} aria-hidden="true" />
}

export function App() {
  const [page, setPage] = useState<Page>(window.location.hash === '#evidence' ? 'evidence' : 'activities')
  const [query, setQuery] = useState('')
  const [field, setField] = useState<SearchField | 'all'>('all')
  const [project, setProject] = useState('')
  const [dateScope, setDateScope] = useState<DateScope>('week')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const result = useMemo(() => searchActivities(activities, {
    query, field, project, ...dateBounds[dateScope],
  }), [query, field, project, dateScope])
  const selected = result.activities.find((a) => a.id === selectedId)
  const hasFilters = query !== '' || field !== 'all' || project !== '' || dateScope !== 'week'
  const textQuery = (target: SearchField) => field === 'all' || field === target ? query : ''
  const totalDuration = activities.reduce((sum, a) => sum + a.durationSeconds, 0)
  const projectTotals = projects.map((p) => ({
    ...p, seconds: result.activities.filter((a) => a.project === p.name).reduce((sum, a) => sum + a.durationSeconds, 0),
  })).filter((p) => p.seconds > 0).sort((a, b) => b.seconds - a.seconds)

  function navigate(next: Page) {
    setPage(next)
    window.location.hash = next === 'evidence' ? 'evidence' : 'activities'
  }

  function reset() {
    setQuery('')
    setField('all')
    setProject('')
    setDateScope('week')
    setSelectedId(null)
  }

  useEffect(() => {
    const handleHash = () => setPage(window.location.hash === '#evidence' ? 'evidence' : 'activities')
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f' && page === 'activities') {
        event.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      }
    }
    window.addEventListener('hashchange', handleHash)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('hashchange', handleHash)
      window.removeEventListener('keydown', handleKey)
    }
  }, [page])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <aside className="sidebar" aria-label="Workspace navigation">
        <a className="brand" href="#activities" onClick={() => navigate('activities')} aria-label="Tempo home">
          <span className="brand-icon"><Timer size={23} /></span><span>tempo<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-label">PERSONAL WORKSPACE</div>
        <nav className="main-nav" aria-label="Main">
          <button className={`nav-item ${page === 'activities' ? 'active' : ''}`} onClick={() => navigate('activities')} aria-current={page === 'activities' ? 'page' : undefined}><ActivityIcon size={18} />Activities<span className="nav-count">{activities.length}</span></button>
          <button className={`nav-item ${page === 'evidence' ? 'active' : ''}`} onClick={() => navigate('evidence')} aria-current={page === 'evidence' ? 'page' : undefined}><FlaskConical size={18} />Search evidence<ArrowUpRight size={14} className="nav-arrow" /></button>
        </nav>
        <div className="sidebar-section-title"><span>PROJECTS</span><span>{projects.length}</span></div>
        <nav className="project-nav" aria-label="Projects">
          <button className={`project-item ${!project ? 'chosen' : ''}`} aria-pressed={!project} onClick={() => { setProject(''); navigate('activities') }}><Folder size={16} />All projects{!project && <Check size={14} />}</button>
          {projects.map((p) => (
            <button key={p.name} className={`project-item ${project === p.name ? 'chosen' : ''}`} aria-pressed={project === p.name} onClick={() => { setProject(p.name); navigate('activities') }}>
              <ProjectDot project={p.name} />{p.name}{project === p.name && <Check size={14} />}
            </button>
          ))}
          <button className={`project-item ${project === 'Unassigned' ? 'chosen' : ''}`} aria-pressed={project === 'Unassigned'} onClick={() => { setProject('Unassigned'); navigate('activities') }}><Circle size={13} />Unassigned{project === 'Unassigned' && <Check size={14} />}</button>
        </nav>
        <div className="sidebar-note"><span className="note-icon"><Sparkles size={17} /></span><strong>A little more clarity.</strong><p>Find the work behind your hours. One search at a time.</p><button onClick={() => navigate('evidence')}>Explore the research <ChevronRight size={13} /></button></div>
        <div className="sidebar-bottom"><span className="avatar">Y</span><div><strong>Your workspace</strong><span>Local demo · No account needed</span></div></div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">Workspace<ChevronRight size={13} /><span>{page === 'activities' ? 'Activities' : 'Search evidence'}</span></div>
          <span className="demo-badge"><span />Sample data</span>
        </header>
        <main id="main" tabIndex={-1}>
          {page === 'evidence' ? <Evidence /> : (
            <div className="activity-page">
              <div className="page-heading">
                <div><div className="eyebrow">MAKE SENSE OF YOUR DAY</div><h1>Your time, in focus<span>.</span></h1><p className="page-description">A clearer picture of what you’ve been working on.</p></div>
                <label className="date-control"><CalendarDays size={16} /><span className="sr-only">Date range</span><select aria-label="Date range" value={dateScope} onChange={(e) => setDateScope(e.target.value as DateScope)}><option value="week">Nov 3 – 9, 2026</option><option value="today">Nov 9, 2026</option><option value="all">All dates</option></select></label>
              </div>

              <section className="search-section" aria-label="Search activities">
                <div className="search-bar">
                  <Search size={21} className="search-icon" />
                  <input ref={searchRef} type="search" aria-label="Search activities" placeholder="Search titles, apps, websites, and more…" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); setQuery('') } }} autoComplete="off" spellCheck={false} />
                  {query ? <button className="icon-button clear-search" aria-label="Clear search" onClick={() => { setQuery(''); searchRef.current?.focus() }}><X size={17} /></button> : <kbd className="search-shortcut">⌘ / Ctrl F</kbd>}
                  <div className="field-divider" />
                  <label className="field-select"><span className="sr-only">Search field</span><select aria-label="Search field" value={field} onChange={(e) => setField(e.target.value as SearchField | 'all')}>{Object.entries(fieldLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
                </div>
                <div className="search-hint"><span><Info size={13} />Literal search, without case or accents.</span><span className="suggestions">Try <button onClick={() => setQuery('atlas')}>atlas</button> or <button onClick={() => setQuery('cafe')}>cafe</button></span></div>
              </section>

              <div className="workspace-grid">
                <section className="results-panel" aria-label="Activity results">
                  <div className="results-toolbar">
                    <div><h2>{query.trim() ? 'Search results' : project || 'All activities'}</h2><span role="status" aria-live="polite" aria-atomic="true" className="result-count">{result.count} {result.count === 1 ? 'activity' : 'activities'} · {formatDuration(result.durationSeconds)}</span></div>
                    <div className="results-actions">{hasFilters && <button className="text-button" onClick={reset}>Reset filters</button>}<span className="sort-label"><ArrowDown size={13} />Newest first</span></div>
                  </div>
                  {(project || field !== 'all') && <div className="filter-chips">{project && <button className="filter-chip" onClick={() => setProject('')} aria-label={`Remove project filter ${project}`}><ProjectDot project={project} />{project}<X size={12} /></button>}{field !== 'all' && <button className="filter-chip" onClick={() => setField('all')} aria-label="Remove field filter">{fieldLabels[field]}<X size={12} /></button>}</div>}
                  {result.count > 0 ? (
                    <>
                      <div className="table-head" aria-hidden="true"><span>ACTIVITY</span><span>PROJECT</span><span>TIME</span></div>
                      <ul className="activity-list" aria-label="Matching activities">
                        {result.activities.map((activity) => (
                          <li key={activity.id}>
                            <button className={`activity-row ${selected?.id === activity.id ? 'selected' : ''}`} aria-pressed={selected?.id === activity.id} onClick={() => setSelectedId(selectedId === activity.id ? null : activity.id)}>
                              <AppIcon application={activity.application} />
                              <span className="activity-info"><span className="activity-title" title={activity.title}><Highlight text={activity.title} query={textQuery('title')} /></span><span className="activity-meta"><span className="application-name"><Highlight text={activity.application} query={textQuery('application')} /></span><span className="meta-dot">·</span><span className="activity-path" title={activity.path}><Highlight text={activity.path} query={textQuery('path')} /></span></span></span>
                              <span className="row-project"><ProjectDot project={activity.project} /><span><Highlight text={activity.project} query={textQuery('project')} /></span></span>
                              <span className="row-time"><strong>{formatDuration(activity.durationSeconds)}</strong><span>{dateFormatter.format(new Date(activity.startedAt))}</span></span>
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="results-footer"><Check size={13} />You’re all caught up. Showing all {result.count} matching {result.count === 1 ? 'activity' : 'activities'}.</div>
                    </>
                  ) : (
                    <div className="empty-state"><span className="empty-icon"><Search size={29} /></span><h3>No activities found</h3><p>{query.trim() ? <>Nothing matches “{query.trim()}” in this view.</> : 'There are no activities in the selected scope.'}<br />Try another search or reset your filters.</p>{query && <button className="primary-button" onClick={() => { setQuery(''); searchRef.current?.focus() }}>Clear Search</button>}<button className="text-button" onClick={reset}>Reset All Filters</button></div>
                  )}
                </section>

                <aside className="insights-column" aria-label="Search insights">
                  {selected ? <ActivityDetail activity={selected} onClose={() => setSelectedId(null)} /> : (
                    <section className="summary-card"><span className="eyebrow">TIME IN THIS VIEW</span><div className="total-time">{formatDuration(result.durationSeconds)}</div><span className="summary-subtitle">across {result.count} {result.count === 1 ? 'activity' : 'activities'}</span><div className="duration-track" aria-hidden="true">{projectTotals.map((p) => <span key={p.name} className={p.color} style={{ width: `${p.seconds / Math.max(result.durationSeconds, 1) * 100}%` }} />)}</div><div className="summary-comparison"><Clock3 size={14} /><span>{Math.round(result.durationSeconds / totalDuration * 100)}% of the sample week</span></div></section>
                  )}
                  <section className="project-breakdown"><div className="card-heading"><h2>By project</h2><Folder size={15} /></div>{projectTotals.length ? projectTotals.map((p) => <button key={p.name} className="breakdown-row" onClick={() => setProject(p.name)} aria-label={`Filter by ${p.name}`}><ProjectDot project={p.name} /><span>{p.name}</span><strong>{formatDuration(p.seconds)}</strong></button>) : <p className="muted">No assigned project time in this view.</p>}{result.activities.some((a) => a.project === 'Unassigned') && <button className="breakdown-row" onClick={() => setProject('Unassigned')}><ProjectDot project="Unassigned" /><span>Unassigned</span><strong>{formatDuration(result.activities.filter((a) => a.project === 'Unassigned').reduce((sum, a) => sum + a.durationSeconds, 0))}</strong></button>}</section>
                  <div className="tip-card"><span className="tip-heading"><Search size={15} />Find a little faster</span><p>Search a document title, an app, or a fragment of a URL. Accents don’t get in the way.</p><button onClick={() => { setQuery('cafe'); searchRef.current?.focus() }}>Try “cafe” <ArrowUpRight size={14} /></button></div>
                </aside>
              </div>
              <footer className="page-footer"><span><span className="local-dot" />Runs locally in your browser. No activity data is uploaded.</span><button onClick={() => navigate('evidence')}>Inspired by Timing. Backed by evidence.<ArrowUpRight size={12} /></button><span className="demo-explanation">Synthetic demo · Nov 3–9, 2026 · UTC</span></footer>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function ActivityDetail({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  return (
    <section className="detail-card" aria-label="Activity details">
      <div className="card-heading"><h2>Activity details</h2><button className="icon-button" aria-label="Close activity details" onClick={onClose}><X size={16} /></button></div>
      <AppIcon application={activity.application} /><h3>{activity.title}</h3>
      <dl><div><dt>Application</dt><dd>{activity.application}</dd></div><div><dt>Project</dt><dd><ProjectDot project={activity.project} />{activity.project}</dd></div><div><dt>Duration</dt><dd>{formatDuration(activity.durationSeconds)}</dd></div><div><dt>Started (UTC)</dt><dd>{fullDateFormatter.format(new Date(activity.startedAt))}, {timeFormatter.format(new Date(activity.startedAt))}</dd></div><div className="detail-path"><dt>Path or URL</dt><dd>{activity.path}</dd></div></dl>
    </section>
  )
}
