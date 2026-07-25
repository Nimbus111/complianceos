'use client'

import { useState, useEffect, useRef } from 'react'

const info: Record<string, string> = {
  'State Compliance Guide': 'Shows all x-ray requirements for your state, facility type, and modalities — including federal rules and EPE alerts.',
  'Equipment & Safety': 'Track x-ray devices with service contacts, lead protection garments with a shared vendor, and dosimetry badges.',
  'Equipment QA': 'Set manufacturer-recommended QA procedures and schedules per device. Tracks overdue items.',
  'X-ray Operators': 'Store credentials, certifications, safety training, and CEU certificates for each operator.',
  'Document Repository': 'Upload and organize your compliance documents by category with expiry tracking.',
  'RSP Builder': 'Generate your Radiation Protection Program. Required in most states. AI-assisted drafting.',
  'Compliance Calendar': 'Renewal dates, QA schedules, and inspection deadlines in one view.',
  'Inspector Report': 'Printable compliance summary showing your current Required Actions score.',
  'Technique Charts': 'Download The Last Technique Chart You\'ll Ever Need plus guidance on building your own.',
  'Keys to Success': '21-step compliance checklist with video guidance from The Radiology Coach.',
  'AI Assistant': 'Ask any compliance question. Answers are state-specific and facility-aware.',
  'State Documents': 'Official forms, applications, and regulatory documents from your state agency.',
  'Video Training': 'Expert tutorial videos from The Radiology Coach covering compliance essentials.',
  'Preferred Partners': 'PACS storage, radiology reading services, and equipment compliance partners.',
  'Account Settings': 'Update facility info, dealer contact, team members, and subscription.',
}

interface Feature { name: string; desc: string; border: string; href?: string }

export default function FeatureCards({ features, activityMap = {} }: {
  features: Feature[]
  activityMap?: Record<string, boolean>
}) {
  const [activeInfo, setActiveInfo] = useState<string | null>(null)
  const [showTips, setShowTips] = useState(true)
  const [dense, setDense] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setShowTips(localStorage.getItem('tips_hidden') !== 'true')
    setDense(localStorage.getItem('cards_dense') === 'true')
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveInfo(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleTips = () => {
    const next = !showTips
    setShowTips(next)
    localStorage.setItem('tips_hidden', String(!next))
    if (!next) setActiveInfo(null)
  }

  const toggleDense = () => {
    const next = !dense
    setDense(next)
    localStorage.setItem('cards_dense', String(next))
  }

  const saveScroll = () => sessionStorage.setItem('dashScrollY', String(window.scrollY))

  return (
    <div ref={containerRef}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <button onClick={toggleDense}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '28px', padding: '0 10px', background: dense ? '#0d2d5e' : '#fff', border: `1px solid ${dense ? '#0d2d5e' : '#c2ddf0'}`, borderRadius: '7px', fontSize: '11px', fontWeight: '500', color: dense ? '#fff' : '#4a6d8c', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {dense ? '⊞ Full view' : '⊟ Compact'}
        </button>
        <button onClick={toggleTips}
          style={{ height: '28px', padding: '0 10px', background: '#fff', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '11px', fontWeight: '500', color: '#4a6d8c', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
          {showTips ? 'Hide tips' : 'Show tips'}
        </button>
      </div>

      {/* ── COMPACT VIEW ── */}
      {dense && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '7px' }}>
          {features.map(f => {
            const isActive = activityMap[f.name] || false
            const card = (
              <div style={{
                height: '52px', padding: '0 13px', display: 'flex', alignItems: 'center', gap: '9px',
                background: isActive ? '#f8fffe' : '#fff',
                border: `1px solid ${isActive ? '#40916c' : f.border}`,
                borderLeft: `3px solid ${isActive ? '#40916c' : f.border}`,
                borderRadius: '9px', cursor: f.href ? 'pointer' : 'default',
                transition: 'border-color .15s',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isActive ? '#40916c' : '#dce8f5', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e', lineHeight: '1.35', flex: 1 }}>{f.name}</span>
                {!f.href && <span style={{ fontSize: '10px', color: '#a8a39c', flexShrink: 0 }}>soon</span>}
                {f.href && isActive && <span style={{ fontSize: '10px', color: '#40916c', flexShrink: 0 }}>●</span>}
              </div>
            )
            return f.href ? (
              <a key={f.name} href={f.href} style={{ textDecoration: 'none' }} onClick={saveScroll}>{card}</a>
            ) : (
              <div key={f.name}>{card}</div>
            )
          })}
        </div>
      )}

      {/* ── FULL VIEW ── */}
      {!dense && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {features.map(f => {
            const isActive = activityMap[f.name] || false
            const desc = info[f.name]
            const isOpen = activeInfo === f.name

            function InfoBtn() {
              if (!desc || !showTips) return null
              return (
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setActiveInfo(isOpen ? null : f.name) }}
                  style={{ width: '20px', height: '20px', borderRadius: '50%', background: isOpen ? '#0d2d5e' : '#e8f3fb', border: '1px solid #c2ddf0', color: isOpen ? '#fff' : '#4a6d8c', fontSize: '11px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1 }}>
                  i
                </button>
              )
            }

            function Popover() {
              if (!isOpen || !desc) return null
              return (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: '4px', background: '#0d2d5e', borderRadius: '10px', padding: '12px 14px', boxShadow: '0 4px 16px rgba(13,45,94,.18)' }}>
                  <p style={{ fontSize: '12px', color: '#e8f3fb', lineHeight: '1.65', margin: 0 }}>{desc}</p>
                </div>
              )
            }

            return (
              <div key={f.name} style={{ position: 'relative' }}>
                {f.href ? (
                  <a href={f.href} style={{ textDecoration: 'none', display: 'block' }} onClick={saveScroll}>
                    <div style={{ background: isActive ? '#f8fffe' : '#fff', border: `1px solid ${isActive ? '#40916c' : f.border}`, borderRadius: '12px', padding: '20px', transition: 'border-color .2s', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: 0, paddingRight: '8px' }}>{f.name}</p>
                        <InfoBtn />
                      </div>
                      <p style={{ fontSize: '12px', color: '#827d76', lineHeight: '1.55', marginBottom: '14px' }}>{f.desc}</p>
                      <span style={{ background: isActive ? '#edfaf3' : '#e8f3fb', color: isActive ? '#2d6a4f' : '#0d2d5e', fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', border: `1px solid ${isActive ? '#b8e8cc' : '#c2ddf0'}` }}>
                        Open →
                      </span>
                    </div>
                  </a>
                ) : (
                  <div style={{ background: '#fff', border: `1px solid ${f.border}`, borderRadius: '12px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: 0, paddingRight: '8px' }}>{f.name}</p>
                      <InfoBtn />
                    </div>
                    <p style={{ fontSize: '12px', color: '#827d76', lineHeight: '1.55', marginBottom: '14px' }}>{f.desc}</p>
                    <span style={{ background: '#f4f7fb', color: '#a8a39c', fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', border: '1px solid #e8e6e2' }}>
                      Coming soon
                    </span>
                  </div>
                )}
                <Popover />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}