import Link from 'next/link'

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>

      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <p style={{ color: '#fff', fontSize: '14px', fontWeight: '500', margin: 0 }}>X-ray Compliance Hub</p>
          <p style={{ color: '#8bb4d4', fontSize: '11px', margin: 0 }}>Powered by The Radiology Coach</p>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>Search</Link>
          <Link href="/pricing" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/login" style={{ color: '#fff', fontSize: '13px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', padding: '6px 16px', borderRadius: '8px' }}>Sign in</Link>
          <Link href="/get-started" style={{ background: '#1a72e8', color: '#fff', fontSize: '13px', fontWeight: '500', padding: '7px 18px', borderRadius: '8px', textDecoration: 'none' }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: '#0d2d5e', padding: '64px 32px 56px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <span style={{ fontSize: '11px', fontWeight: '500', color: '#8bb4d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>About</span>
          <h1 style={{ fontSize: '38px', fontWeight: '500', color: '#fff', lineHeight: '1.2', marginTop: '10px', marginBottom: '16px', maxWidth: '560px' }}>
            Filling the gap in x-ray compliance
          </h1>
          <p style={{ fontSize: '16px', color: '#8bb4d4', lineHeight: '1.7', maxWidth: '580px', margin: 0 }}>
            The Radiology Coach Compliance Hub was designed to fill a gap between x-ray end-users, state radiation control agencies, and x-ray service providers.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 32px' }}>

        {/* The problem */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#1a5fa8', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>The problem</span>
            <div style={{ flex: 1, height: '1px', background: '#c2ddf0' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>🏥</div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>Clinics are caught off guard</p>
              <p style={{ fontSize: '13px', color: '#4a6d8c', lineHeight: '1.7', margin: 0 }}>
                Many clinics first learn about state radiation compliance requirements when a state inspector arrives — sometimes resulting in citations, violations, and fines.
              </p>
            </div>
            <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '24px' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>📋</div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>Requirements are complex</p>
              <p style={{ fontSize: '13px', color: '#4a6d8c', lineHeight: '1.7', margin: 0 }}>
                States have implemented policies requiring diligent implementations to protect patients, animals, and x-ray staff from unnecessary radiation exposure. Keeping up is a challenge.
              </p>
            </div>
          </div>
          <div style={{ background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '12px', padding: '20px 24px', marginTop: '16px' }}>
            <p style={{ fontSize: '14px', color: '#0d2d5e', lineHeight: '1.75', margin: 0 }}>
              No one in particular is to blame in these circumstances. It is simply a gap that must be filled — and <strong>The Radiology Coach has done just that</strong> with the Compliance Hub.
            </p>
          </div>
        </div>

        {/* The solution */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#1a5fa8', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>The solution</span>
            <div style={{ flex: 1, height: '1px', background: '#c2ddf0' }} />
          </div>
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '28px' }}>
            <p style={{ fontSize: '15px', color: '#1e1c1a', lineHeight: '1.8', marginBottom: '20px' }}>
              This application enables x-ray end-users to fully understand, manage, and maintain their regulatory compliance obligations. While this does not guarantee clinics from incurring violations, it significantly improves their ability to avoid them.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { emoji: '🔍', label: 'Understand', desc: 'Search your state\'s exact requirements by facility type and modality' },
                { emoji: '📁', label: 'Manage', desc: 'Store registrations, documents, equipment, and RSP in one place' },
                { emoji: '✅', label: 'Maintain', desc: 'Calendar reminders, checklist tracking, and inspection-ready reporting' },
              ].map(item => (
                <div key={item.label} style={{ background: '#f4f7fb', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.emoji}</div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ fontSize: '12px', color: '#827d76', lineHeight: '1.55' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* About Greg */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#1a5fa8', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>The author</span>
            <div style={{ flex: 1, height: '1px', background: '#c2ddf0' }} />
          </div>
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '28px', display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
            {process.env.NEXT_PUBLIC_INSTRUCTOR_PHOTO && (
              <img
                src={process.env.NEXT_PUBLIC_INSTRUCTOR_PHOTO}
                alt="Gregory Turner"
                style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: '3px solid #c2ddf0', flexShrink: 0 }}
              />
            )}
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>Gregory Turner</h2>
              <p style={{ fontSize: '13px', color: '#1a5fa8', fontWeight: '500', marginBottom: '16px' }}>The Radiology Coach · Radiology Compliance Specialist</p>
              <p style={{ fontSize: '14px', color: '#1e1c1a', lineHeight: '1.8', marginBottom: '12px' }}>
                Mr. Turner graduated from Emory University in Atlanta, Georgia with degrees in medical imaging and education. He has been in the radiology industry for over 35 years, serving as a hospital and corporate radiology manager and eventually migrating into sales and consulting.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Emory University', '35+ Years Experience', 'Medical Imaging', 'Hospital Management', 'Radiology Consulting'].map(tag => (
                  <span key={tag} style={{ fontSize: '11px', color: '#1a5fa8', background: '#e8f3fb', border: '1px solid #c2ddf0', borderRadius: '20px', padding: '3px 10px' }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#1a5fa8', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Our mission</span>
            <div style={{ flex: 1, height: '1px', background: '#c2ddf0' }} />
          </div>
          <div style={{ background: '#0d2d5e', borderRadius: '12px', padding: '28px 32px' }}>
            <p style={{ fontSize: '16px', color: '#fff', lineHeight: '1.8', marginBottom: '16px', fontStyle: 'italic' }}>
              &ldquo;To partner with hospitals, clinics, chiropractors, podiatrists, and veterinary offices to provide a seamless x-ray management experience by organizing and tracking state mandates in radiation safety.&rdquo;
            </p>
            <p style={{ fontSize: '13px', color: '#8bb4d4', margin: 0 }}>— Gregory Turner, The Radiology Coach</p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '500', color: '#0d2d5e', marginBottom: '8px' }}>Ready to close the compliance gap?</h3>
          <p style={{ fontSize: '14px', color: '#4a6d8c', lineHeight: '1.65', maxWidth: '440px', margin: '0 auto 24px' }}>
            Search your state&apos;s x-ray compliance requirements free — no account needed. Create a Professional account to manage your full compliance program.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ background: '#0d2d5e', color: '#fff', fontSize: '13px', fontWeight: '500', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none' }}>
              Search compliance requirements
            </Link>
            <Link href="/get-started" style={{ background: '#fff', color: '#0d2d5e', fontSize: '13px', fontWeight: '500', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', border: '1px solid #c2ddf0' }}>
              Create free account
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}