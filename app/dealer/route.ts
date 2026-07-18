import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

    const body = await request.json()
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // REVENUE SHARE POLICY: we ONLY update organizations — never client_facilities.
    // The original referring SP retains revenue share regardless of dealer change.
    if (body.mode === 'subscriber' && body.sp_org_id) {
      const { data: spOrg } = await admin
        .from('organizations').select('name, rso_phone').eq('id', body.sp_org_id).single()
      await admin.from('organizations').update({
        dealer_sp_org_id: body.sp_org_id,
        dealer_name: spOrg?.name || null,
        dealer_phone: spOrg?.rso_phone || null,
        dealer_email: null,
      }).eq('id', profile.org_id)
    } else if (body.mode === 'manual') {
      await admin.from('organizations').update({
        dealer_sp_org_id: null,
        dealer_name: body.dealer_name || null,
        dealer_phone: body.dealer_phone || null,
        dealer_email: body.dealer_email || null,
      }).eq('id', profile.org_id)
    } else if (body.mode === 'clear') {
      await admin.from('organizations').update({
        dealer_sp_org_id: null,
        dealer_name: null,
        dealer_phone: null,
        dealer_email: null,
      }).eq('id', profile.org_id)
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}