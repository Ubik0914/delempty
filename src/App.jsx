import { useState, useRef, useEffect, useCallback } from 'react'
import { marked } from 'marked'

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="14" height="14">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>
)

const ExpandIcon = ({ dir }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
    {dir === 'left' || dir === 'up'
      ? <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
      : <path strokeLinecap="round" strokeLinejoin="round" d="M9 9 3.75 3.75m0 4.5v-4.5h4.5M15 15l5.25 5.25m0-4.5v4.5h-4.5" />
    }
  </svg>
)

const LayoutIcon = ({ vertical }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13">
    {vertical
      ? <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5h18M3 12h18M3 16.5h18" />
      : <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3v18M12 3v18M16.5 3v18" />
    }
  </svg>
)

export default function App() {
  const [text, setText] = useState(() => localStorage.getItem('md') ?? '')
  const [copied, setCopied] = useState(null)
  const [split, setSplit] = useState(50)
  const [vertical, setVertical] = useState(() => window.innerWidth < 768)
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
    const rect = containerRef.current.getBoundingClientRect()
    if (vertical) {
      setSplit(Math.min(90, Math.max(10, (e.clientY - rect.top) / rect.height * 100)))
    } else {
      setSplit(Math.min(90, Math.max(10, (e.clientX - rect.left) / rect.width * 100)))
    }
  }, [vertical])

  const onMouseUp = useCallback(() => { dragging.current = false; document.body.style.cursor = '' }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp) }
  }, [onMouseMove, onMouseUp])

  // touch support for SP
  const onTouchMove = useCallback(e => {
    if (!dragging.current) return
    e.preventDefault()
    const rect = containerRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    if (vertical) {
      setSplit(Math.min(90, Math.max(10, (touch.clientY - rect.top) / rect.height * 100)))
    } else {
      setSplit(Math.min(90, Math.max(10, (touch.clientX - rect.left) / rect.width * 100)))
    }
  }, [vertical])

  const onTouchEnd = useCallback(() => { dragging.current = false }, [])

  useEffect(() => {
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => { window.removeEventListener('touchmove', onTouchMove); window.removeEventListener('touchend', onTouchEnd) }
  }, [onTouchMove, onTouchEnd])

  const showFirst = split > 0
  const showSecond = split < 100
  const showDivider = split > 0 && split < 100

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

  const firstSize = vertical
    ? { height: showSecond ? `${split}%` : '100%', width: '100%' }
    : { width: showSecond ? `${split}%` : '100%', height: '100%' }

  const dividerStyle = vertical
    ? { height: 5, cursor: 'row-resize', background: '#ccc', flexShrink: 0, width: '100%' }
    : { width: 5, cursor: 'col-resize', background: '#ccc', flexShrink: 0 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 12px', borderBottom: '1px solid #ccc', fontSize: 12, color: '#666', flexShrink: 0 }}>
        <strong style={{ color: '#000' }}>delempty</strong>
        <span style={{ display: window.innerWidth < 480 ? 'none' : '' }}>ペーストで空行を自動削除するMarkdownプレビュー</span>
        <div style={{ marginLeft: 'auto' }}>
          {iconBtn(() => { setVertical(v => !v); setSplit(50) }, <LayoutIcon vertical={vertical} />)}
        </div>
      </header>

      <div ref={containerRef} style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', flex: 1, overflow: 'hidden' }}>
        {/* Editor */}
        <div style={{ ...firstSize, position: 'relative', flexShrink: 0, display: showFirst ? 'block' : 'none' }}>
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
            style={dividerStyle}
            onMouseDown={() => { dragging.current = true; document.body.style.cursor = vertical ? 'row-resize' : 'col-resize' }}
            onTouchStart={() => { dragging.current = true }}
            onDoubleClick={() => setSplit(50)}
          />
        )}

        {/* Preview */}
        <div style={{ position: 'relative', flex: 1, overflow: 'hidden', display: showSecond ? 'block' : 'none' }}>
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
