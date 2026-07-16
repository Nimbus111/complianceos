'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SignupForm() {
  const searchParams = useSearchParams()
  const accountType = searchParams.get('type') || 'facility'
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const isServiceProvider = accountType === 'service_provider'

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?type=${accountType}`,
        data: { account_type: accountType }
      }
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  const inp: React.CSSProperties = { width: '100%', height: '44px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 14px', fontSize: '14px', color: '#0d2d5e', background: '#fff', outline: 'none', boxSizing: 'border-box' }

  if (sent) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', border: '1px solid #b8e8cc', borderRadius: '16px', padding: '48px 40px', maxWidth: '440px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>✉️</div>
        <h2 style={{ fontSize: '22px', fontWeight: '500', color: '#0d2d5e', marginBottom: '10px' }}>Check your email</h2>
        <p style={{ fontSize: '14px', color: '#4a6d8c', lineHeight: '1.65' }}>
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and complete setup.
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ color: '#fff', fontSize: '15px', fontWeight: '500', margin: 0 }}>The Radiology Coach · ComplianceOS</p>
        <a href="/login" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>Sign in instead</a>
      </nav>

      <div style={{ maxWidth: '440px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <span style={{ fontSize: '11px', fontWeight: '500', color: isServiceProvider ? '#2d6a4f' : '#1a5fa8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {isServiceProvider ? 'Dealer / Service Provider account' : 'Medical Facility account'}
          </span>
          <h1 style={{ fontSize: '26px', fontWeight: '500', color: '#0d2d5e', marginTop: '8px', marginBottom: '6px' }}>Create your account</h1>
          <p style={{ fontSize: '13px', color: '#4a6d8c' }}>14-day free trial · No credit card required to start</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '28px' }}>
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#4a6d8c', marginBottom: '6px' }}>Email address</label>
              <input style={inp} type="email" placeholder="you@yourcompany.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#4a6d8c', marginBottom: '6px' }}>Password</label>
              <input style={inp} type="password" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            </div>
            {error && <p style={{ fontSize: '13px', color: '#931621', background: '#fefafb', border: '1px solid #f5c6c9', borderRadius: '6px', padding: '8px 12px', margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading}
              style={{ height: '46px', background: loading ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'default' : 'pointer', marginTop: '4px' }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p style={{ fontSize: '12px', color: '#a8a39c', textAlign: 'center', marginTop: '16px', lineHeight: '1.6' }}>
            By creating an account you agree to our terms of service. Not the right account type?{' '}
            <a href="/get-started" style={{ color: '#1a5fa8', textDecoration: 'none' }}>Go back</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#a8a39c' }}>Loading...</p></div>}>
      <SignupForm />
    </Suspense>
  )
}