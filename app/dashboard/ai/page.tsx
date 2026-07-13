'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
  citations?: any[]
}

const SUGGESTED = [
  'Do I need dosimetry badges for my facility?',
  'What registration requirements apply to me?',
  'Is a shielding plan required for my state?',
  'Walk me through my annual compliance checklist',
  'What lead apron requirements apply to me?',
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [org, setOrg] = useState<any>(null)
  const [usage, setUsage] = useState(0)
  const [pageLoading, setPageLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchOrg = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }

    const { data: orgData } = await supabase
      .from('organizations').select('*').eq('id', profile.org_id).single()
    setOrg(orgData)

    const today = new Date().toISOString().split('T')[0]
    const { data: usageData } = await supabase
      .from('ai_usage').select('query_count')
      .eq('user_id', user.id).eq('date', today).single()
    setUsage(usageData?.query_count || 0)
    setPageLoading(false)
  }, [router])

  useEffect(() => { fetchOrg() }, [fetchOrg])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || usage >= 50) return
    const msg = text.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    })

    const result = await res.json()

    if (res.ok) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.response,
        citations: result.citations
      }])
      setUsage(prev => prev + 1)
    } else if (result.limit_reached) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'You have reached your 50 query daily limit. Your limit resets at midnight. Come back tomorrow!'
      }])
    } else {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I encountered an error processing your question. Please try again.'
      }])
    }
    setLoading(false)
  }

  const DAILY_LIMIT = 50
  const remaining = DAILY_LIMIT - usage

  if (pageLoading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c', fontSize: '13px' }}>Loading your assistant...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', flexDirection: 'column' }}>

      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ background: '#fff', borderBottom: '1px solid #dce8f5', padding: '12px 32px', flexShrink: 0 }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#4a6d8c', fontWeight: '500' }}>Context:</span>
            {[org?.name, org?.facility_state, ...(org?.modality_names || [])].filter(Boolean).map((item: string) => (
              <span key={item} style={{ fontSize: '11px', color: '#0d2d5e', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '2px 8px' }}>
                {item}
              </span>
            ))}
          </div>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: remaining <= 10 ? '#c44a1a' : '#4a6d8c' }}>
              {remaining} / {DAILY_LIMIT} queries remaining today
            </span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>

          {messages.length === 0 && (
            <div style={{ textAlign: 'center', paddingTop: '40px', paddingBottom: '32px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e8f3fb', border: '2px solid #c2ddf0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span style={{ fontSize: '24px' }}>✦</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>
                AI Compliance Assistant
              </h2>
              <p style={{ fontSize: '13px', color: '#827d76', lineHeight: '1.65', maxWidth: '420px', margin: '0 auto 28px' }}>
                Ask anything about your x-ray compliance obligations in {org?.facility_state || 'your state'}. Answers are grounded in official state regulation data.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {SUGGESTED.map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    style={{ fontSize: '12px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '6px 14px', cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'user' ? (
                <div style={{ background: '#0d2d5e', color: '#fff', borderRadius: '12px 12px 3px 12px', padding: '12px 16px', maxWidth: '75%', fontSize: '14px', lineHeight: '1.6' }}>
                  {msg.content}
                </div>
              ) : (
                <div style={{ maxWidth: '85%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#e8f3fb', border: '1px solid #c2ddf0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✦</div>
                    <span style={{ fontSize: '11px', fontWeight: '500', color: '#4a6d8c' }}>AI Compliance Assistant</span>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '3px 12px 12px 12px', padding: '16px 18px', fontSize: '14px', lineHeight: '1.75', color: '#1e1c1a', whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                  {msg.citations && msg.citations.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', color: '#a8a39c', alignSelf: 'center' }}>Sources:</span>
                      {msg.citations.map((c, ci) => (
                        <span key={ci} style={{ fontSize: '10px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '6px', padding: '2px 8px' }}>
                          {c.state} · {c.modality} · {c.similarity}% match
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#e8f3fb', border: '1px solid #c2ddf0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✦</div>
              <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '3px 12px 12px 12px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0, 1, 2].map(n => (
                    <div key={n} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c2ddf0', animation: `pulse 1.2s ${n * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      <div style={{ background: '#fff', borderTop: '1px solid #dce8f5', padding: '16px 32px', flexShrink: 0 }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {remaining <= 0 ? (
            <div style={{ textAlign: 'center', padding: '12px', background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '8px', fontSize: '13px', color: '#9a3510' }}>
              Daily limit reached. Your 50 queries reset at midnight.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
                placeholder="Ask about your compliance requirements..."
                rows={2}
                style={{ flex: 1, border: '1px solid #c2ddf0', borderRadius: '8px', padding: '10px 14px', fontSize: '14px', color: '#0d2d5e', background: '#fff', outline: 'none', resize: 'none', fontFamily: 'Inter, system-ui, sans-serif', lineHeight: '1.5' }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                style={{ height: '44px', width: '44px', background: input.trim() && !loading ? '#0d2d5e' : '#c2ddf0', color: '#fff', border: 'none', borderRadius: '8px', cursor: input.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>
                ↑
              </button>
            </div>
          )}
          <p style={{ fontSize: '11px', color: '#a8a39c', textAlign: 'center', marginTop: '8px' }}>
            Answers based on your Airtable regulation data · Always verify with your state agency
          </p>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} }`}</style>
    </div>
  )
}