'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      style={{ color: '#8bb4d4', background: 'none', border: '1px solid rgba(255,255,255,0.15)', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
    >
      Sign out
    </button>
  )
}
File 2 — app/dashboard/page.tsx: Right-click app → New Folder → dashboard → New File → page.tsx → paste → Ctrl+S:

tsx


import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from '../components/SignOutButton'

