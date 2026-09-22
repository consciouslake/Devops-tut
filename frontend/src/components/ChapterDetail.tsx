import { Chapter } from '../data/curriculum'
import { Diagram } from './diagrams/DiagramRegistry'

export function ChapterDetail({ chapter, order }: { chapter: Chapter; order: number }) {
  return (
    <div className="topic-detail">
      <div className="topic-detail-inner">
        <div className="eyebrow mono">CHAPTER {String(order).padStart(2, '0')}</div>
        <h1>{chapter.title}</h1>
        <p className="topic-desc">{chapter.concept}</p>

        {chapter.diagramId && <Diagram id={chapter.diagramId} />}

        <div className="section-label">Why DevOps needs this</div>
        <p className="topic-desc">{chapter.whyDevops}</p>

        {chapter.handsOn.length > 0 && (
          <>
            <div className="section-label mono">hands-on</div>
            {chapter.handsOn.map((h, i) => (
              <div key={i}>
                <div className="section-sublabel">{h.label}</div>
                <pre className="code-block">{h.code}</pre>
              </div>
            ))}
          </>
        )}

        {chapter.troubleshooting.length > 0 && (
          <>
            <div className="section-label">Troubleshooting</div>
            <div className="concepts-list">
              {chapter.troubleshooting.map((t, i) => (
                <div className="concept-item" key={i}>
                  <span className="concept-bullet">▸</span>
                  {t}
                </div>
              ))}
            </div>
          </>
        )}

        {chapter.interview.length > 0 && (
          <>
            <div className="section-label">Interview questions</div>
            <div className="concepts-list">
              {chapter.interview.map((q, i) => (
                <div className="concept-item" key={i}>
                  <span className="concept-bullet">?</span>
                  {q}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="section-label">Azure connection</div>
        <p className="topic-desc" style={{ marginBottom: 40 }}>
          {chapter.azureConnection}
        </p>
      </div>
    </div>
  )
}
