import { useState } from 'react'
import { Header } from './components/Header'
import { Overview } from './components/Overview'
import { TopicDetail } from './components/TopicDetail'
import { AIMentor } from './components/AIMentor'
import { topics } from './data/topics'
import './styles.css'

export default function App() {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null)

  const activeIndex = topics.findIndex((t) => t.id === activeTopicId)
  const activeTopic = activeIndex >= 0 ? topics[activeIndex] : null

  return (
    <div className="app-shell">
      <Header activeTopic={activeTopic} onGoOverview={() => setActiveTopicId(null)} />
      <div className="main-grid">
        {activeTopic ? (
          <TopicDetail topic={activeTopic} order={activeIndex + 1} />
        ) : (
          <Overview topics={topics} onSelect={setActiveTopicId} />
        )}
        <AIMentor subtitle={activeTopic ? `Focused on ${activeTopic.title}` : 'Ask about any topic'} />
      </div>
    </div>
  )
}
