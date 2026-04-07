import { useState } from 'react'
import { marked } from 'marked'

export default function App() {
  const [text, setText] = useState('')

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const cleaned = pasted.replace(/\n\s*\n+/g, '\n')
    const start = e.target.selectionStart
    const end = e.target.selectionEnd
    const next = text.slice(0, start) + cleaned + text.slice(end)
    setText(next)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <textarea
        style={{ flex: 1, padding: 16, fontSize: 14, resize: 'none', border: 'none', borderRight: '1px solid #ccc', outline: 'none' }}
        value={text}
        onChange={e => setText(e.target.value)}
        onPaste={handlePaste}
        placeholder="Markdown を入力..."
      />
      <div
        style={{ flex: 1, padding: 16, overflow: 'auto' }}
        dangerouslySetInnerHTML={{ __html: marked(text) }}
      />
    </div>
  )
}
