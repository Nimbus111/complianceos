import Link from 'next/link'

export default function GetStartedPage() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>
      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <p style={{ color: '#fff', fontSize: '14px', fontWeight: '500', margin: 0 }}>X-ray Compliance Hub</p>
          <p style={{ color: '#8bb4d4', fontSize: '11px', margin: 0 }}>Powered by The Radiology Coach</p>
        </div>
        <Link href="/login" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>Already have an account? Sign in</Link>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: '500', color: '#1a5fa8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          Create your account
        </p>
        <h1 style={{ fontSize: '32px', fontWeight: '500', color: '#0d2d5e', marginBottom: '12px', lineHeight: '1.2' }}>
          Which best describes you?
        </h1>
        <p style={{ fontSize: '15px', color: '#4a6d8c', marginBottom: '48px', lineHeight: '1.6' }}>
          Choose your account type to get started with the right setup for your needs.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>

          <Link href="/signup?type=facility" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: '2px solid #c2ddf0', borderRadius: '16px', padding: '32px 24px', textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#0d2d5e')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#c2ddf0')}>
              <div style={{ width: '48px', height: '48px', background: '#e8f3fb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '24px' }}>
                🏥
              </div>
              <p style={{ fontSize: '18px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>
                I&apos;m a Medical Facility
              </p>
              <p style={{ fontSize: '13px', color: '#4a6d8c', lineHeight: '1.65', marginBottom: '16px' }}>
                Dental office, podiatry clinic, chiropractic office, imaging center, or any facility that operates x-ray equipment and needs to stay compliant.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['Dental', 'Podiatry', 'Chiropractic', 'Imaging', 'Urgent Care'].map(tag => (
                  <span key={tag} style={{ fontSize: '11px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '2px 8px' }}>{tag}</span>
                ))}
              </div>
              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e' }}>$49 / month</span>
                <span style={{ fontSize: '12px', color: '#40916c', fontWeight: '500' }}>14-day free trial</span>
              </div>
            </div>
          </Link>

          <Link href="/signup?type=service_provider" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: '2px solid #b8e8cc', borderRadius: '16px', padding: '32px 24px', textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#2d6a4f')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#b8e8cc')}>
              <div style={{ width: '48px', height: '48px', background: '#edfaf3', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '24px' }}>
                🔧
              </div>
              <p style={{ fontSize: '18px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>
                I&apos;m a Dealer / Service Provider
              </p>
              <p style={{ fontSize: '13px', color: '#4a6d8c', lineHeight: '1.65', marginBottom: '16px' }}>
                X-ray equipment dealer, service technician, biomedical engineer, or medical imaging company that installs and services equipment at multiple facilities.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['Equipment Dealer', 'Service Tech', 'Biomedical', 'Distributor'].map(tag => (
                  <span key={tag} style={{ fontSize: '11px', color: '#2d6a4f', background: '#edfaf3', border: '1px solid #b8e8cc', borderRadius: '20px', padding: '2px 8px' }}>{tag}</span>
                ))}
              </div>
              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e' }}>$149 / month</span>
                <span style={{ fontSize: '12px', color: '#40916c', fontWeight: '500' }}>14-day free trial</span>
              </div>
            </div>
          </Link>

        </div>

        <p style={{ fontSize: '12px', color: '#a8a39c', lineHeight: '1.6' }}>
          Not sure? <Link href="/" style={{ color: '#1a5fa8', textDecoration: 'none' }}>Search compliance requirements free</Link> — no account needed.
        </p>
      </div>
    </div>
  )
}