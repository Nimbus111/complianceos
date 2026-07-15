'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const CONTACT_TYPES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  dealer:         { label: 'Dealer / Service provider',   color: '#1a5fa8', bg: '#e8f3fb',  border: '#c2ddf0' },
  manufacturer:   { label: 'Manufacturer tech support',   color: '#0d2d5e', bg: '#e8f3fb',  border: '#c2ddf0' },
  dr_plate:       { label: 'DR plate / Cassette',         color: '#2d6a4f', bg: '#edfaf3',  border: '#b8e8cc' },
  physics:        { label: 'Physics / Calibration',       color: '#4c1d95', bg: '#f5f3ff',  border: '#c4b5fd' },
  dicom_software: { label: 'DICOM acquisition software',  color: '#9a3510', bg: '#fff6e8',  border: '#f0d4a0' },
  workstation:    { label: 'Computer / Workstation',      color: '#827d76', bg: '#f4f7fb',  border: '#e8e6e2' },
  insurance:      { label: 'Equipment insurance',         color: '#931621', bg: '#fefafb',  border: '#f5c6c9' },
  it:             { label: 'Radiology IT',                color: '#1a5fa8', bg: '#e8f3fb',  border: '#c2ddf0' },
  teleradiology:  { label: 'Teleradiology / Reading',     color: '#2d6a4f', bg: '#edfaf3',  border: '#b8e8cc' },
  other:          { label: 'Other contact',               color: '#827d76', bg: '#f4f7fb',  border: '#e8e6e2' },
}

const PACS_TYPES: Record<string, string> = {
  pacs:           'PACS archive',
  cloud_archive:  'Cloud archive',
  dicom_worklist: 'DICOM worklist',
  teleradiology:  'Teleradiology server',
  other:          'Other system',
}

const inp: React.CSSProperties = {
  width: '100%', height: '36px', border: '1px solid #c2ddf0',
  borderRadius: '8px', padding: '0 10px', fontSize: '13px',
  color: '#0d2d5e', background: '#fff', outline: 'none', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: '10px', fontWeight: '500', color: '#a8a39c',
  marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.07em',
}

interface ContactFormValues {
  contactType: string; companyName: string; contactName: string
  phonePrimary: string; phoneSupport: string; email: string
  website: string; accountNumber: string; contractExpiry: string; notes: string
}

