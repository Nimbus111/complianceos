export default function PartnersPage() {
  const partners = [
    {
      category: 'Image Storage & PACS',
      name: 'Your PACS Partner',
      description: 'HIPAA-compliant cloud image storage on a pay-as-you-send basis. No setup fees, no monthly minimums. Your x-ray images stored securely and accessible from anywhere.',
      why: 'HIPAA requires x-ray images to be stored on HIPAA-compliant infrastructure — not home computers or unencrypted drives. Federal guidelines recommend cloud or network-based DICOM storage as a redundancy standard.',
      cta: 'Learn more',
      href: 'https://www.theradiologycoach.com',
      note: 'Note: Your x-ray dealer may also offer PACS solutions. Check with them first.',
      color: '#c2ddf0',
      badge: 'HIPAA Compliance',
    },
    {
      category: 'Radiology Reading Services',
      name: 'Rapid Radiology',
      description: 'Professional radiology interpretation services for clinics that need qualified radiologist reads on-demand. Fast turnaround, competitive pricing, and HIPAA-compliant reporting.',
      why: 'Many states and federal guidelines require a qualified interpreter for diagnostic x-ray reads. Rapid Radiology provides board-certified radiologist reads for podiatry, chiropractic, dental, and general imaging facilities.',
      cta: 'Visit Rapid Radiology',
      href: 'https://www.rapidradiology.com',
      note: null,
      color: '#b8e8cc',
      badge: 'Qualified Interpreter',
    },
    {
      category: 'Radiation Protection Equipment',
      name: 'Lead Apron Supplier',
      description: 'Certified radiation protection equipment including lead aprons, thyroid shields, and gonadal shields. Compliant with state inspection requirements and available in a range of sizes and styles.',
      why: 'Lead aprons are required by regulation in nearly every state for x-ray procedures. Annual inspection is mandatory. Using a certified supplier ensures your equipment meets state and federal radiation protection standards.',
      cta: 'Shop protection equipment',
      href: 'https://www.theradiologycoach.com',
      note: null,
      color: '#c4b5fd',
      badge: 'Required Equipment',
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
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>Preferred Partners</h1>
          <p style={{ fontSize: '13px', color: '#827d76', lineHeight: '1.65', maxWidth: '560px' }}>
            The Radiology Coach has vetted these partners for quality, compliance relevance, and value to x-ray facilities. Each partnership supports a specific area of your regulatory obligations.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {partners.map(p => (
            <div key={p.name} style={{ background: '#fff', border: `1px solid ${p.color}`, borderLeft: `4px solid ${p.color}`, borderRadius: '12px', padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: '500', color: '#a8a39c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '4px' }}>{p.category}</p>
                  <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>{p.name}</h2>
                  <span style={{ fontSize: '10px', fontWeight: '500', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '2px 8px' }}>{p.badge}</span>
                </div>
                <a href={p.href} target="_blank" rel="noopener noreferrer"
                  style={{ height: '36px', padding: '0 18px', background: '#0d2d5e', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                  {p.cta} →
                </a>
              </div>
              <p style={{ fontSize: '14px', color: '#1e1c1a', lineHeight: '1.7', marginBottom: '10px' }}>{p.description}</p>
              <div style={{ background: '#f4f7fb', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#4a6d8c', lineHeight: '1.65' }}>
                <strong>Why it matters for compliance:</strong> {p.why}
              </div>
              {p.note && (
                <p style={{ fontSize: '11px', color: '#a8a39c', marginTop: '10px', fontStyle: 'italic' }}>{p.note}</p>
              )}
            </div>
          ))}
        </div>

        <div style={{ background: '#0d2d5e', borderRadius: '12px', padding: '20px 24px', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: '#fff', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Are you a vendor or service provider?</p>
            <p style={{ color: '#8bb4d4', fontSize: '12px', margin: 0 }}>If you offer a product or service relevant to x-ray compliance, contact us about becoming a preferred partner.</p>
          </div>
          <a href="mailto:hello@theradiologycoach.com" style={{ height: '36px', padding: '0 18px', background: '#fff', color: '#0d2d5e', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
            Get in touch
          </a>
        </div>
      </div>
    </div>
  )
}