import type { Metadata } from 'next'
import Footer from './components/Footer'

export const metadata: Metadata = {
  title: 'ComplianceOS — The Radiology Coach',
  description: 'X-ray compliance management for medical facilities and x-ray service providers.',
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