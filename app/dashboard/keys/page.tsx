'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const getEmbedUrl = (url: string | null): string | null => {
  if (!url) return null
  const match = url.match(/[?&]v=([^&]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct >= 90 ? '#40916c' : pct >= 60 ? '#1a5fa8' : '#c44a1a'
  return (
    <svg width="108" height="108" viewBox="0 0 108 108" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="54" cy="54" r={r} fill="none" stroke="#e8f3fb" strokeWidth="8" />
      <circle cx="54" cy="54" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
    </svg>
  )
}

export default function KeysToSuccessPage() {
  const [items, setItems] = useState<any[]>([])
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [orgName, setOrgName] = useState('')
  const [orgId, setOrgId] = useState('')
  const router = useRouter()

  const fetchAll = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }

    setOrgId(profile.org_id)

    const { data: org } = await supabase
      .from('organizations').select('name').eq('id', profile.org_id).single()
    if (org) setOrgName(org.name)

    const { data: ktsItems } = await supabase
      .from('keys_to_success')
      .select('*')
      .order('created_at', { ascending: true })
    setItems(ktsItems || [])

    const { data: checks } = await supabase
      .from('compliance_checklists')
      .select('guidance_id')
      .eq('org_id', profile.org_id)
      .eq('completed', true)

    const completedIds = new Set((checks || []).map((c: any) => c.guidance_id))
    setCompleted(completedIds)
    setLoading(false)
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const toggleItem = async (ktsId: string) => {
    const isCompleted = completed.has(ktsId)
    const newCompleted = new Set(completed)
    if (isCompleted) newCompleted.delete(ktsId)
    else newCompleted.add(ktsId)
    setCompleted(newCompleted)

    await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kts_id: ktsId, completed: !isCompleted })
    })
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expanded)
    if (newExpanded.has(id)) newExpanded.delete(id)
    else newExpanded.add(id)
    setExpanded(newExpanded)
  }

  const total = items.length
  const completedCount = completed.size
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0
  const inspectionReady = pct >= 90

  if (loading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c', fontSize: '13px' }}>Loading your checklist...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '28px' }}>
          <div style={{ position: 'relative', width: '108px', height: '108px', flexShrink: 0 }}>
            <ProgressRing pct={pct} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '22px', fontWeight: '500', color: '#0d2d5e', lineHeight: 1 }}>{pct}%</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: '500', color: '#0d2d5e' }}>Keys to Success</h1>
              {inspectionReady && (
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '3px 10px' }}>
                  Inspection Ready
                </span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: '#827d76', marginBottom: '10px' }}>
              {orgName} · {completedCount} of {total} items complete
            </p>
            <div style={{ background: '#e8f3fb', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
              <div style={{ background: inspectionReady ? '#40916c' : pct >= 60 ? '#1a5fa8' : '#c44a1a', height: '100%', width: `${pct}%`, borderRadius: '4px', transition: 'width 0.5s ease' }} />
            </div>
            {!inspectionReady && (
              <p style={{ fontSize: '11px', color: '#a8a39c', marginTop: '6px' }}>
                Complete {Math.ceil(total * 0.9) - completedCount} more item{Math.ceil(total * 0.9) - completedCount !== 1 ? 's' : ''} to reach Inspection Ready (90%)
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map(item => {
            const isCompleted = completed.has(item.id)
            const isExpanded = expanded.has(item.id)
            const embedUrl = getEmbedUrl(item.youtube_url)

            return (
              <div key={item.id} style={{ background: '#fff', border: `1px solid ${isCompleted ? '#b8e8cc' : '#dce8f5'}`, borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer' }}
                  onClick={() => toggleExpanded(item.id)}>
                  <div
                    onClick={e => { e.stopPropagation(); toggleItem(item.id) }}
                    style={{ width: '20px', height: '20px', borderRadius: '5px', border: `2px solid ${isCompleted ? '#40916c' : '#c2ddf0'}`, background: isCompleted ? '#40916c' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: 'all 0.15s' }}>
                    {isCompleted && <span style={{ color: '#fff', fontSize: '12px', fontWeight: '500' }}>✓</span>}
                  </div>
                  <p style={{ flex: 1, fontSize: '14px', fontWeight: '500', color: isCompleted ? '#40916c' : '#0d2d5e', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                    {item.topic || 'Untitled item'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.youtube_url && (
                      <span style={{ fontSize: '10px', fontWeight: '500', color: '#c44a1a', background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '20px', padding: '2px 7px' }}>
                        Video
                      </span>
                    )}
                    <span style={{ fontSize: '16px', color: '#a8a39c', transition: 'transform 0.2s', display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      ∨
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid #eef3fb', padding: '16px 20px', background: '#fafcff' }}>
                    {item.notes_text && (
                      <p style={{ fontSize: '13px', color: '#1e1c1a', lineHeight: '1.75', marginBottom: embedUrl ? '16px' : '0', whiteSpace: 'pre-wrap' }}>
                        {item.notes_text}
                      </p>
                    )}
                    {embedUrl && (
                      <div style={{ borderRadius: '8px', overflow: 'hidden', position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                        <iframe
                          src={embedUrl}
                          title={item.topic}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {items.length === 0 && (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>No checklist items yet</p>
            <p style={{ fontSize: '13px', color: '#827d76' }}>
              Run the Keys to Success sync to load your checklist items.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}