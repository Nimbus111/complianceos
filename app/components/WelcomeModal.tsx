'use client'

import { useState, useEffect } from 'react'

const steps = [
  { icon: '✅', text: 'Check off your Required Actions — the checklist at the top of your dashboard shows exactly what your facility needs to do first.' },
  { icon: '📞', text: 'Add your x-ray dealer\'s contact in Equipment & Systems for one-tap emergency access from your dashboard.' },
  { icon: '🔍', text: 'Open the State Compliance Guide to review your state\'s specific x-ray requirements anytime.' },
]

export default function WelcomeModal({ facilityName }: { facilityName?: string }) {
  const [show, setShow] = useState(false)
  const [dontShow, setDontShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem('welcome_dismissed')) setShow(true)
    } catch {}
  }, [])

  const dismiss = () => {
    try {
      if (dontShow) localStorage.setItem('welcome_dismissed', 'true')
    } catch {}
    setShow(false)
  }

  if (!show) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,45,94,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', maxWidth: '480px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.2)' }}>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛡️</div>
          <h2 style={{ fontSize: '20px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>
            Welcome to ComplianceOS{facilityName ? `, ${facilityName}` : ''}
          </h2>
          <p style={{ fontSize: '13px', color: '#827d76', lineHeight: '1.6' }}>
            Here are three things to do first to get your x-ray compliance on track.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: '#f4f7fb', borderRadius: '8px' }}>
              <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>{step.icon}</span>
              <p style={{ fontSize: '13px', color: '#1e1c1a', lineHeight: '1.65', margin: 0 }}>{step.text}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontSize: '12px', color: '#1a5fa8', lineHeight: '1.6' }}>
          Every feature card on your dashboard has an <strong style={{ fontWeight: '500' }}>ⓘ</strong> button. Click any one to learn what that feature does.
        </div>

        <button onClick={dismiss}
          style={{ width: '100%', height: '44px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginBottom: '12px' }}>
          Got it, let&apos;s go →
        </button>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', justifyContent: 'center' }}>
          <input type="checkbox" checked={dontShow} onChange={e => setDontShow(e.target.checked)}
            style={{ accentColor: '#0d2d5e', width: '14px', height: '14px' }} />
          <span style={{ fontSize: '12px', color: '#a8a39c' }}>Don&apos;t show this again</span>
        </label>

      </div>
    </div>
  )
}