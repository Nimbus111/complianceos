import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { notification_id } = await request.json()

  const { error } = await supabase
    .from('enterprise_notifications')
    .update({ acknowledged_at: new Date().toISOString() })
    .eq('id', notification_id)
    .eq('site_org_id', (
      await supabase.from('profiles').select('org_id').eq('id', user.id).single()
    ).data?.org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ status: 'acknowledged' })
}