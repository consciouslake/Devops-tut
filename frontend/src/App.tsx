import { useState } from 'react'
import { Header } from './components/Header'
import { ModuleOverview } from './components/ModuleOverview'
import { ModuleDetail } from './components/ModuleDetail'
import { ChapterDetail } from './components/ChapterDetail'
import { AIMentor } from './components/AIMentor'
import { modules } from './data/curriculum'
import './styles.css'

export default function App() {
  const [activeModuleNumber, setActiveModuleNumber] = useState<number | null>(null)
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null)

  const activeModule = modules.find((m) => m.number === activeModuleNumber) ?? null
  const activeChapterIndex = activeModule
    ? activeModule.chapters.findIndex((c) => c.id === activeChapterId)
    : -1
  const activeChapter = activeChapterIndex >= 0 ? activeModule!.chapters[activeChapterIndex] : null

  function goOverview() {
    setActiveModuleNumber(null)
    setActiveChapterId(null)
  }

  function goModule() {
    setActiveChapterId(null)
  }

  function selectModule(n: number) {
    setActiveModuleNumber(n)
    setActiveChapterId(null)
  }

  const mentorSubtitle = activeChapter
    ? `Focused on ${activeChapter.title}`
    : activeModule
      ? `Focused on ${activeModule.title}`
      : 'Ask about any topic'

  return (
    <div className="app-shell">
      <Header
        activeModule={activeModule}
        activeChapter={activeChapter}
        onGoOverview={goOverview}
        onGoModule={goModule}
      />
      <div className="main-grid">
        {activeChapter ? (
          <ChapterDetail chapter={activeChapter} order={activeChapterIndex + 1} />
        ) : activeModuleNumber !== null ? (
          <ModuleDetail
            module={activeModule}
            moduleNumber={activeModuleNumber}
            onSelectChapter={setActiveChapterId}
          />
        ) : (
          <ModuleOverview modules={modules} onSelect={selectModule} />
        )}
        <AIMentor subtitle={mentorSubtitle} />
      </div>
    </div>
  )
}
