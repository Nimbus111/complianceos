import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID!
const AIRTABLE_KEY = process.env.AIRTABLE_API_KEY!

const getStr = (v: any): string => (v != null ? String(v).trim() : '')
const getBool = (v: any): boolean => Boolean(v)
const getLinked = (v: any): string => {
  if (!v) return ''
  if (typeof v === 'string') return v
  if (Array.isArray(v)) { const f = v[0]; return typeof f === 'string' ? f : f?.name || '' }
  return ''
}

async function fetchAll(table: string) {
  const rows: any[] = []
  let offset: string | undefined
  do {
    const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(table)}`)
    if (offset) url.searchParams.set('offset', offset)
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } })
    const data = await res.json()
    rows.push(...(data.records || []))
    offset = data.offset
  } while (offset)
  return rows
}

export async function GET() {
  const supabase = await createClient()
  const records = await fetchAll('X-ray Service Provider State Rules')

  const rows = records.map((r: any) => {
    const f = r.fields
    return {
      airtable_id: r.id,
      state_name: getLinked(f['State']),
      rule_title: getStr(f['Name']),
      vendor_registration_req: getBool(f["Vendor Registration Req'd"]),
      agency_issues_cert: getBool(f['Agency Issues Registration Certificate']),
      application_fee: getStr(f['Application Fee']),
      renewal_frequency: getStr(f['Renewal Frequency']),
      registration_notes: getStr(f['Registration Notes']),
      credentials_required: getBool(f['Credentials of Personnel Must Be Submitted']),
      baseline_creds: getStr(f['Baseline Service Provider Creds']),
      out_of_state_must_register: getBool(f['Out of State Vendors Must Register with the State']),
      sp_may_draw_floor_plans: getBool(f['Service Providers May Draw Floor Plans?']),
      dosimetry_for_engineers: getBool(f['Dosimetry for Service Engineers']),
      compliance_notes: getStr(f['Compliance Notes']),
      reporting: getStr(f['Reporting']),
      out_of_state_reciprocity: getBool(f['Out of State Reciprocity']),
      out_of_state_reciprocity_rules: getStr(f['Out of State Reciprocity Rules']),
      leasing_equipment_rules: getStr(f['Leasing Equipment Rules']),
      updated_at: new Date().toISOString()
    }
  }).filter(r => r.state_name)

  const { error } = await supabase.from('sp_state_rules')
    .upsert(rows, { onConflict: 'airtable_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ synced: rows.length })
}