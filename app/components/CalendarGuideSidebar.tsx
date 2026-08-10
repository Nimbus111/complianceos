'use client'
import { useState } from 'react'

const GUIDE_CATEGORIES = [
  { key: 'equipment_renewal', label: 'X-ray Equipment Renewal', frequency: 'Annual', eventTypes: ['equipment_registration_renewal'] },
  { key: 'facility_renewal', label: 'Facility Registration Renewal', frequency: 'Annual', eventTypes: ['facility_registration_renewal', 'business_license_renewal'] },
  { key: 'machine_calibration', label: 'Machine Care and Calibration', frequency: 'Daily · Weekly · Monthly · Annual', eventTypes: ['semi_annual_qa_testing', 'weekly_qa_checks', 'equipment_service', 'annual_equipment_evaluation', 'acceptance_testing', 'dosimetry_calibration'] },
  { key: 'operator_renewals', label: 'Operator Renewals', frequency: 'Per state requirement', eventTypes: ['rso_training_renewal'] },
  { key: 'operator_ceu', label: 'Operator CEU Submittal', frequency: 'Annual or biannual', eventTypes: ['operator_ceu'] },
  { key: 'lead_apron', label: 'Lead Apron Checks', frequency: 'Biannual or annual', eventTypes: ['lead_apron_inspection'] },
  { key: 'dosimetry', label: 'Dosimetry Readings', frequency: 'Monthly', eventTypes: ['dosimetry_badge_exchange'] },
  { key: 'rpp_review', label: 'RPP / RSP Review and Update', frequency: 'Annual', eventTypes: ['rsp_annual_review'] },
  { key: 'digital_qa', label: 'Digital System QA Procedures', frequency: 'Per manufacturer', eventTypes: ['semi_annual_qa_testing', 'weekly_qa_checks'] },
  { key: 'patient_files', label: 'Digital Patient Files Reconciliation', frequency: 'Quarterly', eventTypes: ['patient_file_reconciliation'] },
  { key: 'personnel_training', label: 'New Personnel Training and Credential Upload', frequency: 'Quarterly', eventTypes: ['staff_training'] },
  { key: 'warranty', label: 'Warranty Expirations', frequency: 'Per device', eventTypes: ['warranty_expiration'] },
  { key: 'software_updates', label: 'X-ray Computer Software Updates', frequency: 'Biannual', eventTypes: ['software_update'] },
  { key: 'support_contracts', label: 'Support Contract Expirations', frequency: 'Per contract', eventTypes: ['support_contract_expiration'] },
]

interface Props {
  events: any[]
}

export default function CalendarGuideSidebar({ events }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [hiddenKeys, setHiddenKeys] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('cal_hidden_categories') || '[]') } catch { return [] }
  })
  const [showHidden, setShowHidden] = useState(false)

  const toggleHide = (key: string) => {
    setHiddenKeys(prev => {
      const next = prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      localStorage.setItem('cal_hidden_categories', JSON.stringify(next))
      return next
    })
  }

  const hasEvents = (cat: typeof GUIDE_CATEGORIES[0]) =>
    events.some(e => cat.eventTypes.includes(e.event_type || e.category))

  const visibleCats = GUIDE_CATEGORIES.filter(c => !hiddenKeys.includes(c.key))
  const hiddenCats = GUIDE_CATEGORIES.filter(c => hiddenKeys.includes(c.key))
  const filledCount = GUIDE_CATEGORIES.filter(c => hasEvents(c)).length

  return (
    <div style={{ width: '272px', flexShrink: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden', position: 'sticky', top: '20px' }}>

        <button onClick={() => setCollapsed(!collapsed)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', fontFamily: 'Inter, system-ui, sans-serif', display: 'block' }}>
          <div style={{ padding: '14px 16px', background: '#0d2d5e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', margin: '0 0 2px' }}>Compliance Guide</p>
              <p style={{ fontSize: '11px', color: '#8bb4d4', margin: 0 }}>{filledCount} of {GUIDE_CATEGORIES.length} categories logged</p>
            </div>
            <span style={{ color: '#8bb4d4', fontSize: '14px' }}>{collapsed ? '▼' : '▲'}</span>
          </div>
        </button>

        {!collapsed && (
          <>
            {/* Progress bar */}
            <div style={{ padding: '8px 16px 0' }}>
              <div style={{ height: '4px', background: '#f0f4f8', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', background: '#1a5fa8', borderRadius: '2px', width: `${Math.round((filledCount / GUIDE_CATEGORIES.length) * 100)}%`, transition: 'width .3s' }} />
              </div>
            </div>

            <div style={{ maxHeight: '560px', overflowY: 'auto' }}>
              {visibleCats.map(cat => {
                const logged = hasEvents(cat)
                return (
                  <div key={cat.key} style={{ padding: '10px 16px', borderBottom: '1px solid #f4f7fb', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: logged ? '#1a5fa8' : '#dce8f5', border: logged ? 'none' : '1px solid #c2ddf0', flexShrink: 0, marginTop: '5px' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: '500', color: logged ? '#0d2d5e' : '#4a6d8c', margin: '0 0 2px', lineHeight: '1.3' }}>{cat.label}</p>
                      <p style={{ fontSize: '11px', color: logged ? '#1a5fa8' : '#a8a39c', margin: 0 }}>{logged ? '✓ Event logged' : cat.frequency}</p>
                    </div>
                    <button onClick={() => toggleHide(cat.key)} title="Hide this category"
                      style={{ fontSize: '10px', color: '#c2ddf0', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', flexShrink: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
                      hide
                    </button>
                  </div>
                )
              })}

              {hiddenCats.length > 0 && (
                <div style={{ padding: '8px 16px', borderTop: '1px solid #f4f7fb' }}>
                  <button onClick={() => setShowHidden(!showHidden)}
                    style={{ fontSize: '11px', color: '#a8a39c', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {showHidden ? '▲' : '▼'} {hiddenCats.length} hidden
                  </button>
                  {showHidden && hiddenCats.map(cat => (
                    <div key={cat.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                      <span style={{ fontSize: '11px', color: '#c2ddf0', textDecoration: 'line-through' }}>{cat.label}</span>
                      <button onClick={() => toggleHide(cat.key)}
                        style={{ fontSize: '10px', color: '#1a5fa8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>show</button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ padding: '10px 16px', background: '#f8fbfe' }}>
                <p style={{ fontSize: '11px', color: '#4a6d8c', margin: 0 }}>Add calendar events using "+ Add event" above. Each logged event marks its category complete here.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}