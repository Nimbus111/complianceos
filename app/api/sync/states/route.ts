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
  if (!val) return null
  if (typeof val === 'object') return null
  return String(val).replace(/\u200B/g, '').trim() || null
}

const getArr = (val: any): string[] => {
  if (!val) return []
  if (Array.isArray(val)) return val.filter(v => typeof v === 'string')
  if (typeof val === 'string') return [val]
  return []
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
        `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/State%20Contacts`
      )
      url.searchParams.set('pageSize', '100')
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
      const stateNames = getArr(f['States Covered (Names)'])
      if (stateNames.length === 0) continue

      const contact = {
        agency_name: getStr(f['Organization']),
        agency_director: getStr(f['Director']),
        agency_phone: getStr(f['Phone Number']),
        agency_email: getStr(f['Registration Email Address']),
        agency_notes: getStr(f['Notes']),
      }

      for (const stateName of stateNames) {
        const stateCode = STATE_CODES[stateName]
        if (!stateCode) continue

        const { error } = await admin
          .from('states')
          .upsert(
            { state_name: stateName, state_code: stateCode, ...contact },
            { onConflict: 'state_code' }
          )

        if (error) { console.error(stateName, error.message); errors++ }
        else synced++
      }
    }

    return NextResponse.json({ success: true, synced, errors, timestamp: new Date().toISOString() })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}