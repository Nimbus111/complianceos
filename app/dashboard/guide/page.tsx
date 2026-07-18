import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function GuidePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) redirect('/onboarding')

  const { data: org } = await supabase
    .from('organizations').select('*').eq('id', profile.org_id).single()

  const modalities = org?.modality_names || []

  const { data: regs } = await supabase
    .from('regulations')
    .select('*')
    .eq('state_name', org?.facility_state || '')
    .in('modality_name', modalities.length ? modalities : ['General Radiography'])
    .limit(4)

  const reg = regs?.[0]

  const bool = (v: any) => v === true ? { text: 'Required', color: '#2d6a4f', bg: '#edfaf3', border: '#b8e8cc' }
    : v === false ? { text: 'Not required', color: '#a8a39c', bg: '#f4f7fb', border: '#e8e6e2' }
    : null

  const sections = [
    {
      title: 'Registration & Licensing',
      rows: [
        ['Facility registration', bool(reg?.facility_registration_req)],
        ['Machine registration', bool(reg?.machine_registration_req)],
        ['Renewal frequency', reg?.registration_renewal_frequency ? { text: reg.registration_renewal_frequency, color: '#0d2d5e', bg: '#e8f3fb', border: '#c2ddf0' } : null],
      ]
    },
    {
      title: 'Equipment & QA',
      rows: [
        ['QA testing', bool(reg?.qa_testing)],
        ['Lead aprons', bool(reg?.lead_aprons_req)],
        ['Shielding requirements', reg?.shielding_requirements ? { text: 'Required — see details', color: '#0d2d5e', bg: '#e8f3fb', border: '#c2ddf0' } : null],
      ]
    },
    {
      title: 'Safety & Personnel',
      rows: [
        ['Radiation Safety Officer', bool(reg?.rso_req)],
        ['Dosimetry monitoring', bool(reg?.dosimetry_monitoring)],
        ['RPP / RSP required', bool(reg?.rpp_req)],
        ['Posting requirements', bool(reg?.posting_requirements)],
      ]
    },
  ]

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>
            {org?.facility_state} Compliance Reference
          </h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>
            {org?.name} · {[org?.facility_type_name, ...modalities].filter(Boolean).join(' · ')}
          </p>
        </div>

        {!reg ? (
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>No regulation data found</p>
            <p style={{ fontSize: '13px', color: '#827d76', maxWidth: '380px', margin: '0 auto 16px' }}>
              We may not have data yet for your specific state and modality combination. Try the full compliance search.
            </p>
            <a href="/" style={{ fontSize: '13px', fontWeight: '500', color: '#fff', background: '#0d2d5e', padding: '8px 20px', borderRadius: '8px', textDecoration: 'none' }}>Search compliance requirements →</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sections.map(section => {
              const validRows = section.rows.filter(([, v]) => v !== null)
              if (!validRows.length) return null
              return (
                <div key={section.title} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '11px 20px', background: '#f4f7fb', borderBottom: '1px solid #eef3fb' }}>
                    <p style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', margin: 0, textTransform: 'uppercase', letterSpacing: '.06em' }}>{section.title}</p>
                  </div>
                  {validRows.map(([label, val]: any) => val && (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 20px', borderBottom: '1px solid #eef3fb' }}>
                      <span style={{ fontSize: '13px', color: '#4a6d8c' }}>{label}</span>
                      <span style={{ fontSize: '11px', fontWeight: '500', color: val.color, background: val.bg, border: `1px solid ${val.border}`, borderRadius: '20px', padding: '2px 10px' }}>{val.text}</span>
                    </div>
                  ))}
                </div>
              )
            })}

            <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden' }}>
  <div style={{ padding: '11px 20px', background: '#0d2d5e', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
    <p style={{ fontSize: '11px', fontWeight: '500', color: '#8bb4d4', margin: 0, textTransform: 'uppercase', letterSpacing: '.06em' }}>Federal Requirements — All Facilities</p>
  </div>
  {[
    ['HIPAA image retention', 'Required — 7 years minimum (6 years from creation or last use, whichever is later) for human x-ray images'],
    ['HIPAA-compliant storage', 'Required — images must be stored on HIPAA-compliant infrastructure; home computers and unencrypted removable drives are not compliant'],
    ['Cloud or network backup', 'Federal guideline — DICOM image storage on cloud or network-based system recommended as redundancy standard'],
    ['Radiation safety records', 'Required — personnel dosimetry records must be retained per NRC guidelines (duration varies by record type)'],
    ['Annual radiation safety review', 'Required — ALARA principle mandates documented annual review of radiation safety program'],
  ].map(([label, value]) => (
    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', padding: '11px 20px', borderBottom: '1px solid #eef3fb' }}>
      <span style={{ fontSize: '13px', color: '#4a6d8c', flexShrink: 0, maxWidth: '200px' }}>{label}</span>
      <span style={{ fontSize: '12px', color: '#0d2d5e', textAlign: 'right', lineHeight: '1.5' }}>{value}</span>
    </div>
  ))}
  <div style={{ padding: '10px 20px' }}>
    <a href="/dashboard/partners" style={{ fontSize: '12px', color: '#1a5fa8', textDecoration: 'none', fontWeight: '500' }}>View PACS and storage partners → </a>
  </div>
</div>

{reg.plain_language_summary && (

              <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '18px 20px' }}>
                <p style={{ fontSize: '11px', fontWeight: '500', color: '#1a5fa8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '8px' }}>Summary</p>
                <p style={{ fontSize: '13px', color: '#1e1c1a', lineHeight: '1.75', margin: 0 }}>{reg.plain_language_summary}</p>
              </div>
            )}

            <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '10px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '13px', color: '#0d2d5e', flex: 1, margin: 0 }}>
                Have a question about any of these requirements for <strong>{org?.facility_state}</strong>?
              </p>
              <a href="/dashboard/ai" style={{ fontSize: '12px', fontWeight: '500', color: '#fff', background: '#0d2d5e', padding: '7px 16px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Ask AI assistant →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}