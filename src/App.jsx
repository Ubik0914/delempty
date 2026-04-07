import { useState, useRef, useEffect, useCallback } from 'react'
import { marked } from 'marked'

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="14" height="14">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>
)

const ExpandIcon = ({ dir }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
    {dir === 'left'
      ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
      : <path strokeLinecap="round" strokeLinejoin="round" d="M9 9 3.75 3.75m0 4.5v-4.5h4.5M15 15l5.25 5.25m0-4.5v4.5h-4.5" />
    }
  </svg>
)

export default function App() {
  const [text, setText] = useState(() => localStorage.getItem('md') ?? '')
  const [copied, setCopied] = useState(null)
  const [split, setSplit] = useState(50) // 0=preview only, 100=editor only, else %
  const previewRef = useRef(null)
  const containerRef = useRef(null)
  const dragging = useRef(false)

  useEffect(() => { localStorage.setItem('md', text) }, [text])

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text')
    const cleaned = pasted.replace(/\n\s*\n+/g, '\n')
    const { selectionStart: s, selectionEnd: en } = e.target
    setText(text.slice(0, s) + cleaned + text.slice(en))
  }

  function copy(type) {
    navigator.clipboard.writeText(type === 'md' ? text : (previewRef.current?.innerText ?? text))
    setCopied(type)
    setTimeout(() => setCopied(null), 1500)
  }

  const onMouseMove = useCallback(e => {
    if (!dragging.current) return
    const { left, width } = containerRef.current.getBoundingClientRect()
    setSplit(Math.min(90, Math.max(10, (e.clientX - left) / width * 100)))
  }, [])

  const onMouseUp = useCallback(() => { dragging.current = false; document.body.style.cursor = '' }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp) }
  }, [onMouseMove, onMouseUp])

  const copyBtn = (type, label) => (
    <button onClick={() => copy(type)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', fontSize: 11, cursor: 'pointer', color: copied === type ? '#16a34a' : '#444', background: 'rgba(255,255,255,0.9)', border: '1px solid #ccc', borderRadius: 4 }}>
      <CopyIcon />{copied === type ? 'Copied!' : label}
    </button>
  )

  const iconBtn = (onClick, children) => (
    <button onClick={onClick} style={{ display: 'flex', padding: 3, cursor: 'pointer', color: '#888', background: 'rgba(255,255,255,0.85)', border: '1px solid #ddd', borderRadius: 4 }}>
      {children}
    </button>
  )

  const showLeft = split > 0
  const showRight = split < 100
  const showDivider = split > 0 && split < 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 12px', borderBottom: '1px solid #ccc', fontSize: 12, color: '#666' }}>
        <strong style={{ color: '#000' }}>delempty</strong>
        <span>ペーストで空行を自動削除するMarkdownプレビュー</span>
      </header>
      <div ref={containerRef} style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Editor */}
        <div style={{ width: showRight ? `${split}%` : '100%', position: 'relative', flexShrink: 0, display: showLeft ? 'block' : 'none' }}>
          <textarea
            style={{ width: '100%', height: '100%', padding: 16, paddingBottom: 40, fontSize: 14, resize: 'none', border: 'none', outline: 'none', boxSizing: 'border-box' }}
            value={text} onChange={e => setText(e.target.value)} onPaste={handlePaste}
            placeholder="Markdown を入力..."
          />
          <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 6 }}>
            {copyBtn('md', 'Copy MD')}{copyBtn('plain', 'Copy Plain')}
          </div>
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            {iconBtn(() => setSplit(s => s === 100 ? 50 : 100), <ExpandIcon dir={split === 100 ? 'right' : 'left'} />)}
          </div>
        </div>

        {/* Divider */}
        {showDivider && (
          <div
            onMouseDown={() => { dragging.current = true; document.body.style.cursor = 'col-resize' }}
            onDoubleClick={() => setSplit(50)}
            style={{ width: 5, cursor: 'col-resize', background: '#ccc', flexShrink: 0 }}
          />
        )}

        {/* Preview */}
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden', display: showRight ? 'block' : 'none' }}>
          <div ref={previewRef} style={{ height: '100%', padding: 16, overflow: 'auto', boxSizing: 'border-box' }}
            dangerouslySetInnerHTML={{ __html: marked(text) }} />
          <div style={{ position: 'absolute', top: 8, right: 8 }}>
            {iconBtn(() => setSplit(s => s === 0 ? 50 : 0), <ExpandIcon dir={split === 0 ? 'left' : 'right'} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
