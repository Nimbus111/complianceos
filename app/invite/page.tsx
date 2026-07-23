'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function InviteContent() {
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'accepting' | 'done' | 'error'>('loading')
  const [invite, setInvite] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isNewUser, setIsNewUser] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const inp: React.CSSProperties = {
    width: '100%', height: '42px', border: '1px solid #c2ddf0', borderRadius: '8px',
    padding: '0 14px', fontSize: '14px', color: '#0d2d5e', background: '#fff',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif'
  }

  useEffect(() => {
    if (!token) { setStatus('invalid'); return }
    const supabase = createClient()
    supabase.from('invite_tokens').select('*, org:org_id(name, facility_state)')
      .eq('token', token).single()
      .then(({ data, error }) => {
        if (error || !data) { setStatus('invalid'); return }
        if (data.used_at) { setStatus('invalid'); return }
        if (new Date(data.expires_at) < new Date()) { setStatus('invalid'); return }
        setInvite(data)
        setEmail(data.email)
        setStatus('valid')
      })
  }, [token])

  const handleAccept = async () => {
    setStatus('accepting')
    setErrorMsg('')
    const supabase = createClient()

    try {
      if (isNewUser) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { invite_token: token } }
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }

      // Call accept API
      const res = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setStatus('done')
      setTimeout(() => router.push('/dashboard'), 2500)
    } catch (e: any) {
      setErrorMsg(e.message || 'Something went wrong')
      setStatus('valid')
    }
  }

  if (status === 'loading') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <p style={{ color: '#a8a39c' }}>Validating invite...</p>
    </div>
  )

  if (status === 'invalid') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: 'Inter, system-ui, sans-serif', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '14px', padding: '40px', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '20px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>Invalid or expired invite</h2>
        <p style={{ fontSize: '14px', color: '#827d76', lineHeight: '1.6', marginBottom: '20px' }}>This invite link has already been used or has expired. Contact your account administrator for a new invite.</p>
        <a href="/login" style={{ fontSize: '13px', color: '#1a5fa8', textDecoration: 'none' }}>Go to login →</a>
      </div>
    </div>
  )

  if (status === 'done') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: 'Inter, system-ui, sans-serif', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '14px', padding: '40px', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
        <h2 style={{ fontSize: '20px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>You&apos;re in!</h2>
        <p style={{ fontSize: '14px', color: '#827d76', lineHeight: '1.6' }}>Welcome to {invite?.org?.name}. Redirecting to your dashboard...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', fontFamily: 'Inter, system-ui, sans-serif', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '36px', maxWidth: '440px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🛡️</div>
          <h2 style={{ fontSize: '22px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>
            You&apos;ve been invited
          </h2>
          <p style={{ fontSize: '14px', color: '#827d76', lineHeight: '1.6' }}>
            Join <strong style={{ color: '#0d2d5e' }}>{invite?.org?.name}</strong> on ComplianceOS as a <strong style={{ color: '#0d2d5e' }}>{invite?.role}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#f4f7fb', borderRadius: '8px', padding: '4px' }}>
          {[['New user', true], ['Already have an account', false]].map(([label, val]) => (
            <button key={String(val)} onClick={() => setIsNewUser(val as boolean)}
              style={{ flex: 1, height: '36px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '500', cursor: 'pointer', background: isNewUser === val ? '#0d2d5e' : 'transparent', color: isNewUser === val ? '#fff' : '#4a6d8c', transition: 'all .15s' }}>
              {label as string}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#4a6d8c', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.07em' }}>Email</label>
            <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#4a6d8c', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              {isNewUser ? 'Create password' : 'Password'}
            </label>
            <input style={inp} type="password" placeholder={isNewUser ? 'Minimum 8 characters' : 'Your password'} value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: '#fefafb', border: '1px solid #f5c6c9', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#931621', marginBottom: '14px' }}>
            {errorMsg}
          </div>
        )}

        <button onClick={handleAccept} disabled={!email || !password || status === 'accepting'}
          style={{ width: '100%', height: '46px', background: (!email || !password || status === 'accepting') ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' }}>
          {status === 'accepting' ? 'Joining...' : `Join ${invite?.org?.name || 'team'} →`}
        </button>

        <p style={{ fontSize: '11px', color: '#a8a39c', textAlign: 'center', marginTop: '14px', lineHeight: '1.6' }}>
          By joining you agree to the{' '}
          <a href="/terms" style={{ color: '#1a5fa8', textDecoration: 'none' }}>Terms of Service</a>.
          This invite expires in 7 days.
        </p>
      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#a8a39c' }}>Loading...</p></div>}>
      <InviteContent />
    </Suspense>
  )
}