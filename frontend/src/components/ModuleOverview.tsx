import { Module, stubModules } from '../data/curriculum'

export function ModuleOverview({
  modules,
  onSelect,
}: {
  modules: Module[]
  onSelect: (moduleNumber: number) => void
}) {
  const byNumber = new Map(modules.map((m) => [m.number, m]))
  const all: { number: number; title: string; outcome: string; mono?: string; chapters?: Module['chapters'] }[] = [
    ...modules,
    ...stubModules.filter((s) => !byNumber.has(s.number)),
  ].sort((a, b) => a.number - b.number)

  return (
    <div className="overview">
      <div className="eyebrow mono">CURRICULUM</div>
      <h1>Azure DevOps, module by module</h1>
      <p className="overview-sub">
        Fourteen modules, in the order this plan tackles them — foundations before Azure,
        Azure before advanced networking, with a final module showing the complete, real
        architecture of everything built. Click a module to open its chapters. Content fills
        in as each module is actually studied.
      </p>

      <div className="topic-row">
        {all.map((m, i) => {
          const hasContent = (m.chapters?.length ?? 0) > 0
          return (
            <div className="topic-row-item" key={m.number}>
              <button className="topic-card" onClick={() => onSelect(m.number)}>
                <div className="topic-card-top">
                  <div className="topic-card-icon mono">{m.mono ?? m.title.slice(0, 2).toUpperCase()}</div>
                  <span className="topic-card-order mono">{String(m.number).padStart(2, '0')}</span>
                </div>
                <div className="topic-card-title">{m.title}</div>
                <div className={`topic-card-desc${hasContent ? '' : ' empty'}`}>
                  {hasContent ? m.outcome : 'Not written yet'}
                </div>
              </button>
              {i < all.length - 1 && <span className="topic-arrow">→</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
