import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state')
  const supabase = await createClient()

  if (state) {
    const { data } = await supabase
      .from('state_forms')
      .select('*')
      .ilike('state_name', `%${state}%`)
      .order('form_name')
    return NextResponse.json(data || [])
  }

  const { data } = await supabase
    .from('state_forms')
    .select('state_name')
    .order('state_name')
  const states = [...new Set((data || []).map((r: any) => r.state_name).filter(Boolean))]
  return NextResponse.json({ states })
}