import { useState } from 'react'
import { marked } from 'marked'

export default function App() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const cleaned = pasted.replace(/\n\s*\n+/g, '\n')
    const start = e.target.selectionStart
    const end = e.target.selectionEnd
    setText(text.slice(0, start) + cleaned + text.slice(end))
  }

  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 12px', borderBottom: '1px solid #ccc', fontSize: 12, color: '#666' }}>
        <strong style={{ color: '#000' }}>delempty</strong>
        <span>ペーストで空行を自動削除するMarkdownプレビュー</span>
        <button onClick={handleCopy} style={{ marginLeft: 'auto', padding: '2px 10px', fontSize: 12, cursor: 'pointer' }}>
          {copied ? 'Copied!' : 'Copy MD'}
        </button>
      </header>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
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
    </div>
  )
}
