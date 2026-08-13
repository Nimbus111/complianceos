'use client'
import { useState } from 'react'

const DOC_CATEGORIES = [
  { key: 'state_equipment_registration', label: 'State Equipment Registration', description: 'State-issued x-ray equipment registration forms' },
  { key: 'state_facility_registration', label: 'State Facility Registration', description: 'Facility permit or license from state authority' },
  { key: 'equipment_receipts', label: 'Machine and Accessories Receipts', description: 'Purchase records, invoices, delivery documentation' },
  { key: 'user_manuals', label: 'Manufacturer User Manuals', description: 'X-ray machine, computer, and digital imaging manuals' },
  { key: 'calibration_records', label: 'Performance and Calibration Records', description: 'Service reports, QA logs, calibration certificates' },
  { key: 'operator_credentials', label: 'Operator Credentials and Training', description: 'Certifications, CEU completions, training records' },
  { key: 'warranty_docs', label: 'Warranty Documentation', description: 'Equipment warranty certificates and terms' },
  { key: 'service_contracts', label: 'Service Contracts', description: 'Support and maintenance agreements' },
  { key: 'communications', label: 'Communications', description: 'Emails, mail, and support tickets from manufacturers, dealers, and warranty companies' },
  { key: 'decommissioned', label: 'Decommissioned Machine Documentation', description: 'Disposal records and state notifications' },
]

interface Props {
  categoryCounts: Record<string, number>
  hiddenCategories: string[]
  onToggleHide: (key: string) => void
}

export default function DocumentGuideSidebar({ categoryCounts, hiddenCategories, onToggleHide }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [showHidden, setShowHidden] = useState(false)

  const visibleCategories = DOC_CATEGORIES.filter(c => !hiddenCategories.includes(c.key))
  const hiddenList = DOC_CATEGORIES.filter(c => hiddenCategories.includes(c.key))

  const totalUploaded = Object.values(categoryCounts).reduce((sum, n) => sum + n, 0)
  const categoriesComplete = DOC_CATEGORIES.filter(c => (categoryCounts[c.key] || 0) > 0).length

  return (
    <div style={{ position: 'fixed', right: '24px', top: '80px', width: '272px', zIndex: 50, fontFamily: 'Inter, system-ui, sans-serif', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>

      <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden', position: 'sticky', top: '20px' }}>

        {/* Header */}
        <button onClick={() => setCollapsed(!collapsed)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'block', textAlign: 'left', fontFamily: 'Inter, system-ui, sans-serif' }}>
          <div style={{ padding: '14px 16px', background: '#0d2d5e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#fff', margin: '0 0 2px' }}>Document Guide</p>
              <p style={{ fontSize: '11px', color: '#8bb4d4', margin: 0 }}>{categoriesComplete} of {DOC_CATEGORIES.length} categories filled</p>
            </div>
            <span style={{ color: '#8bb4d4', fontSize: '14px' }}>{collapsed ? '▼' : '▲'}</span>
          </div>
        </button>

        {/* Progress bar */}
        {!collapsed && (
          <div style={{ padding: '10px 16px 0', borderBottom: '1px solid #f4f7fb' }}>
            <div style={{ height: '4px', background: '#f0f4f8', borderRadius: '2px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{ height: '100%', background: '#1a5fa8', borderRadius: '2px', width: `${Math.round((categoriesComplete / DOC_CATEGORIES.length) * 100)}%`, transition: 'width .3s' }} />
            </div>
          </div>
        )}

        {/* Category list */}
        {!collapsed && (
          <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
            {visibleCategories.map(cat => {
              const count = categoryCounts[cat.key] || 0
              const hasDoc = count > 0
              return (
                <div key={cat.key} style={{ padding: '10px 16px', borderBottom: '1px solid #f4f7fb', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: hasDoc ? '#1a5fa8' : '#dce8f5', border: hasDoc ? 'none' : '1px solid #c2ddf0', flexShrink: 0, marginTop: '5px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: '500', color: hasDoc ? '#0d2d5e' : '#4a6d8c', margin: '0 0 2px', lineHeight: '1.3' }}>{cat.label}</p>
                    {hasDoc ? (
                      <p style={{ fontSize: '11px', color: '#1a5fa8', margin: 0 }}>{count} document{count !== 1 ? 's' : ''} uploaded</p>
                    ) : (
                      <p style={{ fontSize: '11px', color: '#a8a39c', margin: 0 }}>{cat.description}</p>
                    )}
                  </div>
                  <button onClick={() => onToggleHide(cat.key)}
                    style={{ fontSize: '10px', color: '#a8a39c', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', flexShrink: 0, fontFamily: 'Inter, system-ui, sans-serif' }}
                    title="Hide this category">
                    hide
                  </button>
                </div>
              )
            })}

            {/* Hidden categories */}
            {hiddenList.length > 0 && (
              <div style={{ padding: '8px 16px', borderTop: '1px solid #f4f7fb' }}>
                <button onClick={() => setShowHidden(!showHidden)}
                  style={{ fontSize: '11px', color: '#a8a39c', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {showHidden ? '▲' : '▼'} {hiddenList.length} hidden categor{hiddenList.length !== 1 ? 'ies' : 'y'}
                </button>
                {showHidden && hiddenList.map(cat => (
                  <div key={cat.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                    <span style={{ fontSize: '11px', color: '#c2ddf0', textDecoration: 'line-through' }}>{cat.label}</span>
                    <button onClick={() => onToggleHide(cat.key)}
                      style={{ fontSize: '10px', color: '#1a5fa8', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif' }}>
                      show
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: '10px 16px', background: '#f8fbfe' }}>
              <p style={{ fontSize: '11px', color: '#4a6d8c', margin: 0 }}>{totalUploaded} total documents · Select a category when uploading to track progress here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}