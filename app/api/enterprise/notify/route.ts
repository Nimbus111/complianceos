import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { site_org_id, enterprise_org_id } = await request.json()

  const { data: existing } = await supabase
    .from('enterprise_notifications')
    .select('id')
    .eq('site_org_id', site_org_id)
    .eq('enterprise_org_id', enterprise_org_id)
    .is('acknowledged_at', null)
    .maybeSingle()

  if (existing) return NextResponse.json({ status: 'already_pending' })

  const { error } = await supabase
    .from('enterprise_notifications')
    .insert({
      enterprise_org_id,
      site_org_id,
      sent_by: user.id,
      message: 'Your administrator has requested you complete your remaining compliance actions.'
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ status: 'sent' })
}