'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) { setError(signInError.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  const inp: React.CSSProperties = {
    width: '100%', height: '44px', border: '1px solid #c2ddf0', borderRadius: '8px',
    padding: '0 14px', fontSize: '14px', color: '#0d2d5e', background: '#fff',
    outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ color: '#fff', fontSize: '15px', fontWeight: '500', margin: 0 }}>The Radiology Coach · ComplianceOS</p>
        <a href="/get-started" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>Create account</a>
      </nav>

      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>Welcome back</h1>
          <p style={{ fontSize: '13px', color: '#4a6d8c' }}>Sign in to your ComplianceOS account</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '28px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#4a6d8c', marginBottom: '6px' }}>Email address</label>
              <input style={inp} type="email" placeholder="you@yourcompany.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#4a6d8c' }}>Password</label>
                <a href="/forgot-password" style={{ fontSize: '11px', color: '#1a5fa8', textDecoration: 'none' }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input style={{ ...inp, paddingRight: '60px' }} type={showPassword ? 'text' : 'password'} placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a8a39c', fontSize: '11px', fontWeight: '500', padding: '0' }}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {error && (
              <p style={{ fontSize: '13px', color: '#931621', background: '#fefafb', border: '1px solid #f5c6c9', borderRadius: '6px', padding: '8px 12px', margin: 0 }}>{error}</p>
            )}
            <button type="submit" disabled={loading}
              style={{ height: '46px', background: loading ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'default' : 'pointer', marginTop: '4px' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p style={{ fontSize: '12px', color: '#a8a39c', textAlign: 'center', marginTop: '16px' }}>
            Don&apos;t have an account?{' '}
            <a href="/get-started" style={{ color: '#1a5fa8', textDecoration: 'none' }}>Create one free</a>
          </p>
        </div>
      </div>
    </div>
  )
}