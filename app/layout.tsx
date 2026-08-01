import type { Metadata } from 'next'
import Footer from './components/Footer'

export const metadata: Metadata = {
  title: 'The Radiology Coach Compliance Hub',
  description: 'State-specific x-ray compliance requirements for medical facilities. Find your Required Actions, build your RPP, track equipment QA, and stay inspection-ready.',
  authors: [{ name: 'Greg Turner', url: 'https://www.theradiologycoach.com/about' }],
  openGraph: {
    title: 'The Radiology Coach Compliance Hub',
    description: 'State-specific x-ray compliance for medical facilities. Stay inspection-ready.',
    url: 'https://app.theradiologycoach.com',
    siteName: 'The Radiology Coach Compliance Hub',
    images: [
      {
        url: 'https://static.wixstatic.com/media/487e4d_169ce6cab6fa4ea19587c7e22a0fc0e5~mv2_d_3448_4808_s_4_2.jpg/v1/crop/x_400,y_50,w_2648,h_1386/fill/w_1200,h_627,al_t,q_95,usm_0.66_1.00_0.01,enc_jpg/Greg_OG.jpg',
        width: 1200,
        height: 627,
        alt: 'Greg Turner — The Radiology Coach Compliance Hub',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Radiology Coach Compliance Hub',
    description: 'State-specific x-ray compliance for medical facilities.',
    images: ['https://static.wixstatic.com/media/487e4d_169ce6cab6fa4ea19587c7e22a0fc0e5~mv2_d_3448_4808_s_4_2.jpg/v1/crop/x_400,y_50,w_2648,h_1386/fill/w_1200,h_627,al_t,q_95,usm_0.66_1.00_0.01,enc_jpg/Greg_OG.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
        {children}
        <Footer />
      </body>
    </html>
  )
}