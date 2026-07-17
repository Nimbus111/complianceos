'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://app.theradiologycoach.com/auth/callback?type=reset',
    })
    if (resetError) { setError(resetError.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', height: '44px', border: '1px solid #c2ddf0', borderRadius: '8px',
    padding: '0 14px', fontSize: '14px', color: '#0d2d5e', background: '#fff',
    outline: 'none', boxSizing: 'border-box',
  }

  if (sent) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', border: '1px solid #b8e8cc', borderRadius: '16px', padding: '48px 40px', maxWidth: '420px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>✉️</div>
        <h2 style={{ fontSize: '22px', fontWeight: '500', color: '#0d2d5e', marginBottom: '10px' }}>Check your email</h2>
        <p style={{ fontSize: '14px', color: '#4a6d8c', lineHeight: '1.65', marginBottom: '20px' }}>
          We sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
        </p>
        <a href="/login" style={{ fontSize: '13px', color: '#1a5fa8', textDecoration: 'none' }}>← Back to sign in</a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center' }}>
        <p style={{ color: '#fff', fontSize: '15px', fontWeight: '500', margin: 0 }}>The Radiology Coach · ComplianceOS</p>
      </nav>
      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>Reset your password</h1>
          <p style={{ fontSize: '13px', color: '#4a6d8c' }}>Enter your email and we&apos;ll send you a reset link</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#4a6d8c', marginBottom: '6px' }}>Email address</label>
              <input style={inp} type="email" placeholder="you@yourcompany.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            {error && <p style={{ fontSize: '13px', color: '#931621', background: '#fefafb', border: '1px solid #f5c6c9', borderRadius: '6px', padding: '8px 12px', margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading}
              style={{ height: '46px', background: loading ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'default' : 'pointer' }}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
          <p style={{ fontSize: '12px', color: '#a8a39c', textAlign: 'center', marginTop: '16px' }}>
            <a href="/login" style={{ color: '#1a5fa8', textDecoration: 'none' }}>← Back to sign in</a>
          </p>
        </div>
      </div>
    </div>
  )
}