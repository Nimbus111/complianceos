import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { facilityName, facilityType, facilityState,
            selectedModalities, rsoName, rsoEmail, rsoPhone } = body

    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: org, error: orgError } = await admin
      .from('organizations')
      .insert({
        name: facilityName,
        org_type: 'facility',
        subscription_tier: 'free',
        facility_state: facilityState,
        facility_type_name: facilityType,
        modality_names: selectedModalities,
        rso_name: rsoName,
        rso_email: rsoEmail,
        rso_phone: rsoPhone,
dealer_name: body.dealer_name || null,
dealer_phone: body.dealer_phone || null,
dealer_email: body.dealer_email || null,
dealer_sp_org_id: body.dealer_sp_org_id || null,
      })
      .select()
      .single()

    if (orgError) return NextResponse.json({ error: orgError.message }, { status: 400 })

    const { error: profileError } = await admin
      .from('profiles')
      .upsert({
        id: user.id,
        org_id: org.id,
        display_name: rsoName,
        onboarding_completed: true,
      })

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 })

    const { error: memberError } = await admin
      .from('memberships')
      .insert({ user_id: user.id, org_id: org.id, role: 'Admin' })

    if (memberError) return NextResponse.json({ error: memberError.message }, { status: 400 })

    // Referral code always takes priority over dropdown for commission
const referralSpId = body.referral_code
  ? (await admin.from('organizations').select('id').eq('referral_code', body.referral_code).single()).data?.id
  : null

const commissionSpId = referralSpId || body.dealer_sp_org_id || null

if (commissionSpId) {
  await admin.from('client_facilities').upsert({
    sp_org_id: commissionSpId,
    facility_org_id: org.id,
  }, { onConflict: 'sp_org_id, facility_org_id' })
}

return NextResponse.json({ success: true })

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}