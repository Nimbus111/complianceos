import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const getStr = (val: any): string | null => {
  if (!val) return null
  if (typeof val === 'object') return null
  return String(val).trim() || null
}

const getBool = (val: any): boolean =>
  val === true || val === 'true' || val === 'Yes'

const extractState = (name: string | null): string | null => {
  if (!name) return null
  return name.replace(/\s+Installs?$/i, '').trim() || null
}

export async function GET() {
  try {
    const admin = createAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const records: any[] = []
    let offset: string | undefined

    do {
      const url = new URL(
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/X-ray%20Service%20Provider%20State%20Rules`
      )
      url.searchParams.set('pageSize', '100')
      url.searchParams.set('view', 'Grid view')
      if (offset) url.searchParams.set('offset', offset)

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_PAT}` },
        cache: 'no-store',
      })

      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      records.push(...data.records)
      offset = data.offset
    } while (offset)

    let synced = 0
    let errors = 0

    for (const record of records) {
      const f = record.fields
      const { error } = await admin
        .from('sp_state_rules')
        .upsert({
          airtable_record_id: record.id,
          state_name: extractState(getStr(f['Name'])),
          vendor_registration_required: getBool(f['Vendor Registration Req\'d?']),
          service_provider_application: getBool(f['Service Provider Application']),
          agency_issues_certificate: getBool(f['Agency Issues Registration Certificate']),
          renewal_frequency: getStr(f['Renewal frequency']),
          annual_renewal_date: getStr(f['Annual renewal date (if applicable)']),
          out_of_state_reciprocity: getStr(f['Out of State Reciprocity']),
          out_of_state_reciprocity_rules: getStr(f['Out of State Reciprocity Rules']),
        }, { onConflict: 'airtable_record_id' })

      if (error) { console.error(error.message); errors++ }
      else synced++
    }

    return NextResponse.json({ success: true, synced, errors, timestamp: new Date().toISOString() })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}