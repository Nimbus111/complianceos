import Link from 'next/link'

const CHECK = () => (
  <span style={{ color: '#40916c', fontSize: '16px' }}>✓</span>
)
const CROSS = () => (
  <span style={{ color: '#c2ddf0', fontSize: '14px' }}>—</span>
)

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '#f0f4f8' }}>

      <nav style={{ background: '#0d2d5e', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <p style={{ color: '#fff', fontSize: '14px', fontWeight: '500', margin: 0 }}>X-ray Compliance Hub</p>
          <p style={{ color: '#8bb4d4', fontSize: '11px', margin: 0 }}>Powered by The Radiology Coach</p>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>Search</Link>
          <Link href="/about" style={{ color: '#8bb4d4', fontSize: '13px', textDecoration: 'none' }}>About</Link>
          <Link href="/login" style={{ color: '#fff', fontSize: '13px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', padding: '6px 16px', borderRadius: '8px' }}>Sign in</Link>
          <Link href="/get-started" style={{ background: '#1a72e8', color: '#fff', fontSize: '13px', fontWeight: '500', padding: '7px 18px', borderRadius: '8px', textDecoration: 'none' }}>Get started</Link>
        </div>
      </nav>

      {/* Header */}
      <div style={{ background: '#0d2d5e', padding: '56px 32px 48px', textAlign: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: '500', color: '#8bb4d4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pricing</span>
        <h1 style={{ fontSize: '36px', fontWeight: '500', color: '#fff', lineHeight: '1.2', marginTop: '10px', marginBottom: '12px' }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: '15px', color: '#8bb4d4', lineHeight: '1.65', maxWidth: '480px', margin: '0 auto' }}>
          Search compliance requirements free, forever. Upgrade when you&apos;re ready for the full toolkit.
        </p>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Pricing cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '48px' }}>

          {/* Free */}
          <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#a8a39c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Free</p>
            <p style={{ fontSize: '32px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px' }}>$0</p>
            <p style={{ fontSize: '12px', color: '#a8a39c', marginBottom: '16px' }}>No account needed</p>
            <p style={{ fontSize: '13px', color: '#4a6d8c', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
              Search x-ray compliance requirements for all 50 states — free, always. No signup required.
            </p>
            <Link href="/" style={{ display: 'block', textAlign: 'center', padding: '9px', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', fontWeight: '500', color: '#0d2d5e', textDecoration: 'none' }}>
              Start searching
            </Link>
          </div>

          {/* Professional */}
          <div style={{ background: '#0d2d5e', border: '2px solid #0d2d5e', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#1a72e8', color: '#fff', fontSize: '10px', fontWeight: '500', padding: '3px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
              Most popular
            </div>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#8bb4d4', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Professional</p>
            <p style={{ fontSize: '32px', fontWeight: '500', color: '#fff', marginBottom: '2px' }}>$49</p>
            <p style={{ fontSize: '12px', color: '#8bb4d4', marginBottom: '6px' }}>per month · Medical Facility</p>
            <p style={{ fontSize: '11px', color: '#40916c', fontWeight: '500', marginBottom: '16px' }}>14-day free trial</p>
            <p style={{ fontSize: '13px', color: '#8bb4d4', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
              Full compliance toolkit for facilities with 1–3 x-ray machines. One location.
            </p>
            <Link href="/get-started?type=facility" style={{ display: 'block', textAlign: 'center', padding: '9px', background: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: '500', color: '#0d2d5e', textDecoration: 'none' }}>
              Start free trial
            </Link>
          </div>

          {/* Service Provider */}
          <div style={{ background: '#fff', border: '2px solid #b8e8cc', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Dealer / Service Provider</p>
            <p style={{ fontSize: '32px', fontWeight: '500', color: '#0d2d5e', marginBottom: '2px' }}>$149</p>
            <p style={{ fontSize: '12px', color: '#a8a39c', marginBottom: '6px' }}>per month</p>
            <p style={{ fontSize: '11px', color: '#40916c', fontWeight: '500', marginBottom: '16px' }}>14-day free trial</p>
            <p style={{ fontSize: '13px', color: '#4a6d8c', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
              Book of business tools for x-ray dealers, service techs, physicists, and referral partners. Earn 60% commission on referred facilities.
            </p>
            <Link href="/get-started?type=service_provider" style={{ display: 'block', textAlign: 'center', padding: '9px', background: '#2d6a4f', borderRadius: '8px', fontSize: '13px', fontWeight: '500', color: '#fff', textDecoration: 'none' }}>
              Start free trial
            </Link>
          </div>

          {/* Enterprise */}
          <div style={{ background: '#fff', border: '1px dashed #c2ddf0', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#a8a39c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Enterprise</p>
            <p style={{ fontSize: '32px', fontWeight: '500', color: '#a8a39c', marginBottom: '4px' }}>Custom</p>
            <p style={{ fontSize: '12px', color: '#a8a39c', marginBottom: '16px' }}>per month</p>
            <p style={{ fontSize: '13px', color: '#4a6d8c', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
              For facilities with 4+ x-ray machines or multiple locations. Custom pricing, dedicated support, and volume licensing.
            </p>
            <span style={{ display: 'block', textAlign: 'center', padding: '9px', border: '1px solid #c2ddf0', borderRadius: '8px', fontSize: '13px', fontWeight: '500', color: '#a8a39c' }}>
              Coming soon
            </span>
          </div>

        </div>

        {/* Feature comparison */}
        <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '14px', overflow: 'hidden', marginBottom: '40px' }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid #eef3fb' }}>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>What&apos;s included</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f7fb' }}>
                <th style={{ padding: '12px 28px', textAlign: 'left', fontSize: '12px', color: '#827d76', fontWeight: '500' }}>Feature</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#827d76', fontWeight: '500' }}>Free</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#0d2d5e', fontWeight: '500' }}>Professional</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#2d6a4f', fontWeight: '500' }}>Dealer / SP</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: '#827d76', fontWeight: '500' }}>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Compliance search — all 50 states', free: true, pro: true, sp: true, ent: true },
                { feature: 'State agency contact cards', free: true, pro: true, sp: true, ent: true },
                { feature: 'State forms teaser', free: true, pro: true, sp: true, ent: true },
                { feature: 'Dashboard access', free: false, pro: true, sp: true, ent: true },
                { feature: 'AI compliance assistant', free: false, pro: true, sp: true, ent: true },
                { feature: 'State documents library', free: false, pro: true, sp: true, ent: true },
                { feature: 'Compliance calendar', free: false, pro: true, sp: true, ent: true },
                { feature: 'Document repository', free: false, pro: true, sp: true, ent: true },
                { feature: 'Equipment inventory', free: false, pro: true, sp: true, ent: true },
                { feature: 'Equipment & Systems contacts', free: false, pro: true, sp: true, ent: true },
                { feature: 'Keys to Success checklist', free: false, pro: true, sp: true, ent: true },
                { feature: 'RSP / RPP builder', free: false, pro: true, sp: true, ent: true },
                { feature: 'Inspection report', free: false, pro: true, sp: true, ent: true },
                { feature: 'X-ray machines', free: false, pro: '1–3', sp: false, ent: '4+' },
                { feature: 'Multiple locations', free: false, pro: false, sp: false, ent: true },
                { feature: 'State registrations (SP)', free: false, pro: false, sp: true, ent: false },
                { feature: 'Client facilities tracking', free: false, pro: false, sp: true, ent: false },
                { feature: 'Quarterly state reports', free: false, pro: false, sp: true, ent: false },
                { feature: 'Revenue & commission dashboard', free: false, pro: false, sp: true, ent: false },
                { feature: '60% referral commission', free: false, pro: false, sp: true, ent: false },
              ].map((row, i) => (
                <tr key={row.feature} style={{ borderTop: '1px solid #eef3fb', background: i % 2 === 0 ? '#fff' : '#fafcff' }}>
                  <td style={{ padding: '11px 28px', fontSize: '13px', color: '#1e1c1a' }}>{row.feature}</td>
                  <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: '13px' }}>
                    {row.free === true ? <CHECK /> : row.free === false ? <CROSS /> : <span style={{ fontSize: '12px', color: '#827d76' }}>{row.free}</span>}
                  </td>
                  <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: '13px', background: 'rgba(13,45,94,0.03)' }}>
                    {row.pro === true ? <CHECK /> : row.pro === false ? <CROSS /> : <span style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e' }}>{row.pro}</span>}
                  </td>
                  <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: '13px' }}>
                    {row.sp === true ? <CHECK /> : row.sp === false ? <CROSS /> : <span style={{ fontSize: '12px', color: '#827d76' }}>{row.sp}</span>}
                  </td>
                  <td style={{ padding: '11px 16px', textAlign: 'center', fontSize: '13px' }}>
                    {row.ent === true ? <CHECK /> : row.ent === false ? <CROSS /> : <span style={{ fontSize: '12px', fontWeight: '500', color: '#0d2d5e' }}>{row.ent}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: '500', color: '#1a5fa8', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>Common questions</span>
            <div style={{ flex: 1, height: '1px', background: '#c2ddf0' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { q: 'Do I need a credit card for the free trial?', a: 'No. Start your 14-day trial and explore every feature. Your card is only charged if you choose to continue after the trial ends.' },
              { q: 'Can I cancel anytime?', a: 'Yes — cancel from the Manage Subscription page at any time. You keep full access until the end of your current billing period.' },
              { q: 'What is the 60% referral commission?', a: 'Dealer and Service Provider accounts earn 60% of each referred facility\'s monthly subscription ($29.40/month per facility) as long as they remain subscribed.' },
              { q: 'What is the Enterprise tier?', a: 'Enterprise is designed for facilities with 4 or more x-ray machines or multiple locations. Coming soon — contact us if you have an immediate need.' },
              { q: 'How current is the regulation data?', a: 'Regulation data is synced from our Airtable database and updated continuously as states update their requirements. Data currency is noted on each search result.' },
              { q: 'Does the AI assistant use my facility data?', a: 'Yes. The AI automatically uses your facility name, state, modalities, and facility type to give you state-specific answers grounded in regulation data.' },
            ].map(item => (
              <div key={item.q} style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', padding: '18px 20px' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>{item.q}</p>
                <p style={{ fontSize: '13px', color: '#4a6d8c', lineHeight: '1.65', margin: 0 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ background: '#0d2d5e', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>Start your free trial today</h3>
          <p style={{ fontSize: '14px', color: '#8bb4d4', marginBottom: '24px', lineHeight: '1.6' }}>
            14 days free. No credit card required. Full access to every feature from day one.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/get-started?type=facility" style={{ background: '#fff', color: '#0d2d5e', fontSize: '13px', fontWeight: '500', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none' }}>
              Medical Facility — $49/mo
            </Link>
            <Link href="/get-started?type=service_provider" style={{ background: '#2d6a4f', color: '#fff', fontSize: '13px', fontWeight: '500', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none' }}>
              Dealer / Service Provider — $149/mo
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}