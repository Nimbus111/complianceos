'use client'

import { useState } from 'react'

export default function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy} style={{
      padding: '5px 14px', border: '1px solid #b8e8cc', borderRadius: '6px',
      background: copied ? '#edfaf3' : '#fff', color: copied ? '#2d6a4f' : '#1a5fa8',
      fontSize: '12px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap',
      transition: 'all 0.15s',
    }}>
      {copied ? '✓ Copied!' : label}
    </button>
  )
}