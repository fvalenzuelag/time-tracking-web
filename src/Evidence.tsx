import { ArrowUpRight, Check, FileJson, FlaskConical, Info } from 'lucide-react'

const findings = [
  {
    title: 'A native toolbar search entry point',
    file: 'search-action.json',
    url: new URL('../evidence/search-action.json', import.meta.url).href,
    address: '0x10011ba64',
    snippet: '[r0 beginSearchInteraction];',
    finding: 'The recovered search: handler calls beginSearchInteraction on the search toolbar item.',
  },
  {
    title: 'The query flows into reactive state',
    file: 'search-value-flow.json',
    url: new URL('../evidence/search-value-flow.json', import.meta.url).href,
    address: '0x10011b9b0',
    snippet: '[r0 searchField] → [r0 stringValue]\n→ RxRelay.BehaviorRelay.accept(r20, &var_30);',
    finding: 'The callback behind searchFieldValueChanged: reads the field text and publishes it to a BehaviorRelay. Downstream subscribers were not reconstructed.',
  },
  {
    title: 'Cancellation writes back to the field',
    file: 'search-cancel.json',
    url: new URL('../evidence/search-cancel.json', import.meta.url).href,
    address: '0x100132be8',
    snippet: '[[r19 searchField] retain];\n[r20 setStringValue:r21];',
    finding: 'cancelOperation: sets the search field’s string value. The exact replacement string is not established by this decompilation.',
  },
  {
    title: 'Search-specific empty-state copy',
    file: 'search-strings.json',
    url: new URL('../evidence/search-strings.json', import.meta.url).href,
    address: '0x100276810',
    snippet: '“Consider clearing the search field.”',
    finding: 'This message and a search-specific no-data localization comment are present in the shipped executable. Their presence does not prove when the message appears at runtime.',
  },
]

export function Evidence() {
  return (
    <div className="evidence-page">
      <div className="eyebrow"><FlaskConical size={15} /> RESEARCH, NOT GUESSWORK</div>
      <h1>Behind the search.</h1>
      <p className="page-description">What the installed Timing app tells us, what it doesn’t, and what we chose to build.</p>
      <div className="artifact-banner">
        <FileJson size={24} />
        <div><strong>Timing 2026.6 · Build 595 · arm64</strong><span>Static analysis with REA 4.0.1 and Hopper. Original evidence includes full IDs and artifact hashes.</span></div>
        <span className="badge">Shipped artifact</span>
      </div>
      <div className="evidence-grid">
        {findings.map((finding, index) => (
          <article className="evidence-card" key={finding.file}>
            <div className="evidence-card-top"><span className="evidence-number">0{index + 1}</span><span className="observed"><Check size={13} /> Static observation</span></div>
            <h2>{finding.title}</h2>
            <p>{finding.finding}</p>
            <pre><code>{finding.snippet}</code></pre>
            <a href={finding.url} target="_blank" rel="noreferrer">Open {finding.file}<ArrowUpRight size={14} /></a>
            <span className="address">Address {finding.address}</span>
          </article>
        ))}
      </div>
      <section className="limitations">
        <Info size={20} />
        <div>
          <h2>Where the evidence stops</h2>
          <p>The database framework contains <code>%K CONTAINS[cd] %@</code>, indicating that it uses case- and diacritic-insensitive substring predicates somewhere. We have not linked that predicate to toolbar search. <a href={new URL('../evidence/database-search-strings.json', import.meta.url).href} target="_blank" rel="noreferrer">View predicate evidence</a>.</p>
          <p>REA native UI observation returned <code>capability_unavailable</code>. No reference screenshots or runtime search results were captured. Exact field coverage, tokenization, keyboard shortcuts, ranking, and debounce timing remain unknown.</p>
        </div>
      </section>
      <section className="design-choices">
        <h2>Our implementation choices</h2>
        <p>Instant React state updates; literal, case- and accent-insensitive substring matching across title, path, app, and project; intersecting project/date scopes; chronological results; Unicode-safe highlights; Command/Control-F to focus and Escape to clear. These are deliberate product choices, not claims of exact Timing compatibility.</p>
        <p>Official context: <a href="https://timingapp.com/help/activities" target="_blank" rel="noreferrer">Activities and date/project scoping <ArrowUpRight size={12} /></a> · <a href="https://timingapp.com/help/filters" target="_blank" rel="noreferrer">Rule-based filters <ArrowUpRight size={12} /></a></p>
      </section>
    </div>
  )
}
