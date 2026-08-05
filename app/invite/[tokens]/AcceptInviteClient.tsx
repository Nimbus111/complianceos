'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AcceptInviteClient({ token, orgId, email }: { token: string, orgId: string, email: string }) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [form, setForm] = useState({ email, password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const accept = async () => {
    await fetch('/api/enterprise/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, orgId })
    })
    router.push('/dashboard')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'signup') {
      const { error: err } = await supabase.auth.signUp({ email: form.email, password: form.password })
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      if (err) { setError(err.message); setLoading(false); return }
    }

    await accept()
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['signup', 'login'] as const).map(m => (
          <button key={m} type="button" onClick={() => setMode(m)}
            style={{ flex: 1, padding: '8px', borderRadius: '7px', border: `1px solid ${mode === m ? '#0d2d5e' : '#c2ddf0'}`, background: mode === m ? '#0d2d5e' : '#fff', color: mode === m ? '#fff' : '#4a6d8c', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
            {m === 'signup' ? 'Create account' : 'Log in'}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#4a6d8c', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Email</label>
          <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" required
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#4a6d8c', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Password</label>
          <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} type="password" required minLength={6}
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '13px', fontFamily: 'Inter, system-ui, sans-serif', boxSizing: 'border-box' }} />
        </div>
        {error && <p style={{ fontSize: '12px', color: '#931621', margin: 0 }}>{error}</p>}
        <button type="submit" disabled={loading}
          style={{ background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '7px', padding: '11px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif', marginTop: '4px' }}>
          {loading ? 'Please wait...' : mode === 'signup' ? 'Create account & join clinic' : 'Sign in & join clinic'}
        </button>
      </form>
    </div>
  )
}