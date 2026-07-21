'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const inp: React.CSSProperties = {
  width: '100%', height: '38px', border: '1px solid #c2ddf0', borderRadius: '8px',
  padding: '0 12px', fontSize: '13px', color: '#0d2d5e', background: '#fff',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, system-ui, sans-serif'
}

const STAFF_GARMENTS = ['Lead Apron', 'Thyroid Shield', 'Lead Gloves', 'Protective Goggles']
const PATIENT_GARMENTS = ['Patient Lead Apron', 'Gonadal Shield']
const ALL_GARMENTS = [...STAFF_GARMENTS, ...PATIENT_GARMENTS]

const CONTACT_TYPES = [
  { key: 'customer_service', label: 'Customer Service', icon: '📞' },
  { key: 'tech_support', label: 'Tech Support', icon: '🔧' },
  { key: 'warranty', label: 'Warranty', icon: '📋' },
]

function VendorCard({ title, vendor, onSave }: { title: string; vendor: any; onSave: (v: any) => void }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ vendor_name: '', vendor_phone: '', vendor_email: '', account_number: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (vendor) setForm({ vendor_name: vendor.vendor_name || '', vendor_phone: vendor.vendor_phone || '', vendor_email: vendor.vendor_email || '', account_number: vendor.account_number || '' })
  }, [vendor])

  const handleSave = async () => {
    setSaving(true)
    await onSave(form)
    setSaving(false)
    setEditing(false)
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', background: '#f4f7fb', borderBottom: '1px solid #eef3fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>{title}</p>
        <button onClick={() => setEditing(!editing)} style={{ fontSize: '11px', color: '#1a5fa8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
          {editing ? 'Cancel' : vendor?.vendor_name ? 'Edit' : '+ Add'}
        </button>
      </div>
      {!editing && vendor?.vendor_name ? (
        <div style={{ padding: '10px 16px' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: '0 0 2px' }}>{vendor.vendor_name}</p>
          {vendor.vendor_phone && <p style={{ fontSize: '12px', color: '#827d76', margin: 0 }}>{vendor.vendor_phone}</p>}
          {vendor.vendor_email && <p style={{ fontSize: '12px', color: '#827d76', margin: 0 }}>{vendor.vendor_email}</p>}
          {vendor.account_number && <p style={{ fontSize: '11px', color: '#a8a39c', margin: '2px 0 0' }}>Acct: {vendor.account_number}</p>}
        </div>
      ) : !editing ? (
        <p style={{ fontSize: '12px', color: '#a8a39c', padding: '10px 16px', margin: 0, fontStyle: 'italic' }}>No vendor on file</p>
      ) : (
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input style={inp} placeholder="Vendor / company name" value={form.vendor_name} onChange={e => setForm(p => ({ ...p, vendor_name: e.target.value }))} />
          <input style={inp} placeholder="Phone" value={form.vendor_phone} onChange={e => setForm(p => ({ ...p, vendor_phone: e.target.value }))} />
          <input style={inp} placeholder="Email" value={form.vendor_email} onChange={e => setForm(p => ({ ...p, vendor_email: e.target.value }))} />
          <input style={inp} placeholder="Account number (optional)" value={form.account_number} onChange={e => setForm(p => ({ ...p, account_number: e.target.value }))} />
          <button onClick={handleSave} disabled={!form.vendor_name || saving}
            style={{ height: '36px', background: (!form.vendor_name || saving) ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Save vendor'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function EquipmentPage() {
  const [tab, setTab] = useState<'equipment' | 'protection' | 'dosimetry'>('equipment')
  const [orgId, setOrgId] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [garments, setGarments] = useState<any[]>([])
  const [apronVendor, setApronVendor] = useState<any>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [dosiVendor, setDosiVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [openContact, setOpenContact] = useState<{ equipId: string; type: string } | null>(null)
  const [contactForm, setContactForm] = useState({ company_name: '', phone_primary: '', email: '' })
  const [savingContact, setSavingContact] = useState(false)
  const [showAddEquip, setShowAddEquip] = useState(false)
  const [showAddGarment, setShowAddGarment] = useState(false)
  const [showAddBadge, setShowAddBadge] = useState(false)
  const [equipForm, setEquipForm] = useState({ device_name: '', manufacturer: '', model_number: '', serial_number: '', facility_registration_number: '', machine_registration_number: '', modality: '' })
  const [garmentForm, setGarmentForm] = useState({ garment_type: 'Lead Apron', garment_category: 'staff', size: '', condition: 'Good', last_inspection_date: '', notes: '' })
  const [badgeForm, setBadgeForm] = useState({ assigned_to: '', manufacturer: '', model_number: '', date_issued: '', reporting_date: '' })
  const router = useRouter()

  const fetchAll = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }
    setOrgId(profile.org_id)
    const [{ data: eq }, { data: ct }, { data: gm }, { data: av }, { data: bd }, { data: dv }] = await Promise.all([
      supabase.from('equipment').select('*').eq('org_id', profile.org_id).order('created_at'),
      supabase.from('equipment_contacts').select('*').eq('org_id', profile.org_id),
      supabase.from('lead_aprons').select('*').eq('org_id', profile.org_id).order('created_at'),
      supabase.from('apron_vendor').select('*').eq('org_id', profile.org_id).single(),
      supabase.from('dosimetry_badges').select('*').eq('org_id', profile.org_id).order('assigned_to'),
      supabase.from('dosimetry_vendor').select('*').eq('org_id', profile.org_id).single(),
    ])
    setEquipment(eq || [])
    setContacts(ct || [])
    setGarments(gm || [])
    setApronVendor(av || null)
    setBadges(bd || [])
    setDosiVendor(dv || null)
    setLoading(false)
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const saveEquipment = async () => {
    const res = await fetch('/api/equipment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(equipForm) })
    if (res.ok) { setShowAddEquip(false); setEquipForm({ device_name: '', manufacturer: '', model_number: '', serial_number: '', facility_registration_number: '', machine_registration_number: '', modality: '' }); fetchAll() }
  }

  const saveContact = async () => {
    if (!openContact) return
    setSavingContact(true)
    await fetch('/api/equipment-contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ equipment_id: openContact.equipId, contact_type: openContact.type, ...contactForm }) })
    setSavingContact(false)
    setOpenContact(null)
    fetchAll()
  }

  const saveGarment = async () => {
    const res = await fetch('/api/lead-aprons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(garmentForm) })
    if (res.ok) { setShowAddGarment(false); setGarmentForm({ garment_type: 'Lead Apron', garment_category: 'staff', size: '', condition: 'Good', last_inspection_date: '', notes: '' }); fetchAll() }
  }

  const saveBadge = async () => {
    const res = await fetch('/api/dosimetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(badgeForm) })
    if (res.ok) { setShowAddBadge(false); setBadgeForm({ assigned_to: '', manufacturer: '', model_number: '', date_issued: '', reporting_date: '' }); fetchAll() }
  }

  const deleteBadge = async (id: string) => {
    await fetch('/api/dosimetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete_badge', id }) })
    fetchAll()
  }

  const getContact = (equipId: string, type: string) => contacts.find(c => c.equipment_id === equipId && c.contact_type === type)

  const openContactPanel = (equipId: string, type: string) => {
    const existing = getContact(equipId, type)
    setContactForm({ company_name: existing?.company_name || '', phone_primary: existing?.phone_primary || '', email: existing?.email || '' })
    setOpenContact(prev => prev?.equipId === equipId && prev?.type === type ? null : { equipId, type })
  }

  const staffGarments = garments.filter(g => g.garment_category === 'staff' || !g.garment_category)
  const patientGarments = garments.filter(g => g.garment_category === 'patient')

  if (loading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c' }}>Loading equipment...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>Equipment & Safety</h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>X-ray equipment, radiation protection, and dosimetry monitoring</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#fff', borderRadius: '10px', padding: '4px', border: '1px solid #dce8f5', width: 'fit-content' }}>
          {([['equipment', 'X-ray Equipment'], ['protection', 'Lead Protection'], ['dosimetry', 'Dosimetry']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: '7px 18px', borderRadius: '7px', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer', background: tab === key ? '#0d2d5e' : 'transparent', color: tab === key ? '#fff' : '#4a6d8c', transition: 'all .15s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: X-RAY EQUIPMENT ── */}
        {tab === 'equipment' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#827d76', margin: 0 }}>{equipment.length} device{equipment.length !== 1 ? 's' : ''} on file</p>
              <button onClick={() => setShowAddEquip(!showAddEquip)}
                style={{ height: '36px', padding: '0 16px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                + Add equipment
              </button>
            </div>

            {showAddEquip && (
              <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '14px' }}>New X-ray device</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <input style={inp} placeholder="Device name *" value={equipForm.device_name} onChange={e => setEquipForm(p => ({ ...p, device_name: e.target.value }))} />
                  <input style={inp} placeholder="Modality (e.g. General Radiography)" value={equipForm.modality} onChange={e => setEquipForm(p => ({ ...p, modality: e.target.value }))} />
                  <input style={inp} placeholder="Manufacturer" value={equipForm.manufacturer} onChange={e => setEquipForm(p => ({ ...p, manufacturer: e.target.value }))} />
                  <input style={inp} placeholder="Model number" value={equipForm.model_number} onChange={e => setEquipForm(p => ({ ...p, model_number: e.target.value }))} />
                  <input style={inp} placeholder="Serial number" value={equipForm.serial_number} onChange={e => setEquipForm(p => ({ ...p, serial_number: e.target.value }))} />
                  <input style={inp} placeholder="Facility registration #" value={equipForm.facility_registration_number} onChange={e => setEquipForm(p => ({ ...p, facility_registration_number: e.target.value }))} />
                  <input style={{ ...inp, gridColumn: 'span 2' }} placeholder="Machine registration #" value={equipForm.machine_registration_number} onChange={e => setEquipForm(p => ({ ...p, machine_registration_number: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowAddEquip(false)} style={{ flex: 1, height: '38px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={saveEquipment} disabled={!equipForm.device_name} style={{ flex: 2, height: '38px', background: equipForm.device_name ? '#0d2d5e' : '#c2ddf0', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Save device</button>
                </div>
              </div>
            )}

            {equipment.length === 0 ? (
              <div style={{ background: '#fff', border: '1px dashed #c2ddf0', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>No equipment added yet</p>
                <p style={{ fontSize: '13px', color: '#a8a39c' }}>Add your x-ray devices to track registration numbers and service contacts.</p>
              </div>
            ) : equipment.map(eq => (
              <div key={eq.id} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', marginBottom: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>{eq.device_name}</p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {eq.manufacturer && <span style={{ fontSize: '12px', color: '#827d76' }}>{eq.manufacturer}</span>}
                      {eq.model_number && <span style={{ fontSize: '12px', color: '#827d76' }}>Model: {eq.model_number}</span>}
                      {eq.serial_number && <span style={{ fontSize: '12px', color: '#827d76' }}>S/N: {eq.serial_number}</span>}
                    </div>
                    {(eq.facility_registration_number || eq.machine_registration_number) && (
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {eq.facility_registration_number && <span style={{ fontSize: '11px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '1px 8px' }}>Facility Reg: {eq.facility_registration_number}</span>}
                        {eq.machine_registration_number && <span style={{ fontSize: '11px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '1px 8px' }}>Machine Reg: {eq.machine_registration_number}</span>}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flexShrink: 0 }}>
                    {CONTACT_TYPES.map(ct => {
                      const existing = getContact(eq.id, ct.key)
                      const isOpen = openContact?.equipId === eq.id && openContact?.type === ct.key
                      return (
                        <button key={ct.key} onClick={() => openContactPanel(eq.id, ct.key)}
                          style={{ height: '30px', padding: '0 12px', background: isOpen ? '#0d2d5e' : existing ? '#edfaf3' : '#f4f7fb', color: isOpen ? '#fff' : existing ? '#2d6a4f' : '#4a6d8c', border: `1px solid ${isOpen ? '#0d2d5e' : existing ? '#b8e8cc' : '#c2ddf0'}`, borderRadius: '6px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {ct.icon} {ct.label} {existing ? '✓' : '+'}
                        </button>
                      )
                    })}
                  </div>
                </div>
                {openContact?.equipId === eq.id && (
                  <div style={{ padding: '14px 20px', borderTop: '1px solid #eef3fb', background: '#f4f7fb' }}>
                    <p style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      {CONTACT_TYPES.find(c => c.key === openContact?.type)?.label} Contact
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                      <input style={{ ...inp, gridColumn: 'span 2' }} placeholder="Company name" value={contactForm.company_name} onChange={e => setContactForm(p => ({ ...p, company_name: e.target.value }))} />
                      <input style={inp} placeholder="Phone" value={contactForm.phone_primary} onChange={e => setContactForm(p => ({ ...p, phone_primary: e.target.value }))} />
                      <input style={inp} placeholder="Email" value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    {openContact.type === 'warranty' && (
                      <p style={{ fontSize: '11px', color: '#827d76', marginBottom: '10px', fontStyle: 'italic' }}>
                        💡 Upload warranty documents in your <a href="/dashboard/repository" style={{ color: '#1a5fa8', textDecoration: 'none' }}>Document Repository →</a>
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setOpenContact(null)} style={{ flex: 1, height: '34px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                      <button onClick={saveContact} disabled={savingContact} style={{ flex: 2, height: '34px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                        {savingContact ? 'Saving...' : 'Save contact'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 2: LEAD PROTECTION ── */}
        {tab === 'protection' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '16px', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: '#827d76', margin: 0 }}>{garments.length} item{garments.length !== 1 ? 's' : ''} on file</p>
                  <button onClick={() => setShowAddGarment(!showAddGarment)}
                    style={{ height: '36px', padding: '0 16px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                    + Add garment
                  </button>
                </div>

                {showAddGarment && (
                  <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '14px' }}>New protection garment</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      <select style={inp} value={garmentForm.garment_category} onChange={e => { const cat = e.target.value; setGarmentForm(p => ({ ...p, garment_category: cat, garment_type: cat === 'staff' ? 'Lead Apron' : 'Patient Lead Apron' })) }}>
                        <option value="staff">Staff protection</option>
                        <option value="patient">Patient protection</option>
                      </select>
                      <select style={inp} value={garmentForm.garment_type} onChange={e => setGarmentForm(p => ({ ...p, garment_type: e.target.value }))}>
                        {(garmentForm.garment_category === 'staff' ? STAFF_GARMENTS : PATIENT_GARMENTS).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input style={inp} placeholder="Size (S/M/L/XL)" value={garmentForm.size} onChange={e => setGarmentForm(p => ({ ...p, size: e.target.value }))} />
                        <select style={inp} value={garmentForm.condition} onChange={e => setGarmentForm(p => ({ ...p, condition: e.target.value }))}>
                          {['Excellent', 'Good', 'Fair', 'Poor — Replace'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <input style={inp} type="date" placeholder="Last inspection date" value={garmentForm.last_inspection_date} onChange={e => setGarmentForm(p => ({ ...p, last_inspection_date: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setShowAddGarment(false)} style={{ flex: 1, height: '36px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                      <button onClick={saveGarment} style={{ flex: 2, height: '36px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Save garment</button>
                    </div>
                  </div>
                )}

                {[{ label: 'Staff Protection', items: staffGarments }, { label: 'Patient Protection', items: patientGarments }].map(group => (
                  group.items.length > 0 && (
                    <div key={group.label} style={{ marginBottom: '20px' }}>
                      <p style={{ fontSize: '10px', fontWeight: '500', color: '#a8a39c', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '8px' }}>{group.label}</p>
                      {group.items.map(g => (
                        <div key={g.id} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', padding: '12px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '2px' }}>{g.garment_type || 'Lead Apron'}{g.size ? ` · ${g.size}` : ''}</p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {g.condition && <span style={{ fontSize: '11px', color: g.condition.includes('Poor') ? '#931621' : '#2d6a4f', background: g.condition.includes('Poor') ? '#fefafb' : '#edfaf3', border: `1px solid ${g.condition.includes('Poor') ? '#f5c6c9' : '#b8e8cc'}`, borderRadius: '20px', padding: '1px 8px' }}>{g.condition}</span>}
                              {g.last_inspection_date && <span style={{ fontSize: '11px', color: '#827d76' }}>Inspected: {new Date(g.last_inspection_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ))}

                {garments.length === 0 && (
                  <div style={{ background: '#fff', border: '1px dashed #c2ddf0', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>No garments added yet</p>
                    <p style={{ fontSize: '13px', color: '#a8a39c' }}>Track lead aprons, thyroid shields, and other protective equipment.</p>
                  </div>
                )}
              </div>

              {/* Single vendor contact card */}
              <div style={{ position: 'sticky', top: '20px' }}>
                <VendorCard
                  title="Protection Equipment Vendor"
                  vendor={apronVendor}
                  onSave={async (v) => {
                    await fetch('/api/apron-vendor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) })
                    fetchAll()
                  }}
                />
                <p style={{ fontSize: '11px', color: '#a8a39c', marginTop: '8px', textAlign: 'center', fontStyle: 'italic' }}>
                  Shared across all garments
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: DOSIMETRY MONITORING ── */}
        {tab === 'dosimetry' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '16px', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', color: '#827d76', margin: 0 }}>{badges.length} badge{badges.length !== 1 ? 's' : ''} on file</p>
                  <button onClick={() => setShowAddBadge(!showAddBadge)}
                    style={{ height: '36px', padding: '0 16px', background: '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                    + Add badge
                  </button>
                </div>

                {showAddBadge && (
                  <div style={{ background: '#fff', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '14px' }}>New dosimetry badge</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                      <input style={{ ...inp, gridColumn: 'span 2' }} placeholder="Staff member name *" value={badgeForm.assigned_to} onChange={e => setBadgeForm(p => ({ ...p, assigned_to: e.target.value }))} />
                      <input style={inp} placeholder="Manufacturer (e.g. Landauer)" value={badgeForm.manufacturer} onChange={e => setBadgeForm(p => ({ ...p, manufacturer: e.target.value }))} />
                      <input style={inp} placeholder="Model (e.g. inLight)" value={badgeForm.model_number} onChange={e => setBadgeForm(p => ({ ...p, model_number: e.target.value }))} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: '#4a6d8c' }}>Date issued</label>
                        <input style={inp} type="date" value={badgeForm.date_issued} onChange={e => setBadgeForm(p => ({ ...p, date_issued: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: '#4a6d8c' }}>Reporting date</label>
                        <input style={inp} type="date" value={badgeForm.reporting_date} onChange={e => setBadgeForm(p => ({ ...p, reporting_date: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setShowAddBadge(false)} style={{ flex: 1, height: '36px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                      <button onClick={saveBadge} disabled={!badgeForm.assigned_to} style={{ flex: 2, height: '36px', background: badgeForm.assigned_to ? '#0d2d5e' : '#c2ddf0', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Save badge</button>
                    </div>
                  </div>
                )}

                {badges.length === 0 ? (
                  <div style={{ background: '#fff', border: '1px dashed #c2ddf0', borderRadius: '12px', padding: '48px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>No dosimetry badges added yet</p>
                    <p style={{ fontSize: '13px', color: '#a8a39c' }}>Track personnel monitoring badges for all staff who operate x-ray equipment.</p>
                  </div>
                ) : (
                  <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#f4f7fb' }}>
                          {['Staff Member', 'Manufacturer', 'Model', 'Date Issued', 'Report Date', ''].map(h => (
                            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '10px', fontWeight: '500', color: '#827d76', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid #eef3fb' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {badges.map(b => (
                          <tr key={b.id} style={{ borderBottom: '1px solid #eef3fb' }}>
                            <td style={{ padding: '11px 14px', color: '#0d2d5e', fontWeight: '500' }}>{b.assigned_to}</td>
                            <td style={{ padding: '11px 14px', color: '#827d76' }}>{b.manufacturer || '—'}</td>
                            <td style={{ padding: '11px 14px', color: '#827d76' }}>{b.model_number || '—'}</td>
                            <td style={{ padding: '11px 14px', color: '#827d76' }}>{b.date_issued ? new Date(b.date_issued).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                            <td style={{ padding: '11px 14px', color: '#827d76' }}>{b.reporting_date ? new Date(b.reporting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                            <td style={{ padding: '11px 14px' }}>
                              <button onClick={() => deleteBadge(b.id)} style={{ fontSize: '11px', color: '#a8a39c', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Single dosimetry vendor card */}
              <div style={{ position: 'sticky', top: '20px' }}>
                <VendorCard
                  title="Dosimetry Vendor"
                  vendor={dosiVendor}
                  onSave={async (v) => {
                    await fetch('/api/dosimetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'save_vendor', ...v }) })
                    fetchAll()
                  }}
                />
                <p style={{ fontSize: '11px', color: '#a8a39c', marginTop: '8px', textAlign: 'center', fontStyle: 'italic' }}>
                  Shared across all badges
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}