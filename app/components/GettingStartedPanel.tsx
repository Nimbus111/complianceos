'use client'
import { useState } from 'react'

const STEPS = [
  {
    title: 'Welcome to ComplianceOS',
    emoji: '👋',
    content: [
      "You've made a great decision for your practice. The Radiology Coach Compliance Hub keeps all your x-ray compliance requirements organized in one place — so you're always inspection-ready.",
      "This guide will walk you through getting everything set up, one step at a time, starting with the most important things first. You can collapse this panel anytime using the arrow and come back to it whenever you need a reminder of where you are."
    ],
    links: []
  },
  {
    title: 'Registration and Installation',
    emoji: '📋',
    content: [
      "When your x-ray machine was installed, your dealer or installer was required to file an Assembly Form — also called Form 2579 — with your state radiation control program. This form officially reports your equipment to the state. Get a copy of it and keep it on file.",
      "Can't locate it? Your state has its own version, usually called an X-ray Equipment Registration Form. We have these forms for every state right here in the platform under State Documents.",
      "You'll also find your state-specific registration requirements listed in your Required Actions — look for anything related to facility registration or equipment registration."
    ],
    links: [
      { label: 'Find your state\'s forms', href: '/dashboard/stateforms' },
      { label: 'View Required Actions', href: '/dashboard' }
    ]
  },
  {
    title: 'Your Radiation Protection Program',
    emoji: '📄',
    content: [
      "Every facility that operates x-ray equipment is required by state law to have a written Radiation Protection Program — also called an RPP or RSP depending on your state. Think of it as your x-ray safety manual.",
      "It documents your safety procedures, your equipment, your team's qualifications, and how you handle radiation safety day-to-day. Inspectors will ask for it — and it needs to be updated annually.",
      "We've built an RPP/RSP builder right into the platform. It walks you through each section and generates a document you can print or save."
    ],
    links: [
      { label: 'Open the RPP/RSP Builder', href: '/dashboard/rsp' }
    ]
  },
  {
    title: 'Your Radiation Safety Officer',
    emoji: '🧑‍⚕️',
    content: [
      "Your state requires you to designate a Radiation Safety Officer — known as an RSO. This is the person responsible for overseeing your facility's radiation safety program.",
      "In many small practices, this is the physician or a licensed radiologic technologist. The RSO doesn't need to be on-site every day, but they must be identified in your Radiation Protection Program and available to answer questions during an inspection.",
      "Your RSO's name and contact information should appear in your RPP and be posted in your x-ray area along with other required notices."
    ],
    links: [
      { label: 'View RSO requirements in Required Actions', href: '/dashboard' },
      { label: 'Open the State Compliance Guide', href: '/dashboard/guide' }
    ]
  },
  {
    title: 'Log Your Equipment',
    emoji: '🔧',
    content: [
      "Add your x-ray machine — or machines — to the Equipment and Safety section. This creates a central record of your devices, their manufacturer contacts, service history, and QA procedures.",
      "Each x-ray machine has specific quality assurance procedures recommended by the manufacturer. Your state may also require periodic testing. Logging your QA history here means you have documentation ready if an inspector asks.",
      "Lead aprons, thyroid shields, and other protective equipment go in here too — many states require regular inspection of all protective gear."
    ],
    links: [
      { label: 'Go to Equipment and Safety', href: '/dashboard/equipment' }
    ]
  },
  {
    title: 'Add Your X-ray Operators',
    emoji: '👥',
    content: [
      "Most states require that only licensed or certified individuals operate your x-ray equipment. Add your operators to the platform with their license numbers and credential expiration dates.",
      "Many states also require annual continuing education — CEU hours — for x-ray operators. Tracking those here means you'll never be caught off guard during an inspection when an inspector asks to see your staff's qualifications.",
      "New staff? Upload their credentials as soon as they join. It takes two minutes and keeps your records complete."
    ],
    links: [
      { label: 'Add operators and credentials', href: '/dashboard/operators' }
    ]
  },
  {
    title: "You're Set Up — Stay Compliant",
    emoji: '✅',
    content: [
      "Great work getting everything in order! X-ray compliance isn't a one-time event — it's an ongoing process with annual renewals, monthly dosimetry readings, and periodic equipment checks.",
      "Check your Compliance Calendar regularly for upcoming registration renewals, inspection deadlines, and QA due dates. Upload your key documents — registration certificates, your RPP, operator credentials — to the Document Repository so everything is in one place.",
      "Your compliance score rises as you work through your Required Actions. Keep an eye on it — and remember, we're here to help every step of the way."
    ],
    links: [
      { label: 'View Compliance Calendar', href: '/dashboard/calendar' },
      { label: 'Open Document Repository', href: '/dashboard/documents' },
      { label: 'Review Required Actions', href: '/dashboard' }
    ]
  }
]

interface Props {
  dismissed: boolean
}

