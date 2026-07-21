import { createClient as createAdmin } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const STATE_CODES: Record<string, string> = {
  'Alabama':'AL','Alaska':'AK','Arizona':'AZ','Arkansas':'AR',
  'California':'CA','Colorado':'CO','Connecticut':'CT','Delaware':'DE',
  'Florida':'FL','Georgia':'GA','Hawaii':'HI','Idaho':'ID',
  'Illinois':'IL','Indiana':'IN','Iowa':'IA','Kansas':'KS',
  'Kentucky':'KY','Louisiana':'LA','Maine':'ME','Maryland':'MD',
  'Massachusetts':'MA','Michigan':'MI','Minnesota':'MN','Mississippi':'MS',
  'Missouri':'MO','Montana':'MT','Nebraska':'NE','Nevada':'NV',
  'New Hampshire':'NH','New Jersey':'NJ','New Mexico':'NM','New York':'NY',
  'North Carolina':'NC','North Dakota':'ND','Ohio':'OH','Oklahoma':'OK',
  'Oregon':'OR','Pennsylvania':'PA','Rhode Island':'RI','South Carolina':'SC',
  'South Dakota':'SD','Tennessee':'TN','Texas':'TX','Utah':'UT',
  'Vermont':'VT','Virginia':'VA','Washington':'WA','West Virginia':'WV',
  'Wisconsin':'WI','Wyoming':'WY','District of Columbia':'DC',
}

const getStr = (val: any): string | null => {
  if (val === null || val === undefined) return null
  if (typeof val === 'object') {
    if (val.state === 'error') return null
    return null
  }
  const s = String(val).trim()
  return s || null
}

const getBool = (val: any): boolean | null => {
  if (val === true || val === false) return val
  return null
}

const getArr = (val: any): string | null => {
  if (!val) return null
  if (Array.isArray(val)) {
    const strings = val.map((v: any) => {
      if (typeof v === 'string') return v.trim()
      if (typeof v === 'object' && v !== null) return v.name || v.value || v.text || null
      return null
    }).filter(Boolean) as string[]
    return strings.length > 0 ? strings.join(', ') : null
  }
  return getStr(val)
}

function mapRecord(record: any) {
  const f = record.fields
  const stateName = getArr(f['State Name (from State)'])

  return {
    airtable_record_id: record.id,
    state_name: stateName,
    state_code: stateName ? (STATE_CODES[stateName] ?? null) : null,
    modality_name: getArr(f['Modality Name (from Modality)']),
    facility_type_name: getArr(f['Facility Type Name (from Facility Type)']),

    form_2579_rules: getArr(f['Form 2579 rules']),
    state_own_reg_form: getBool(f['State Has Own X-ray Machine Registration Form?']),
    registration_notes: getStr(f['Registration Notes']) ?? getStr(f['State Machine Registration Form Notes']),
    con_required: getStr(f["Certificate of Need Req'd?"]),
    annual_renewal: getBool(f['Annual renewal of device registration']),
    renewal_timeline: getStr(f['Renewal Timeline (if not annually)']) ?? getStr(f['Annual Renewal of Device Notes']),
    facility_registration_req: getBool(f["Facility Registration Req'd?"]),

    shielding_plan_req: getBool(f["Shielding Plan Req'd"]),
    shielding_approval_req: getBool(f["Shielding Plan Approval Req'd"]),
    post_install_inspection: getBool(f['Schedule Post-Installation Inspection']),
    shielding_party: getStr(f['Party required to perform/approve shielding plan']),
    shielding_expectations: getStr(f['Shielding Plan Expectations']),

    equipment_performance_eval: getBool(f['Equipment Performance Evaluation']),
    equipment_training_records: getBool(f['X-ray Equipment Training Records']),
    operator_credentials: getBool(f['X-ray Operator Credentials/Certification'])
      ? 'Required'
      : getStr(f['X-ray Operator Credentials/Certification Notes']),
    qa_testing: getBool(f['Quality Assurance Testing for X-ray System']),
    retain_service_docs: getBool(f['Retain Maintenance, Repairs, Service Documents']),
    service_notes: getStr(f['Quality Assurance Testing Notes'])
      ?? getStr(f['Retain Maintenance, Repairs, and Service Documents Notes']),
    post_install_requirements: getArr(f['Installation Scenario']),

    dosimetry_monitoring: getBool(f['Dosimetry Monitoring']),
    dosimetry_notes: getStr(f['Dosimetry Monitoring Requirement Notes']),
    keep_exposure_records: getBool(f['Keep Exposure Records for Previous Employees']),

    lead_aprons_req: getStr(f["Lead Aprons Req'd?"]),
    lead_apron_inspection: getBool(f['Lead apron inspection checks']) ? 'Required' : null,
    lead_apron_notes: getStr(f['Lead Apron Notes'])
      ?? getStr(f["Lead Apron Req'd Notes"])
      ?? getStr(f['LeaApron Inspection Notes']),

    pregnancy_protocols: getStr(f['Pregnancy Protocol Notes'])
      ?? (getBool(f['Staff or Patient Pregnancy Protocols']) ? 'Required' : null),

    service_provider_docs: getBool(f['Service Provider Docs']),
    notify_state_timeframe: getStr(f['Timeframe to notify state of important changes']),
    notify_remove_unit: getStr(f['Procedure for Removing an X-ray Unit'])
      ?? (getBool(f['Notify State When Removing X-ray Unit']) ? 'Required' : null),
    termination_notes: getStr(f['Theft/Vandalism Reporting']),

    plain_language_summary: getStr(f['Regulation Summary (AI)']),

    updated_at: new Date().toISOString(),
  }
}

const getAdminClient = () => createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fetchPage(offset?: string) {
  const url = new URL(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Regulations`
  )
  url.searchParams.set('pageSize', '100')
  if (offset) url.searchParams.set('offset', offset)

  const res = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${process.env.AIRTABLE_PAT}` },
    cache: 'no-store',
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Airtable API error: ${JSON.stringify(err)}`)
  }

  return res.json() as Promise<{ records: any[]; offset?: string }>
}

export async function GET() {
  const startTime = Date.now()

  try {
    const admin = getAdminClient()
    let offset: string | undefined
    let totalSynced = 0
    let totalErrors = 0
    let page = 0

    do {
      page++
      const data = await fetchPage(offset)
      offset = data.offset

      for (const record of data.records) {
        try {
          const mapped = mapRecord(record)
          const { error } = await admin
            .from('regulations')
            .upsert(mapped, { onConflict: 'airtable_record_id' })

          if (error) {
            console.error(`Error upserting ${record.id}:`, error.message)
            totalErrors++
          } else {
            totalSynced++
          }
        } catch (recordError: any) {
          console.error(`Error mapping ${record.id}:`, recordError.message)
          totalErrors++
        }
      }

      if (offset) await new Promise(r => setTimeout(r, 250))

    } while (offset)

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)

    return NextResponse.json({
      success: true,
      synced: totalSynced,
      errors: totalErrors,
      pages: page,
      duration_seconds: duration,
      timestamp: new Date().toISOString(),
    })

  } catch (e: any) {
    console.error('Sync failed:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}