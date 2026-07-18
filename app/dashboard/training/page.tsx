export default function TrainingPage() {
  const categories = [
    {
      title: 'Getting Started',
      videos: [
        { title: 'Welcome to ComplianceOS — Your First 15 Minutes', id: 'YOUTUBE_ID_1', desc: 'A quick walkthrough of the dashboard and how to set up your facility profile.' },
        { title: 'Understanding Your State X-ray Requirements', id: 'YOUTUBE_ID_2', desc: 'How to read your compliance requirements and know what applies to your facility.' },
      ]
    },
    {
      title: 'Lead Aprons & Radiation Protection',
      videos: [
        { title: 'Lead Apron Annual Inspection — What You Need to Know', id: 'YOUTUBE_ID_3', desc: 'Step-by-step guide to conducting and documenting your annual lead apron inspection.' },
        { title: 'Choosing the Right Radiation Protection Equipment', id: 'YOUTUBE_ID_4', desc: 'What to look for when purchasing aprons, thyroid shields, and other protective gear.' },
      ]
    },
    {
      title: 'Equipment Registration & QA',
      videos: [
        { title: 'How to Register Your X-ray Equipment with the State', id: 'YOUTUBE_ID_5', desc: 'State registration process explained — what forms you need and where to send them.' },
        { title: 'Annual QA Testing — What Does a Physicist Do?', id: 'YOUTUBE_ID_6', desc: 'Understanding the annual physics evaluation and what the report means for your facility.' },
      ]
    },
    {
      title: 'Radiation Safety Programs',
      videos: [
        { title: 'What Is a Radiation Protection Program (RPP)?', id: 'YOUTUBE_ID_7', desc: 'The required elements of an RPP and how to use the RSP Builder to generate yours.' },
        { title: 'Dosimetry Badges — Who Needs Them and How Often?', id: 'YOUTUBE_ID_8', desc: 'Personnel dosimetry requirements by facility type and modality.' },
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
        <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#0d2d5e', marginBottom: '6px' }}>Video Training Center</h1>
            <p style={{ fontSize: '13px', color: '#827d76' }}>Expert x-ray compliance guidance from Gregory Turner — The Radiology Coach</p>
          </div>
          <a href="https://www.youtube.com/c/TheRadiologyCoach" target="_blank" rel="noopener noreferrer"
            style={{ height: '36px', padding: '0 16px', background: '#ff0000', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: '500', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            ▶ Subscribe on YouTube
          </a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {categories.map(cat => (
            <div key={cat.title}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', margin: 0 }}>{cat.title}</p>
                <div style={{ flex: 1, height: '1px', background: '#dce8f5' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {cat.videos.map(video => (
                  <a key={video.title}
                    href={video.id.startsWith('YOUTUBE_ID') ? 'https://www.youtube.com/c/TheRadiologyCoach' : `https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#fff', border: '1px solid #dce8f5', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer' }}>
                      <div style={{ background: '#0d2d5e', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {!video.id.startsWith('YOUTUBE_ID') ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${video.id}`}
                            style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', inset: 0 }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                              <span style={{ color: '#fff', fontSize: '20px', marginLeft: '3px' }}>▶</span>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '10px', margin: 0 }}>Video coming soon</p>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '12px 14px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '500', color: '#0d2d5e', marginBottom: '4px', lineHeight: '1.4' }}>{video.title}</p>
                        <p style={{ fontSize: '11px', color: '#827d76', lineHeight: '1.55', margin: 0 }}>{video.desc}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff6e8', border: '1px solid #f0d4a0', borderRadius: '10px', padding: '16px 20px', marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '20px' }}>💡</span>
          <p style={{ fontSize: '13px', color: '#9a3510', flex: 1, margin: 0, lineHeight: '1.6' }}>
            To add your actual YouTube video IDs to this page, open <code style={{ background: 'rgba(0,0,0,.06)', padding: '1px 5px', borderRadius: '3px', fontSize: '11px' }}>app/dashboard/training/page.tsx</code> and replace each <code style={{ background: 'rgba(0,0,0,.06)', padding: '1px 5px', borderRadius: '3px', fontSize: '11px' }}>YOUTUBE_ID_N</code> with the video ID from your YouTube URL.
          </p>
        </div>
      </div>
    </div>
  )
}