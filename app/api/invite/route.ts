import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const admin = () => createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST — create invite
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

    // Check invoker is Admin
    const { data: membership } = await supabase
      .from('memberships').select('role')
      .eq('org_id', profile.org_id).eq('user_id', user.id).single()
    if (membership?.role !== 'Admin') {
      return NextResponse.json({ error: 'Only Admins can invite team members' }, { status: 403 })
    }

    // Check team size limit (max 3 users)
    const { count } = await supabase
      .from('memberships').select('*', { count: 'exact', head: true })
      .eq('org_id', profile.org_id)
    if ((count || 0) >= 3) {
      return NextResponse.json({ error: 'Professional accounts support up to 3 team members.' }, { status: 400 })
    }

    const { email, role } = await request.json()
    if (!email || !['Manager', 'Technician'].includes(role)) {
      return NextResponse.json({ error: 'Valid email and role required' }, { status: 400 })
    }

    const a = admin()
    const { data: invite, error } = await a
      .from('invite_tokens')
      .insert({ org_id: profile.org_id, email, role, invited_by: user.id })
      .select('token').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const inviteUrl = `https://app.theradiologycoach.com/invite?token=${invite.token}`
    return NextResponse.json({ success: true, invite_url: inviteUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE — remove team member
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()

    const { membership_id } = await request.json()
    await admin()
      .from('memberships').delete()
      .eq('id', membership_id).eq('org_id', profile.org_id)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}