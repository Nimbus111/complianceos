import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: licenses } = await admin
      .from('service_provider_licenses')
      .select('state, expiry_date')
      .eq('org_id', profile.org_id)

    const { data: rules } = await admin
      .from('sp_state_rules')
      .select('*')

    const rulesMap: Record<string, any> = {}
    ;(rules || []).forEach((r: any) => { if (r.state_name) rulesMap[r.state_name] = r })

    let created = 0

    for (const lic of (licenses || [])) {
      const rule = rulesMap[lic.state]
      if (!rule?.renewal_frequency) continue

      const dueDate = lic.expiry_date || new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]

      const { error } = await admin
        .from('compliance_calendar')
        .insert({
          org_id: profile.org_id,
          title: `${lic.state} SP Registration Renewal`,
          event_category: 'registration_licensing',
          event_type: 'registration_renewal',
          due_date: dueDate,
          notes: `${rule.renewal_frequency} renewal. ${rule.annual_renewal_date ? `Due: ${rule.annual_renewal_date}.` : ''} ${rule.vendor_registration_required ? 'Registration required.' : ''}`.trim(),
        })

      if (!error) created++
    }

    return NextResponse.json({ success: true, created })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}