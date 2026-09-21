import { Chapter, Module } from '../data/curriculum'

export function Header({
  activeModule,
  activeChapter,
  onGoOverview,
  onGoModule,
}: {
  activeModule: Module | null
  activeChapter: Chapter | null
  onGoOverview: () => void
  onGoModule: () => void
}) {
  return (
    <div className="header">
      <div className="header-left">
        <button className="brand" onClick={onGoOverview}>
          <div className="brand-mark" />
          <span className="brand-name">AzureOps Copilot</span>
        </button>
        {activeModule && (
          <>
            <span className="breadcrumb">/</span>
            <button className="breadcrumb-back" onClick={onGoOverview}>
              ← All modules
            </button>
            <span className="breadcrumb">/</span>
            {activeChapter ? (
              <>
                <button className="breadcrumb-back" onClick={onGoModule}>
                  {activeModule.title}
                </button>
                <span className="breadcrumb">/</span>
                <span className="breadcrumb-active mono">{activeChapter.title}</span>
              </>
            ) : (
              <span className="breadcrumb-active mono">{activeModule.title}</span>
            )}
          </>
        )}
      </div>
      <span className="header-tag mono">self-paced · Azure DevOps</span>
    </div>
  )
}
