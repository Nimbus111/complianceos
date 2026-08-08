import { NextResponse } from 'next/server'

const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID!
const AIRTABLE_KEY = process.env.AIRTABLE_API_KEY!

export async function GET() {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/X-ray%20Service%20Provider%20State%20Rules?maxRecords=1`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } })
  const data = await res.json()
  const fields = data.records?.[0]?.fields || {}
  return NextResponse.json({ fieldNames: Object.keys(fields), sample: fields })
}