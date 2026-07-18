'use client'

export default function Footer() {
  const links = [
    { label: 'Website', href: 'https://www.theradiologycoach.com' },
    { label: 'YouTube', href: 'https://www.youtube.com/c/TheRadiologyCoach' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/greg-turner-1396868/' },
    { label: 'Instagram', href: 'https://www.instagram.com/theradiologycoach' },
    { label: 'Facebook', href: 'https://www.facebook.com/gturnerconsultants' },
  ]
  return (
    <footer style={{ background: '#0d2d5e', padding: '20px 32px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: '500', margin: '0 0 2px' }}>The Radiology Coach · ComplianceOS</p>
          <p style={{ color: '#8bb4d4', fontSize: '11px', margin: 0 }}>© 2026 · X-ray compliance made manageable</p>
        </div>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          {links.map(l => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
              style={{ color: '#8bb4d4', fontSize: '12px', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8bb4d4')}>
              {l.label}
            </a>
          ))}
          <a href="/about" style={{ color: '#8bb4d4', fontSize: '12px', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#8bb4d4')}>
            About
          </a>
        </div>
      </div>
    </footer>
  )
}