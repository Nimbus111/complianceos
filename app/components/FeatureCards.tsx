'use client'

import { useState, useEffect, useRef } from 'react'

const info: Record<string, string> = {
  'Compliance calendar': 'Track renewal dates, QA deadlines, and inspection schedules. Events are color-coded by category and shown in a list view and a 12-month year grid with dot indicators.',
  'Document repository': 'Upload and store all compliance documents — registrations, RSP, inspection reports, personnel records, dosimetry reports. Set expiration date reminders so nothing lapses.',
  'Equipment inventory': 'Log every x-ray machine with model, serial number, and registration numbers. Lead aprons tracked here too. Required for your Inspection Report.',
  'Equipment & Systems': 'Store your dealer\'s emergency support number for one-tap calling during breakdowns. Also manages PACS configuration, service contacts, and warranty tracking.',
  'State Compliance Guide': 'Your state\'s x-ray requirements — registration, dosimetry, QA, lead aprons, RSO — always accessible from your dashboard. Personalized for your facility type and modalities.',
  'AI assistant': 'Ask any compliance question and get answers specific to your state, facility type, and modalities. Backed by 862+ regulation records with citations. 50 queries per day.',
  'Keys to Success': 'Step-by-step compliance checklist with guidance videos from The Radiology Coach. Complete 90%+ to earn the Inspection Prepared badge.',
  'RSP builder': 'Generate your Radiation Protection Program — a document required by most states. Auto-populated from your facility data. Downloads as a branded PDF.',
  'State documents': 'Registration forms, applications, and regulatory documents from your state\'s radiation control agency. Filterable by type and directly downloadable.',
  'Preferred Partners': 'PACS cloud image storage, radiology reading services, and radiation protection equipment — vetted partners relevant to your specific compliance obligations.',
  'Video Training': 'Expert tutorial videos from The Radiology Coach covering state registration, QA testing, lead apron inspection, RSP programs, and more.',
  'Account Settings': 'Update your dealer contact information, change who appears on your emergency panic button, and manage account preferences.',
  'X-ray Operators': 'Track operator credentials, training records, and CEU requirements for all staff who operate x-ray equipment.',
}

interface Feature { name: string; desc: string; border: string; href?: string }

export default function FeatureCards({ features, activityMap = {} }: { features: Feature[]; activityMap?: Record<string, boolean> }) {
  const [activeInfo, setActiveInfo] = useState<string | null>(null)
  const [tipsHidden, setTipsHidden] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      if (localStorage.getItem('tips_hidden') === 'true') setTipsHidden(true)
    } catch {}
  }, [])

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveInfo(null)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const toggleTips = () => {
    const next = !tipsHidden
    setTipsHidden(next)
    try { localStorage.setItem('tips_hidden', String(next)) } catch {}
    if (next) setActiveInfo(null)
  }

  return (
    <div ref={containerRef}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <button onClick={toggleTips}
          style={{ fontSize: '11px', color: '#a8a39c', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
          {tipsHidden ? 'Show feature tips' : 'Hide feature tips'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {features.map(f => {
          const desc = info[f.name]
          const isOpen = activeInfo === f.name
          const InfoBtn = () => !tipsHidden && desc ? (
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); setActiveInfo(isOpen ? null : f.name) }}
              style={{ width: '18px', height: '18px', borderRadius: '50%', background: isOpen ? '#0d2d5e' : '#e8f3fb', border: `1px solid ${isOpen ? '#0d2d5e' : '#c2ddf0'}`, color: isOpen ? '#fff' : '#1a5fa8', fontSize: '11px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '6px', fontFamily: 'serif', lineHeight: 1 }}>
              i
            </button>
          ) : null

          const Popover = () => isOpen && desc ? (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, marginTop: '6px', background: '#0d2d5e', borderRadius: '10px', padding: '14px 16px', boxShadow: '0 8px 24px rgba(13,45,94,.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <p style={{ fontSize: '12px', color: '#e8f3fb', lineHeight: '1.7', margin: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>{desc}</p>
                <button onClick={() => setActiveInfo(null)}
                  style={{ color: '#8bb4d4', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', flexShrink: 0, padding: 0, lineHeight: 1 }}>×</button>
              </div>
            </div>
          ) : null

          return (
            <div key={f.name} style={{ position: 'relative' }}>
              {f.href ? (
                <a href={f.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ background: activityMap[f.name] ? '#f8fffe' : '#fff', border: `1px solid ${activityMap[f.name] ? '#40916c' : f.border}`, borderRadius: '12px', padding: '20px', transition: 'border-color .2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>{f.name}</p>
                      <InfoBtn />
                    </div>
                    <p style={{ fontSize: '12px', color: '#827d76', lineHeight: '1.55', marginBottom: '16px' }}>{f.desc}</p>
                    <span style={{ background: '#e8f3fb', color: '#0d2d5e', fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', border: '1px solid #c2ddf0' }}>Open →</span>
                  </div>
                </a>
              ) : (
                <div style={{ background: activityMap[f.name] ? '#f8fffe' : '#fff', border: `1px solid ${activityMap[f.name] ? '#40916c' : f.border}`, borderRadius: '12px', padding: '20px', transition: 'border-color .2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>{f.name}</p>
                    <InfoBtn />
                  </div>
                  <p style={{ fontSize: '12px', color: '#827d76', lineHeight: '1.55', marginBottom: '16px' }}>{f.desc}</p>
                  <span style={{ background: '#f4f7fb', color: '#a8a39c', fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', border: '1px solid #e8e6e2' }}>Coming soon</span>
                </div>
              )}
              <Popover />
            </div>
          )
        })}
      </div>
    </div>
  )
}