export default function GettingStartedPanel({ dismissed }: Props) {
  const [expanded, setExpanded] = useState(() => {
    try { return localStorage.getItem('gs_expanded') !== 'false' } catch { return true }
  })
  const [currentStep, setCurrentStep] = useState(() => {
    try { return parseInt(localStorage.getItem('gs_step') || '0') } catch { return 0 }
  })
  const [isDismissed, setIsDismissed] = useState(dismissed)
  const [dismissing, setDismissing] = useState(false)

  const toggleExpanded = () => {
    setExpanded(prev => {
      try { localStorage.setItem('gs_expanded', String(!prev)) } catch {}
      return !prev
    })
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
    try { localStorage.setItem('gs_step', String(step)) } catch {}
  }

  const handleDismiss = async () => {
    setDismissing(true)
    await fetch('/api/onboarding/dismiss', { method: 'POST' })
    setIsDismissed(true)
  }

  if (isDismissed) return null

  const step = STEPS[currentStep]
  const isLast = currentStep === STEPS.length - 1
  const isFirst = currentStep === 0

  if (!expanded) return (
    <div style={{ position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 50, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <button onClick={toggleExpanded}
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', background: '#0d2d5e', color: '#fff', border: 'none', padding: '16px 10px', cursor: 'pointer', borderRadius: '0 8px 8px 0', fontSize: '12px', fontWeight: '500', fontFamily: 'Inter, system-ui, sans-serif', boxShadow: '2px 0 8px rgba(0,0,0,.15)' }}>
        🚀 Getting Started · Step {currentStep + 1} of {STEPS.length}
      </button>
    </div>
  )

  return (
    <div style={{ position: 'fixed', left: 0, top: '80px', width: '300px', zIndex: 50, fontFamily: 'Inter, system-ui, sans-serif', maxHeight: 'calc(100vh - 80px)', overflowY: 'auto', boxShadow: '2px 0 16px rgba(0,0,0,.1)', background: '#fff' }}>

      {/* Header */}
      <div style={{ padding: '14px 16px', background: '#0d2d5e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#fff', margin: '0 0 2px' }}>Getting Started</p>
          <p style={{ fontSize: '11px', color: '#8bb4d4', margin: 0 }}>Step {currentStep + 1} of {STEPS.length}</p>
        </div>
        <button onClick={toggleExpanded}
          style={{ fontSize: '13px', color: '#8bb4d4', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', fontFamily: 'Inter, system-ui, sans-serif' }}>◀</button>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '4px', padding: '10px 16px', background: '#f0f4f8', borderBottom: '1px solid #dce8f5' }}>
        {STEPS.map((_, i) => (
          <button key={i} onClick={() => goToStep(i)}
            style={{ width: i === currentStep ? '20px' : '8px', height: '8px', borderRadius: '4px', background: i === currentStep ? '#1a5fa8' : i < currentStep ? '#2d6a4f' : '#c2ddf0', border: 'none', cursor: 'pointer', transition: 'all .2s', padding: 0 }} />
        ))}
      </div>

      {/* Step content */}
      <div style={{ padding: '20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '22px', flexShrink: 0 }}>{step.emoji}</span>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#0d2d5e', margin: 0, lineHeight: '1.3' }}>{step.title}</h3>
        </div>

        {step.content.map((paragraph, i) => (
          <p key={i} style={{ fontSize: '13px', color: '#3d4f60', lineHeight: '1.7', margin: '0 0 12px' }}>
            {paragraph}
          </p>
        ))}

        {step.links.length > 0 && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {step.links.map((link, i) => (
              <a key={i} href={link.href}
                style={{ fontSize: '12px', fontWeight: '500', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '7px', padding: '8px 12px', textDecoration: 'none', display: 'block' }}>
                {link.label} →
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f4f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafcfe' }}>
        <button onClick={() => goToStep(currentStep - 1)} disabled={isFirst}
          style={{ fontSize: '12px', color: isFirst ? '#c2ddf0' : '#4a6d8c', background: 'none', border: 'none', cursor: isFirst ? 'default' : 'pointer', fontFamily: 'Inter, system-ui, sans-serif', padding: '6px 0' }}>
          ← Back
        </button>

        {isLast ? (
          <button onClick={handleDismiss} disabled={dismissing}
            style={{ fontSize: '12px', fontWeight: '500', color: '#fff', background: '#2d6a4f', border: 'none', borderRadius: '20px', padding: '6px 16px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {dismissing ? 'Closing...' : 'Got it, close ✓'}
          </button>
        ) : (
          <button onClick={() => goToStep(currentStep + 1)}
            style={{ fontSize: '12px', fontWeight: '500', color: '#fff', background: '#1a5fa8', border: 'none', borderRadius: '20px', padding: '6px 16px', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
            Next →
          </button>
        )}
      </div>
    </div>
  )
}