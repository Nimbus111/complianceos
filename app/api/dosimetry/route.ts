import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

const getAdmin = () => createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })
    const body = await request.json()
    const admin = getAdmin()
    if (body._action === 'save_vendor') {
      const { _action, ...vendor } = body
      await admin.from('dosimetry_vendor').upsert({ org_id: profile.org_id, ...vendor }, { onConflict: 'org_id' })
    } else if (body._action === 'delete_badge') {
      await admin.from('dosimetry_badges').delete().eq('id', body.id).eq('org_id', profile.org_id)
    } else {
      await admin.from('dosimetry_badges').insert({ org_id: profile.org_id, ...body })
    }
    return NextResponse.json({ success: true })
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}