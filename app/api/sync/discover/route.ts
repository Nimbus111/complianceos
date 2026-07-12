import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Regulations?pageSize=1`

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PAT}`,
      }
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    const record = data.records?.[0]

    if (!record) {
      return NextResponse.json({ error: 'No records found' }, { status: 404 })
    }

    return NextResponse.json({
      record_id: record.id,
      field_names: Object.keys(record.fields).sort(),
      sample_values: record.fields,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}