import { useRef, useState } from 'react'

type Message = { role: 'user' | 'assistant'; text: string }

export default function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const wsRef = useRef<WebSocket | null>(null)

  function send() {
    if (!input.trim()) return
    const query = input
    setMessages((m) => [...m, { role: 'user', text: query }, { role: 'assistant', text: '' }])
    setInput('')

    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${proto}://${window.location.host}/chat`)
    wsRef.current = ws
    ws.onopen = () => ws.send(query)
    ws.onmessage = (evt) => {
      if (evt.data === '[[END]]') {
        ws.close()
        return
      }
      setMessages((m) => {
        const copy = [...m]
        copy[copy.length - 1] = { role: 'assistant', text: copy[copy.length - 1].text + evt.data }
        return copy
      })
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>AzureOps Copilot</h1>
      <div style={{ minHeight: 300, border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
        {messages.map((m, i) => (
          <p key={i}>
            <strong>{m.role === 'user' ? 'You' : 'Copilot'}:</strong> {m.text}
          </p>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
        placeholder="Ask about Azure/DevOps..."
        style={{ width: '80%', padding: 8 }}
      />
      <button onClick={send} style={{ padding: 8 }}>
        Send
      </button>
    </div>
  )
}
