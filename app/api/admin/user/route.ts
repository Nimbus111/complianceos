import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { email, orgId } = await request.json()

  const { data, error } = await supabase.rpc('assign_user_to_org', {
    p_email: email,
    p_org_id: orgId
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ status: 'assigned' })
}