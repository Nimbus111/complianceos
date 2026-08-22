'use client'
import { useState, useEffect } from 'react'

interface Step {
  number: number
  label: string
  description: string
  complete: boolean
  href: string
  actionLabel: string
}

interface Props {
  facilityState: string | null
  completedTaskCount: number
  rspCount: number
  equipmentCount: number
  operatorCount: number
  docCount: number
  dismissed: boolean
}

export default function GettingStartedPanel({
  facilityState, completedTaskCount, rspCount,
  equipmentCount, operatorCount, docCount, dismissed
}: Props) {
  const [expanded, setExpanded] = useState(() => {
    try { return localStorage.getItem('gs_expanded') !== 'false' } catch { return true }
  })
  const [guideViewed, setGuideViewed] = useState(false)
  const [isDismissed, setIsDismissed] = useState(dismissed)
  const [dismissing, setDismissing] = useState(false)

  useEffect(() => {
    try { setGuideViewed(localStorage.getItem('guide_viewed') === 'true') } catch {}
  }, [])

  const toggleExpanded = () => {
    setExpanded(prev => {
      try { localStorage.setItem('gs_expanded', String(!prev)) } catch {}
      return !prev
    })
  }

  const steps: Step[] = [
    {
      number: 1, label: 'Facility Profile',
      description: facilityState ? `${facilityState} · Configured` : 'Set your state and facility type',
      complete: !!facilityState,
      href: '/dashboard/settings', actionLabel: 'Update'
    },
    {
      number: 2, label: 'Required Actions',
      description: completedTaskCount > 0 ? `${completedTaskCount} tasks checked off` : 'Start checking off your compliance tasks',
      complete: completedTaskCount > 0,
      href: '/dashboard', actionLabel: 'View'
    },
    {
      number: 3, label: 'State Compliance Guide',
      description: guideViewed ? 'Viewed' : 'Review your state\'s x-ray requirements',
      complete: guideViewed,
      href: '/dashboard/guide', actionLabel: 'View'
    },
    {
      number: 4, label: 'RPP / RSP Builder',
      description: rspCount > 0 ? 'In progress' : 'Start building your Radiation Protection Program',
      complete: rspCount > 0,
      href: '/dashboard/rsp', actionLabel: 'Start'
    },
    {
      number: 5, label: 'Equipment and Safety',
      description: equipmentCount > 0 ? `${equipmentCount} device${equipmentCount !== 1 ? 's' : ''} added` : 'Add your x-ray equipment',
      complete: equipmentCount > 0,
      href: '/dashboard/equipment', actionLabel: 'Add'
    },
    {
      number: 6, label: 'Operator Credentials',
      description: operatorCount > 0 ? `${operatorCount} operator${operatorCount !== 1 ? 's' : ''} on file` : 'Add your licensed x-ray operators',
      complete: operatorCount > 0,
      href: '/dashboard/operators', actionLabel: 'Add'
    },
    {
      number: 7, label: 'Document Repository',
      description: docCount > 0 ? `${docCount} document${docCount !== 1 ? 's' : ''} uploaded` : 'Upload your compliance documents',
      complete: docCount > 0,
      href: '/dashboard/documents', actionLabel: 'Upload'
    },
  ]

  const completedCount = steps.filter(s => s.complete).length
  const allComplete = completedCount === 7

  const handleDismiss = async () => {
    if (!allComplete) return
    setDismissing(true)
    await fetch('/api/onboarding/dismiss', { method: 'POST' })
    setIsDismissed(true)
  }

 if (isDismissed) return null

  if (!expanded) return (
    <div style={{ position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 50, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <button onClick={toggleExpanded}
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', background: allComplete ? '#2d6a4f' : '#0d2d5e', color: '#fff', border: 'none', padding: '16px 10px', cursor: 'pointer', borderRadius: '0 8px 8px 0', fontSize: '12px', fontWeight: '500', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '2px 0 8px rgba(0,0,0,.15)' }}>
        {allComplete ? '✅' : '🚀'} Getting Started · {completedCount}/7
      </button>
    </div>
  )

  return (
    <div style={{ position: 'fixed', left: 0, top: '80px', width: '280px', zIndex: 50, fontFamily: 'Inter, system-ui, sans-serif', maxHeight: 'calc(100vh - 80px)', overflowY: 'auto', boxShadow: '2px 0 12px rgba(0,0,0,.08)' }}>

      {/* Header */}
      <div style={{ padding: '14px 20px', background: allComplete ? '#edfaf3' : '#f8fbfe', borderBottom: expanded ? '1px solid #dce8f5' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px' }}>{allComplete ? '✅' : '🚀'}</span>
          <div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: allComplete ? '#2d6a4f' : '#0d2d5e' }}>
              {allComplete ? 'Setup Complete!' : 'Getting Started'}
            </span>
            <span style={{ fontSize: '12px', color: '#4a6d8c', marginLeft: '10px' }}>
              {completedCount} of 7 complete
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ width: '100px', height: '4px', background: '#e8f3fb', borderRadius: '2px', overflow: 'hidden', marginLeft: '8px' }}>
            <div style={{ height: '100%', background: allComplete ? '#2d6a4f' : '#1a5fa8', borderRadius: '2px', width: `${(completedCount / 7) * 100}%`, transition: 'width .3s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {allComplete && (
            <button onClick={handleDismiss} disabled={dismissing}
              style={{ fontSize: '11px', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '3px 12px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
              {dismissing ? 'Dismissing...' : '✕ Dismiss'}
            </button>
          )}
          <button onClick={toggleExpanded}
            style={{ fontSize: '13px', color: '#4a6d8c', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {expanded ? '◀' : '▶'}
          </button>
        </div>
      </div>

      {/* Steps */}
      {expanded && (
        <div>
          {steps.map((step, i) => (
            <div key={step.number} style={{ padding: '12px 20px', borderBottom: i < 6 ? '1px solid #f4f7fb' : 'none', display: 'flex', alignItems: 'center', gap: '14px', background: step.complete ? '#fafffd' : '#fff' }}>
              {/* Status indicator */}
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step.complete ? '#2d6a4f' : '#f0f4f8', border: `2px solid ${step.complete ? '#2d6a4f' : '#c2ddf0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {step.complete
                  ? <span style={{ color: '#fff', fontSize: '12px', fontWeight: '700' }}>✓</span>
                  : <span style={{ color: '#a8a39c', fontSize: '11px', fontWeight: '600' }}>{step.number}</span>
                }
              </div>

              {/* Step info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: step.complete ? '#2d6a4f' : '#0d2d5e', margin: 0, textDecoration: step.complete ? 'none' : 'none' }}>
                  {step.label}
                </p>
                <p style={{ fontSize: '11px', color: step.complete ? '#52a77a' : '#4a6d8c', margin: '2px 0 0' }}>
                  {step.description}
                </p>
              </div>

              {/* Go button */}
              {!step.complete && (
                <a href={step.href}
                  style={{ fontSize: '11px', fontWeight: '500', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '4px 12px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {step.actionLabel} →
                </a>
              )}
            </div>
          ))}

          {allComplete && (
            <div style={{ padding: '14px 20px', background: '#edfaf3', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#2d6a4f', margin: 0 }}>
                🎉 Your facility is fully set up for compliance. Click <strong>Dismiss</strong> to close this panel permanently.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}