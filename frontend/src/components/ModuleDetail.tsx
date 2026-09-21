import { Module } from '../data/curriculum'

export function ModuleDetail({
  module,
  onSelectChapter,
}: {
  module: Module | null
  moduleNumber: number
  onSelectChapter: (chapterId: string) => void
}) {
  if (!module || module.chapters.length === 0) {
    return (
      <div className="topic-detail">
        <div className="topic-detail-inner">
          <div className="empty-state">
            Content not written yet — see CURRICULUM.md for the planned chapter list. Ask to
            generate this module once you reach it.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="topic-detail">
      <div className="topic-detail-inner">
        <div className="eyebrow mono">
          MODULE {String(module.number).padStart(2, '0')} · {module.mono}
        </div>
        <h1>{module.title}</h1>
        <p className="topic-desc">{module.outcome}</p>

        <div className="section-label">Chapters</div>
        <div className="concepts-list">
          {module.chapters.map((c, i) => (
            <button
              key={c.id}
              className="chapter-row"
              onClick={() => onSelectChapter(c.id)}
            >
              <span className="concept-bullet mono">{String(i + 1).padStart(2, '0')}</span>
              {c.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
