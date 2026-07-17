'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setReady(true)
      else router.push('/forgot-password')
    })
  }, [router])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) { setError(updateError.message); setLoading(false); return }
    router.push('/dashboard')
  }

  const inp: React.CSSProperties = {
    width: '100%', height: '44px', border: '1px solid #c2ddf0', borderRadius: '8px',
    padding: '0 44px 0 14px', fontSize: '14px', color: '#0d2d5e', background: '#fff',
    outline: 'none', boxSizing: 'border-box',
  }

  if (!ready) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c' }}>Verifying reset link...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center' }}>
        <p style={{ color: '#fff', fontSize: '15px', fontWeight: '500', margin: 0 }}>The Radiology Coach · ComplianceOS</p>
      </nav>
      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ marginBottom: '28px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>Set new password</h1>
          <p style={{ fontSize: '13px', color: '#4a6d8c' }}>Choose a strong password for your account</p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '28px' }}>
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '500', color: '#4a6d8c' }}>New password</label>
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8a39c', fontSize: '11px', fontWeight: '500', padding: 0 }}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input style={inp} type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#4a6d8c', marginBottom: '6px' }}>Confirm password</label>
              <input style={{ ...inp, paddingRight: '14px' }} type={showPassword ? 'text' : 'password'} placeholder="Repeat your password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
            {error && <p style={{ fontSize: '13px', color: '#931621', background: '#fefafb', border: '1px solid #f5c6c9', borderRadius: '6px', padding: '8px 12px', margin: 0 }}>{error}</p>}
            <button type="submit" disabled={loading}
              style={{ height: '46px', background: loading ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: loading ? 'default' : 'pointer', marginTop: '4px' }}>
              {loading ? 'Updating...' : 'Set new password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}