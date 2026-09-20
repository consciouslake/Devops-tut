import { Topic } from '../data/topics'

export function Header({
  activeTopic,
  onGoOverview,
}: {
  activeTopic: Topic | null
  onGoOverview: () => void
}) {
  return (
    <div className="header">
      <div className="header-left">
        <button className="brand" onClick={onGoOverview}>
          <div className="brand-mark" />
          <span className="brand-name">AzureOps Copilot</span>
        </button>
        {activeTopic && (
          <>
            <span className="breadcrumb">/</span>
            <button className="breadcrumb-back" onClick={onGoOverview}>
              ← All topics
            </button>
            <span className="breadcrumb">/</span>
            <span className="breadcrumb-active mono">{activeTopic.title}</span>
          </>
        )}
      </div>
      <span className="header-tag mono">self-paced · Azure DevOps</span>
    </div>
  )
}