function ContactForm({ equipmentId, values, onChange, saving, onSave, onCancel }: {
  equipmentId: string | null
  values: ContactFormValues
  onChange: (field: keyof ContactFormValues, value: string) => void
  saving: boolean
  onSave: (equipmentId: string | null) => void
  onCancel: () => void
}) {
  return (
    <div style={{ background: '#fafcff', border: '1px solid #c2ddf0', borderRadius: '10px', padding: '16px', marginTop: '10px' }}>
      <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '12px' }}>Add service contact</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Contact type *</label>
          <select style={inp} value={values.contactType} onChange={e => onChange('contactType', e.target.value)}>
            <option value="">Select type...</option>
            {Object.entries(CONTACT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Company name</label><input style={inp} type="text" placeholder="e.g. Carestream Health" value={values.companyName} onChange={e => onChange('companyName', e.target.value)} /></div>
        <div><label style={lbl}>Contact name</label><input style={inp} type="text" placeholder="Rep or tech name" value={values.contactName} onChange={e => onChange('contactName', e.target.value)} /></div>
        <div><label style={lbl}>Primary phone</label><input style={inp} type="tel" placeholder="Main number" value={values.phonePrimary} onChange={e => onChange('phonePrimary', e.target.value)} /></div>
        <div><label style={lbl}>Support / emergency line</label><input style={inp} type="tel" placeholder="After-hours or tech support" value={values.phoneSupport} onChange={e => onChange('phoneSupport', e.target.value)} /></div>
        <div><label style={lbl}>Email</label><input style={inp} type="email" placeholder="support@company.com" value={values.email} onChange={e => onChange('email', e.target.value)} /></div>
        <div><label style={lbl}>Website</label><input style={inp} type="url" placeholder="https://..." value={values.website} onChange={e => onChange('website', e.target.value)} /></div>
        <div><label style={lbl}>Account / customer number</label><input style={inp} type="text" placeholder="Your account ID" value={values.accountNumber} onChange={e => onChange('accountNumber', e.target.value)} /></div>
        <div><label style={lbl}>Contract / warranty expiry</label><input style={inp} type="date" value={values.contractExpiry} onChange={e => onChange('contractExpiry', e.target.value)} /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Notes</label><input style={inp} type="text" placeholder="Any additional notes" value={values.notes} onChange={e => onChange('notes', e.target.value)} /></div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onCancel} style={{ flex: 1, height: '34px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
        <button onClick={() => onSave(equipmentId)} disabled={!values.contactType || saving}
          style={{ flex: 2, height: '34px', background: !values.contactType ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: !values.contactType ? 'default' : 'pointer' }}>
          {saving ? 'Saving...' : 'Add contact'}
        </button>
      </div>
    </div>
  )
}

function ContactCard({ contact, onDelete, onCopy }: {
  contact: any
  onDelete: (id: string) => void
  onCopy: (text: string) => void
}) {
  const ct = CONTACT_TYPES[contact.contact_type] || CONTACT_TYPES.other
  const today = new Date()
  const expiry = contact.contract_expiry ? new Date(contact.contract_expiry) : null
  const isExpired = expiry && expiry < today
  const isExpiring = expiry && !isExpired && expiry < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  return (
    <div style={{ background: '#fff', border: `1px solid ${ct.border}`, borderRadius: '10px', padding: '14px 16px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: '500', color: ct.color, background: ct.bg, border: `1px solid ${ct.border}`, borderRadius: '20px', padding: '2px 8px' }}>{ct.label}</span>
          {contact.company_name && <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginTop: '6px', marginBottom: '2px' }}>{contact.company_name}</p>}
          {contact.contact_name && <p style={{ fontSize: '12px', color: '#827d76' }}>{contact.contact_name}</p>}
        </div>
        <button onClick={() => onDelete(contact.id)} style={{ padding: '3px 10px', border: '1px solid #f5c6c9', borderRadius: '6px', background: '#fff', color: '#931621', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}>Delete</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {contact.phone_primary && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#a8a39c' }}>Primary phone</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <a href={`tel:${contact.phone_primary}`} style={{ fontSize: '13px', fontWeight: '500', color: '#1a5fa8', textDecoration: 'none' }}>{contact.phone_primary}</a>
              <button onClick={() => onCopy(contact.phone_primary)} style={{ padding: '1px 8px', border: '1px solid #c2ddf0', borderRadius: '4px', background: '#fff', color: '#1a5fa8', fontSize: '10px', cursor: 'pointer' }}>Copy</button>
            </div>
          </div>
        )}
        {contact.phone_support && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#a8a39c' }}>Support / emergency</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <a href={`tel:${contact.phone_support}`} style={{ fontSize: '13px', fontWeight: '500', color: '#c44a1a', textDecoration: 'none' }}>{contact.phone_support}</a>
              <button onClick={() => onCopy(contact.phone_support)} style={{ padding: '1px 8px', border: '1px solid #f0d4a0', borderRadius: '4px', background: '#fff', color: '#c44a1a', fontSize: '10px', cursor: 'pointer' }}>Copy</button>
            </div>
          </div>
        )}
        {contact.email && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#a8a39c' }}>Email</span>
            <a href={`mailto:${contact.email}`} style={{ fontSize: '12px', color: '#1a5fa8', textDecoration: 'none' }}>{contact.email}</a>
          </div>
        )}
        {contact.website && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#a8a39c' }}>Website</span>
            <a href={contact.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#1a5fa8', textDecoration: 'none' }}>{contact.website.replace(/^https?:\/\//, '')}</a>
          </div>
        )}
        {contact.account_number && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#a8a39c' }}>Account #</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e' }}>{contact.account_number}</span>
              <button onClick={() => onCopy(contact.account_number)} style={{ padding: '1px 8px', border: '1px solid #c2ddf0', borderRadius: '4px', background: '#fff', color: '#1a5fa8', fontSize: '10px', cursor: 'pointer' }}>Copy</button>
            </div>
          </div>
        )}
        {expiry && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#a8a39c' }}>Contract / warranty expires</span>
            <span style={{ fontSize: '12px', fontWeight: '500', color: isExpired ? '#931621' : isExpiring ? '#c44a1a' : '#40916c' }}>
              {expiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {isExpired ? ' — Expired' : isExpiring ? ' — Expiring soon' : ''}
            </span>
          </div>
        )}
        {contact.notes && <p style={{ fontSize: '12px', color: '#827d76', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #eef3fb' }}>{contact.notes}</p>}
      </div>
    </div>
  )
}

const EMPTY_CONTACT_FORM: ContactFormValues = {
  contactType: '', companyName: '', contactName: '',
  phonePrimary: '', phoneSupport: '', email: '',
  website: '', accountNumber: '', contractExpiry: '', notes: '',
}

export default function SystemsPage() {
  const [equipment, setEquipment] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [pacsSystems, setPacsSystems] = useState<any[]>([])
  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(true)
  const [showContactForm, setShowContactForm] = useState<string | null>(null)
  const [showPacsForm, setShowPacsForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const [contactForm, setContactForm] = useState<ContactFormValues>(EMPTY_CONTACT_FORM)
  const handleContactChange = (field: keyof ContactFormValues, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }))
  }

  const [pacsNickname, setPacsNickname] = useState('')
  const [pacsType, setPacsType] = useState('pacs')
  const [pacsUrl, setPacsUrl] = useState('')
  const [pacsPort, setPacsPort] = useState('')
  const [pacsAeTitle, setPacsAeTitle] = useState('')
  const [pacsUsername, setPacsUsername] = useState('')
  const [pacsNotes, setPacsNotes] = useState('')

  const fetchAll = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()
    if (!profile?.org_id) { router.push('/onboarding'); return }
    const { data: org } = await supabase.from('organizations').select('name').eq('id', profile.org_id).single()
    if (org) setOrgName(org.name)
    const { data: eq } = await supabase.from('equipment').select('*').eq('org_id', profile.org_id).neq('status', 'retired').order('created_at')
    setEquipment(eq || [])
    const { data: ctcts } = await supabase.from('equipment_contacts').select('*').eq('org_id', profile.org_id).order('created_at')
    setContacts(ctcts || [])
    const { data: pacs } = await supabase.from('pacs_systems').select('*').eq('org_id', profile.org_id).order('created_at')
    setPacsSystems(pacs || [])
    setLoading(false)
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  const resetContact = () => { setContactForm(EMPTY_CONTACT_FORM); setShowContactForm(null) }
  const resetPacs = () => { setPacsNickname(''); setPacsType('pacs'); setPacsUrl(''); setPacsPort(''); setPacsAeTitle(''); setPacsUsername(''); setPacsNotes(''); setShowPacsForm(false) }

  const handleAddContact = async (equipmentId: string | null) => {
    if (!contactForm.contactType) return
    setSaving(true)
    const res = await fetch('/api/systems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource_type: 'contact',
        equipment_id: equipmentId,
        contact_type: contactForm.contactType,
        company_name: contactForm.companyName,
        contact_name: contactForm.contactName,
        phone_primary: contactForm.phonePrimary,
        phone_support: contactForm.phoneSupport,
        email: contactForm.email,
        website: contactForm.website,
        account_number: contactForm.accountNumber,
        contract_expiry: contactForm.contractExpiry,
        notes: contactForm.notes,
      })
    })
    if (res.ok) { resetContact(); fetchAll() }
    else { const r = await res.json(); alert(r.error || 'Error') }
    setSaving(false)
  }

  const handleAddPacs = async () => {
    if (!pacsNickname) return
    setSaving(true)
    const res = await fetch('/api/systems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource_type: 'pacs', nickname: pacsNickname, system_type: pacsType, url: pacsUrl, port: pacsPort, ae_title: pacsAeTitle, username: pacsUsername, notes: pacsNotes })
    })
    if (res.ok) { resetPacs(); fetchAll() }
    else { const r = await res.json(); alert(r.error || 'Error') }
    setSaving(false)
  }

  const handleDelete = async (id: string, resourceType: string) => {
    if (!confirm('Delete this? Cannot be undone.')) return
    await fetch('/api/systems', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, resource_type: resourceType }) })
    fetchAll()
  }

  const copy = (text: string) => navigator.clipboard.writeText(text).catch(() => {})
  const facilityContacts = contacts.filter(c => !c.equipment_id)

  if (loading) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#a8a39c', fontSize: '13px' }}>Loading systems...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '500' }}>The Radiology Coach</span>
          <span style={{ background: 'rgba(255,255,255,0.1)', color: '#8bb4d4', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: '500', marginLeft: '10px' }}>ComplianceOS</span>
        </div>
        <a href="/dashboard" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>Equipment &amp; Systems</h1>
          <p style={{ fontSize: '13px', color: '#827d76' }}>{orgName} · Service contacts, warranties, PACS configuration, and support information</p>
        </div>

        {equipment.length > 0 && (
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Equipment service contacts</span>
              <div style={{ flex: 1, height: '1px', background: '#c2ddf0' }} />
            </div>
            <p style={{ fontSize: '12px', color: '#a8a39c', marginBottom: '16px', lineHeight: '1.6' }}>
              Add service contacts for each piece of equipment — dealer, manufacturer tech support, DR plate vendor, DICOM software, physics company, computer support, and insurance.
            </p>
            {equipment.map(eq => {
              const eqContacts = contacts.filter(c => c.equipment_id === eq.id)
              const isOpen = showContactForm === eq.id

               const primaryContact =
    eqContacts.find(c => c.contact_type === 'dealer') ||
    eqContacts.find(c => c.contact_type === 'manufacturer') ||
    eqContacts[0]
  const emergencyPhone = primaryContact?.phone_support || primaryContact?.phone_primary
              return (
                <div key={eq.id} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '16px 20px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: (eqContacts.length > 0 || isOpen) ? '14px' : '0' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '2px' }}>
  <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>{eq.manufacturer} {eq.model}</p>
  {emergencyPhone && (
    <a href={`tel:${emergencyPhone}`}
      style={{ fontSize: '11px', fontWeight: '500', color: '#c44a1a', textDecoration: 'none', background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '20px', padding: '2px 10px', whiteSpace: 'nowrap' }}>
      📞 {emergencyPhone}
    </a>
  )}
</div>
                      <p style={{ fontSize: '12px', color: '#a8a39c' }}>
                        {[eq.serial_number && `S/N: ${eq.serial_number}`, eq.room_location].filter(Boolean).join(' · ')}
                        {eqContacts.length > 0 && ` · ${eqContacts.length} contact${eqContacts.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <button onClick={() => { setShowContactForm(isOpen ? null : eq.id); if (!isOpen) setContactForm(EMPTY_CONTACT_FORM) }}
                      style={{ height: '32px', padding: '0 14px', background: isOpen ? '#fff' : '#0d2d5e', color: isOpen ? '#0d2d5e' : '#fff', border: `1px solid ${isOpen ? '#c2ddf0' : '#0d2d5e'}`, borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                      {isOpen ? 'Cancel' : '+ Add contact'}
                    </button>
                  </div>
                  {eqContacts.map(c => <ContactCard key={c.id} contact={c} onDelete={id => handleDelete(id, 'contact')} onCopy={copy} />)}
                  {isOpen && <ContactForm equipmentId={eq.id} values={contactForm} onChange={handleContactChange} saving={saving} onSave={handleAddContact} onCancel={resetContact} />}
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Facility-wide contacts</span>
              <div style={{ flex: 1, height: '1px', background: '#c2ddf0' }} />
            </div>
            <button onClick={() => { const opening = showContactForm !== 'facility'; setShowContactForm(opening ? 'facility' : null); if (opening) setContactForm(EMPTY_CONTACT_FORM) }}
              style={{ height: '32px', padding: '0 14px', marginLeft: '12px', background: showContactForm === 'facility' ? '#fff' : '#0d2d5e', color: showContactForm === 'facility' ? '#0d2d5e' : '#fff', border: `1px solid ${showContactForm === 'facility' ? '#c2ddf0' : '#0d2d5e'}`, borderRadius: '8px', fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}>
              {showContactForm === 'facility' ? 'Cancel' : '+ Add contact'}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#a8a39c', marginBottom: '14px', lineHeight: '1.6' }}>
            Physics company, radiology IT, insurance provider, teleradiology service, and any contacts that apply to the whole facility rather than a specific machine.
          </p>
          {facilityContacts.length === 0 && showContactForm !== 'facility' && (
            <div style={{ background: '#fff', border: '1px dashed #c2ddf0', borderRadius: '10px', padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#827d76' }}>Add your physics company, IT contact, equipment insurance, and other facility-wide service partners.</p>
            </div>
          )}
          {facilityContacts.map(c => <ContactCard key={c.id} contact={c} onDelete={id => handleDelete(id, 'contact')} onCopy={copy} />)}
          {showContactForm === 'facility' && <ContactForm equipmentId={null} values={contactForm} onChange={handleContactChange} saving={saving} onSave={handleAddContact} onCancel={resetContact} />}
        </div>

        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#0d2d5e', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>PACS &amp; network systems</span>
              <div style={{ flex: 1, height: '1px', background: '#c2ddf0' }} />
            </div>
            <button onClick={() => setShowPacsForm(!showPacsForm)}
              style={{ height: '32px', padding: '0 14px', marginLeft: '12px', background: showPacsForm ? '#fff' : '#0d2d5e', color: showPacsForm ? '#0d2d5e' : '#fff', border: `1px solid ${showPacsForm ? '#c2ddf0' : '#0d2d5e'}`, borderRadius: '8px', fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}>
              {showPacsForm ? 'Cancel' : '+ Add system'}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#a8a39c', marginBottom: '14px', lineHeight: '1.6' }}>
            Archive servers, PACS systems, DICOM worklists, and cloud storage. Store connection details — URL, port, AE Title — for quick access during IT setup or troubleshooting.
          </p>

          {showPacsForm && (
            <div style={{ background: '#fafcff', border: '1px solid #c2ddf0', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '12px' }}>Add PACS / network system</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div><label style={lbl}>Nickname *</label><input style={inp} type="text" placeholder="e.g. Main PACS archive" value={pacsNickname} onChange={e => setPacsNickname(e.target.value)} /></div>
                <div><label style={lbl}>System type</label>
                  <select style={inp} value={pacsType} onChange={e => setPacsType(e.target.value)}>
                    {Object.entries(PACS_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>URL / Hostname</label><input style={inp} type="text" placeholder="pacs.clinic.com or 192.168.x.x" value={pacsUrl} onChange={e => setPacsUrl(e.target.value)} /></div>
                <div><label style={lbl}>Port</label><input style={inp} type="text" placeholder="e.g. 104 or 11112" value={pacsPort} onChange={e => setPacsPort(e.target.value)} /></div>
                <div><label style={lbl}>AE Title</label><input style={inp} type="text" placeholder="e.g. PACS_MAIN" value={pacsAeTitle} onChange={e => setPacsAeTitle(e.target.value)} /></div>
                <div><label style={lbl}>Username / Login</label><input style={inp} type="text" placeholder="System username" value={pacsUsername} onChange={e => setPacsUsername(e.target.value)} /></div>
                <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Notes</label><input style={inp} type="text" placeholder="Any additional notes" value={pacsNotes} onChange={e => setPacsNotes(e.target.value)} /></div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={resetPacs} style={{ flex: 1, height: '34px', background: '#fff', color: '#0d2d5e', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleAddPacs} disabled={!pacsNickname || saving}
                  style={{ flex: 2, height: '34px', background: !pacsNickname ? '#c2ddf0' : '#0d2d5e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: !pacsNickname ? 'default' : 'pointer' }}>
                  {saving ? 'Saving...' : 'Add system'}
                </button>
              </div>
            </div>
          )}

          {pacsSystems.length === 0 && !showPacsForm && (
            <div style={{ background: '#fff', border: '1px dashed #c2ddf0', borderRadius: '10px', padding: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#827d76' }}>No PACS or network systems configured. Add your archive server, cloud PACS, or DICOM worklist connection details.</p>
            </div>
          )}

          {pacsSystems.map((pacs: any) => (
            <div key={pacs.id} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', padding: '14px 16px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>{pacs.nickname}</p>
                  <span style={{ fontSize: '10px', fontWeight: '500', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '1px 8px' }}>
                    {PACS_TYPES[pacs.system_type] || pacs.system_type}
                  </span>
                </div>
                <button onClick={() => handleDelete(pacs.id, 'pacs')} style={{ padding: '3px 10px', border: '1px solid #f5c6c9', borderRadius: '6px', background: '#fff', color: '#931621', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
              </div>
              <div style={{ background: '#f4f7fb', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { label: 'URL / Hostname', value: pacs.url },
                  { label: 'Port', value: pacs.port },
                  { label: 'AE Title', value: pacs.ae_title },
                  { label: 'Username', value: pacs.username },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#827d76' }}>{row.label}</span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e', fontFamily: 'monospace' }}>{row.value}</span>
                      <button onClick={() => copy(row.value!)} style={{ padding: '1px 8px', border: '1px solid #c2ddf0', borderRadius: '4px', background: '#fff', color: '#1a5fa8', fontSize: '10px', cursor: 'pointer' }}>Copy</button>
                    </div>
                  </div>
                ))}
              </div>
              {pacs.notes && <p style={{ fontSize: '12px', color: '#827d76', marginTop: '8px' }}>{pacs.notes}</p>}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}