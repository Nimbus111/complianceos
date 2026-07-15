import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const getAdmin = () => createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) return NextResponse.json({ error: 'No org found' }, { status: 400 })

    const admin = getAdmin()

    const today = new Date().toISOString().split('T')[0]
    const { data: usageData } = await admin
      .from('ai_usage')
      .select('query_count, token_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    const currentCount = usageData?.query_count || 0
    if (currentCount >= 50) {
      return NextResponse.json({
        error: 'You have reached your 50 query daily limit. Come back tomorrow.',
        limit_reached: true
      }, { status: 429 })
    }

    const { data: org } = await admin
      .from('organizations')
      .select('name, facility_state, facility_type_name, modality_names')
      .eq('id', profile.org_id)
      .single()

    const { message } = await request.json()

    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    const { data: regulations } = await admin.rpc('match_regulations', {
  query_embedding: queryEmbedding,
  match_threshold: 0.4,
  match_count: 6,
  preferred_state: org?.facility_state || null,
})

    const regContext = (regulations || []).map((r: any) => [
      `[${r.state_name} · ${r.modality_name} · ${r.facility_type_name}]`,
      r.plain_language_summary && `Overview: ${r.plain_language_summary}`,
      r.registration_notes && `Registration: ${r.registration_notes}`,
      r.dosimetry_notes && `Dosimetry: ${r.dosimetry_notes}`,
      r.service_notes && `Equipment QA: ${r.service_notes}`,
      r.lead_apron_notes && `Lead aprons: ${r.lead_apron_notes}`,
      r.shielding_expectations && `Shielding: ${r.shielding_expectations}`,
      r.pregnancy_protocols && `Pregnancy protocols: ${r.pregnancy_protocols}`,
      r.notify_state_timeframe && `Notification timeframe: ${r.notify_state_timeframe}`,
      r.facility_registration_req && `Facility registration: Required`,
      r.dosimetry_monitoring && `Dosimetry monitoring: Required`,
      r.qa_testing && `QA testing: Required`,
      r.shielding_plan_req && `Shielding plan: Required`,
    ].filter(Boolean).join('\n')).join('\n\n---\n\n')

    const systemPrompt = `You are a compliance expert for The Radiology Coach ComplianceOS. You help x-ray facility professionals understand their compliance obligations based on official state radiation control regulations.

FACILITY CONTEXT:
Facility: ${org?.name}
Type: ${org?.facility_type_name}
State: ${org?.facility_state}
Modalities: ${(org?.modality_names || []).join(', ')}

RELEVANT REGULATIONS:
${regContext || 'No specific regulations found for this query. Provide general guidance and recommend consulting the state agency.'}

INSTRUCTIONS:
- Answer based on the regulation data above
- Be specific, practical, and actionable
- Always note which state the information applies to
- If regulations don't clearly address the question, say so honestly
- Keep responses clear and readable — use short paragraphs
- End every response with exactly this line: "⚠️ Always verify current requirements directly with your state radiation control agency before making compliance decisions."`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 700,
      temperature: 0.1,
    })

    const response = completion.choices[0].message.content || ''

    await admin.from('ai_usage').upsert({
      user_id: user.id,
      org_id: profile.org_id,
      date: today,
      query_count: currentCount + 1,
      token_count: (usageData?.token_count || 0) + (completion.usage?.total_tokens || 0),
    }, { onConflict: 'user_id, date' })

    const citations = (regulations || []).slice(0, 4).map((r: any) => ({
      id: r.id,
      state: r.state_name,
      modality: r.modality_name,
      facility_type: r.facility_type_name,
      similarity: Math.round(r.similarity * 100),
    }))

    return NextResponse.json({ response, citations })
  } catch (e: any) {
    console.error('AI chat error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}