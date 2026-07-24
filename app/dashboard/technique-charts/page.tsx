'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TechniqueChartsPage() {
  const [accessed, setAccessed] = useState(false)

  useEffect(() => {
    const markAccessed = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
      if (!profile?.org_id) return
      await supabase.from('organizations').update({ technique_chart_accessed: true }).eq('id', profile.org_id)
      setAccessed(true)
    }
    markAccessed()
  }, [])

  const tips = [
    { icon: '📏', title: 'Start with your equipment specs', desc: 'Every technique chart is specific to your x-ray unit. Begin with your kVp range (minimum and maximum), your mA stations, and your focal spot options. These are in your equipment manual.' },
    { icon: '🎯', title: 'Build by anatomical region', desc: 'Organize your chart by body part: foot, ankle, knee, leg, hand, wrist, etc. For each region, establish a base technique then adjust for size variations (small, average, large, or use a caliper measurement).' },
    { icon: '📊', title: 'Use the 15kVp rule for adjustments', desc: 'Increasing kVp by 15 doubles the exposure effect — equivalent to doubling mAs. Use this relationship when adjusting for patient size or when troubleshooting exposure problems.' },
    { icon: '🔄', title: 'Test and document', desc: 'A technique chart is never final. When you find a technique that consistently produces diagnostic images, document it immediately. Review and update quarterly or after any equipment service.' },
    { icon: '⚠️', title: 'Separate charts for each unit', desc: 'If you have multiple x-ray machines, each needs its own technique chart. Even identical models from the same manufacturer can produce different output due to calibration differences.' },
  ]

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>Technique Chart Development</h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>Build accurate, consistent technique charts for every procedure your facility performs.</p>
        </div>

        {/* Download card */}
        <div style={{ background: '#0d2d5e', borderRadius: '14px', padding: '28px 32px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#8bb4d4', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '8px' }}>The Radiology Coach · Exclusive Resource</p>
            <h2 style={{ fontSize: '20px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>The Last Technique Chart You&apos;ll Ever Need</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.6)', lineHeight: '1.65', maxWidth: '480px', marginBottom: '16px' }}>
              A comprehensive, customizable technique chart template covering all standard radiographic projections. Built from 35+ years of clinical experience.
            </p>
            {accessed && (
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#8bb4d4', background: 'rgba(255,255,255,.1)', borderRadius: '20px', padding: '3px 10px', marginBottom: '12px', display: 'inline-block' }}>
                ✓ Technique Ready badge earned
              </span>
            )}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href="https://your-technique-chart-url.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{ height: '40px', padding: '0 20px', background: '#fff', color: '#0d2d5e', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => setAccessed(true)}>
                ⬇ Download PDF
              </a>
              <a
                href="https://www.youtube.com/c/TheRadiologyCoach"
                target="_blank"
                rel="noopener noreferrer"
                style={{ height: '40px', padding: '0 16px', background: 'rgba(255,255,255,.12)', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ▶ Watch tutorial
              </a>
            </div>
          </div>
          <div style={{ fontSize: '80px', opacity: .15, flexShrink: 0, userSelect: 'none' }}>📐</div>
        </div>

        {/* Tips */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef3fb' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>How to build an effective technique chart</p>
          </div>
          {tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 20px', borderBottom: i < tips.length - 1 ? '1px solid #eef3fb' : 'none', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }}>{tip.icon}</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>{tip.title}</p>
                <p style={{ fontSize: '13px', color: '#827d76', lineHeight: '1.65', margin: 0 }}>{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '10px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '13px', color: '#0d2d5e', flex: 1, margin: 0 }}>
            Questions about technique chart development for your specific modality?
          </p>
          <a href="/dashboard/ai" style={{ fontSize: '12px', fontWeight: '500', color: '#fff', background: '#0d2d5e', padding: '7px 16px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Ask AI assistant →
          </a>
        </div>
      </div>
    </div>
  )
}