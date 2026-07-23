import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { token } = await request.json()
    const a = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Validate token
    const { data: invite } = await a
      .from('invite_tokens').select('*')
      .eq('token', token).single()

    if (!invite) return NextResponse.json({ error: 'Invalid invite' }, { status: 400 })
    if (invite.used_at) return NextResponse.json({ error: 'Invite already used' }, { status: 400 })
    if (new Date(invite.expires_at) < new Date()) return NextResponse.json({ error: 'Invite expired' }, { status: 400 })

    // Create profile if needed
    await a.from('profiles').upsert({
      id: user.id,
      org_id: invite.org_id,
      onboarding_completed: true,
    }, { onConflict: 'id' })

    // Create membership
    await a.from('memberships').upsert({
      org_id: invite.org_id,
      user_id: user.id,
      role: invite.role === 'Admin' ? 'Admin' : invite.role,
    }, { onConflict: 'org_id, user_id' })

    // Mark token as used
    await a.from('invite_tokens').update({ used_at: new Date().toISOString() }).eq('token', token)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}