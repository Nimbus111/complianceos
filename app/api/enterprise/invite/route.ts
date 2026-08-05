import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { site_org_id, email } = await request.json()

  const { data: existing } = await supabase
    .from('invite_tokens')
    .select('token')
    .eq('org_id', site_org_id)
    .eq('email', email)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (existing) {
    return NextResponse.json({
      status: 'existing',
      inviteUrl: `https://app.theradiologycoach.com/invite/${existing.token}`
    })
  }

  const { data: invite, error } = await supabase
    .from('invite_tokens')
    .insert({ org_id: site_org_id, email, role: 'Admin', created_by: user.id })
    .select('token')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    status: 'created',
    inviteUrl: `https://app.theradiologycoach.com/invite/${invite.token}`
  })
}