import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getAdmin = () => createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateReferralCode(companyName: string): string {
  const prefix = companyName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4)
    .padEnd(4, 'X')
  const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4).padEnd(4, '0')
  return `${prefix}-${suffix}`
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { companyName, primaryState, statesServed, specialties, contactName, contactPhone } = body

    const admin = getAdmin()
    const referralCode = generateReferralCode(companyName)

    const { data: org, error: orgError } = await admin
      .from('organizations')
      .insert({
        name: companyName,
        org_type: 'service_provider',
        facility_state: primaryState,
        rso_name: contactName || null,
        rso_phone: contactPhone || null,
        referral_code: referralCode,
        modality_names: specialties || [],
      })
      .select()
      .single()

    if (orgError) return NextResponse.json({ error: orgError.message }, { status: 400 })

    const { error: profileError } = await admin.from('profiles').upsert({
  id: user.id,
  org_id: org.id,
  onboarding_completed: true,
  display_name: contactName || companyName,
}, { onConflict: 'id' })

if (profileError) {
  console.error('Profile upsert error:', profileError.message)
  return NextResponse.json({ error: `Profile update failed: ${profileError.message}` }, { status: 400 })
}

    await admin.from('memberships').upsert({
  org_id: org.id,
  user_id: user.id,
  role: 'Admin',
}, { onConflict: 'org_id, user_id' })


    return NextResponse.json({ success: true, referral_code: referralCode })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}