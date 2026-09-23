import { useState } from 'react'

type Message = { role: 'user' | 'assistant'; text: string }
type Mode = 'rag' | 'ai'

export function AIMentor({ subtitle }: { subtitle: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hi! I'm your AI mentor. Ask me anything about Azure/DevOps." },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mode, setMode] = useState<Mode>('rag')

  function send() {
    if (isTyping) return
    const query = input.trim()
    if (!query) return
    setMessages((m) => [...m, { role: 'user', text: query }, { role: 'assistant', text: '' }])
    setInput('')
    setIsTyping(true)

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${proto}://${window.location.host}/chat`)
    ws.onopen = () => ws.send(JSON.stringify({ query, mode }))
    ws.onmessage = (evt) => {
      if (evt.data === '[[END]]') {
        setIsTyping(false)
        ws.close()
        return
      }
      setMessages((m) => {
        const copy = [...m]
        copy[copy.length - 1] = { role: 'assistant', text: copy[copy.length - 1].text + evt.data }
        return copy
      })
    }
    ws.onerror = () => setIsTyping(false)
    ws.onclose = () => setIsTyping(false)
  }

  return (
    <div className="mentor">
      <div className="mentor-header">
        <div className="mentor-status-dot" />
        <div className="mentor-header-text">
          <div className="mentor-title">AI Mentor</div>
          <div className="mentor-subtitle">{subtitle}</div>
        </div>
        <div className="mentor-mode-toggle" role="group" aria-label="Chat mode">
          <button
            className={`mentor-mode-btn ${mode === 'rag' ? 'active' : ''}`}
            onClick={() => setMode('rag')}
            title="Answers grounded in ingested documents (Qdrant retrieval)"
          >
            RAG
          </button>
          <button
            className={`mentor-mode-btn ${mode === 'ai' ? 'active' : ''}`}
            onClick={() => setMode('ai')}
            title="Plain Gemini chat, no document retrieval"
          >
            AI
          </button>
        </div>
      </div>
      <div className="mentor-messages">
        {messages.map((m, i) => (
          <div className={`mentor-msg ${m.role}`} key={i}>
            {m.text}
          </div>
        ))}
        {isTyping && <div className="mentor-typing mono">AI Mentor is typing…</div>}
      </div>
      <div className="mentor-input-row">
        <div className="mentor-input-flex">
          <input
            className="mentor-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask me anything about DevOps…"
            disabled={isTyping}
          />
          <button className="mentor-send" onClick={send} disabled={isTyping}>
            Send
          </button>
        </div>
        <div className="mentor-disclaimer">
          {mode === 'rag'
            ? 'RAG mode: answers grounded in ingested docs. '
            : 'AI mode: plain Gemini chat, no document retrieval. '}
          AI Mentor can make mistakes — verify commands before running in production.
        </div>
      </div>
    </div>
  )
}
