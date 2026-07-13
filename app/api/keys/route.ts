import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getAdmin = () => createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

    const { kts_id, completed } = await request.json()
    const admin = getAdmin()

    if (completed) {
      const { error } = await admin
        .from('compliance_checklists')
        .upsert({
          org_id: profile.org_id,
          guidance_id: kts_id,
          completed: true,
          completed_by: user.id,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'org_id, guidance_id' })
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    } else {
      const { error } = await admin
        .from('compliance_checklists')
        .delete()
        .eq('org_id', profile.org_id)
        .eq('guidance_id', kts_id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}