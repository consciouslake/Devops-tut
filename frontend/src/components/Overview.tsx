import { Topic } from '../data/topics'

export function Overview({ topics, onSelect }: { topics: Topic[]; onSelect: (id: string) => void }) {
  return (
    <div className="overview">
      <div className="eyebrow mono">BIRD'S-EYE VIEW</div>
      <h1>All of Azure DevOps, at a glance</h1>
      <p className="overview-sub">
        Eight topics, in the order this plan tackles them. Click any one to dig in — your AI
        mentor on the right can answer questions the whole time. Content fills in as each topic
        is completed.
      </p>

      <div className="topic-row">
        {topics.map((topic, i) => (
          <div className="topic-row-item" key={topic.id}>
            <button className="topic-card" onClick={() => onSelect(topic.id)}>
              <div className="topic-card-top">
                <div className="topic-card-icon mono">{topic.mono}</div>
                <span className="topic-card-order mono">0{i + 1}</span>
              </div>
              <div className="topic-card-title">{topic.title}</div>
              <div className={`topic-card-desc${topic.desc ? '' : ' empty'}`}>
                {topic.desc || 'Not added yet'}
              </div>
            </button>
            {i < topics.length - 1 && <span className="topic-arrow">→</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
