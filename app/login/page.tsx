'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f4f7fb', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', marginLeft: '10px' }}>ComplianceOS</span>
        </a>
        <a href="/signup" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>
          Create account →
        </a>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>Welcome back</h1>
          <p style={{ fontSize: '13px', color: '#827d76', marginBottom: '28px' }}>Sign in to your ComplianceOS account</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#a8a39c', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{ width: '100%', height: '42px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 12px', fontSize: '14px', color: '#0d2d5e', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '500', color: '#a8a39c', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', height: '42px', border: '1px solid #c2ddf0', borderRadius: '8px', padding: '0 12px', fontSize: '14px', color: '#0d2d5e', background: '#fff', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <div style={{ background: '#fefafb', border: '1px solid #f5c6c9', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#931621' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: '44px', background: loading ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'default' : 'pointer' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#827d76', marginTop: '20px' }}>
            Don't have an account?{' '}
            <a href="/signup" style={{ color: '#1a5fa8', textDecoration: 'none', fontWeight: '500' }}>Get started</a>
          </p>
        </div>
      </div>
    </div>
  )
}