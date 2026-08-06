import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()

  const { activity_type, period, completed } = await request.json()

  if (completed) {
    await supabase.from('site_activity_completions').upsert({
      org_id: profile?.org_id,
      activity_type,
      period,
      completed_by: user.id
    }, { onConflict: 'org_id,activity_type,period' })
  } else {
    await supabase.from('site_activity_completions').delete()
      .eq('org_id', profile?.org_id)
      .eq('activity_type', activity_type)
      .eq('period', period)
  }

  return NextResponse.json({ status: 'ok' })
}