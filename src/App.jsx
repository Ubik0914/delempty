import { useState, useRef } from 'react'
import { marked } from 'marked'

const Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="14" height="14">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>
)

export default function App() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(null)
  const previewRef = useRef(null)

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const cleaned = pasted.replace(/\n\s*\n+/g, '\n')
    const { selectionStart: s, selectionEnd: en } = e.target
    setText(text.slice(0, s) + cleaned + text.slice(en))
  }

  function copy(type) {
    const content = type === 'md' ? text : (previewRef.current?.innerText ?? text)
    navigator.clipboard.writeText(content)
    setCopied(type)
    setTimeout(() => setCopied(null), 1500)
  }

  const btn = (type, label) => (
    <button onClick={() => copy(type)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontSize: 11, cursor: 'pointer', color: copied === type ? '#16a34a' : '#444', background: 'none', border: '1px solid #ccc', borderRadius: 4 }}>
      <Icon />{copied === type ? 'Copied!' : label}
    </button>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 12px', borderBottom: '1px solid #ccc', fontSize: 12, color: '#666' }}>
        <strong style={{ color: '#000' }}>delempty</strong>
        <span>ペーストで空行を自動削除するMarkdownプレビュー</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {btn('md', 'Copy MD')}
          {btn('plain', 'Copy Plain')}
        </div>
      </header>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <textarea
          style={{ flex: 1, padding: 16, fontSize: 14, resize: 'none', border: 'none', borderRight: '1px solid #ccc', outline: 'none' }}
          value={text}
          onChange={e => setText(e.target.value)}
          onPaste={handlePaste}
          placeholder="Markdown を入力..."
        />
        <div ref={previewRef} style={{ flex: 1, padding: 16, overflow: 'auto' }}
          dangerouslySetInnerHTML={{ __html: marked(text) }} />
      </div>
    </div>
  )
}
