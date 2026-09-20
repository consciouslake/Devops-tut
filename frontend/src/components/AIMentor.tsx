import { useState } from 'react'

type Message = { role: 'user' | 'assistant'; text: string }

export function AIMentor({ subtitle }: { subtitle: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hi! I'm your AI mentor. Ask me anything about Azure/DevOps." },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  function send() {
    const query = input.trim()
    if (!query) return
    setMessages((m) => [...m, { role: 'user', text: query }, { role: 'assistant', text: '' }])
    setInput('')
    setIsTyping(true)

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${proto}://${window.location.host}/chat`)
    ws.onopen = () => ws.send(query)
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
  }

  return (
    <div className="mentor">
      <div className="mentor-header">
        <div className="mentor-status-dot" />
        <div>
          <div className="mentor-title">AI Mentor</div>
          <div className="mentor-subtitle">{subtitle}</div>
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
          />
          <button className="mentor-send" onClick={send}>
            Send
          </button>
        </div>
        <div className="mentor-disclaimer">AI Mentor can make mistakes — verify commands before running in production.</div>
      </div>
    </div>
  )
}
