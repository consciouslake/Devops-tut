import { Topic } from '../data/topics'

export function TopicDetail({ topic, order }: { topic: Topic; order: number }) {
  const hasContent = Boolean(topic.desc || topic.concepts.length || topic.code)

  return (
    <div className="topic-detail">
      <div className="topic-detail-inner">
        <div className="eyebrow mono">
          0{order} · {topic.mono}
        </div>
        <h1>{topic.title}</h1>
        <p className={`topic-desc${topic.desc ? '' : ' empty'}`}>
          {topic.desc || 'Content not added yet — complete this topic in PLAN.md, then ask to generate it.'}
        </p>

        {hasContent ? (
          <>
            {topic.concepts.length > 0 && (
              <>
                <div className="section-label">Key concepts</div>
                <div className="concepts-list">
                  {topic.concepts.map((c, i) => (
                    <div className="concept-item" key={i}>
                      <span className="concept-bullet">▸</span>
                      {c}
                    </div>
                  ))}
                </div>
              </>
            )}
            {topic.code && (
              <>
                <div className="section-label mono">{topic.codeLabel}</div>
                <pre className="code-block">{topic.code}</pre>
              </>
            )}
          </>
        ) : (
          <div className="empty-state">No key concepts or examples yet for this topic.</div>
        )}
      </div>
    </div>
  )
}
