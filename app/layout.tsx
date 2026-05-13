import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Wona — SONELEC',
  description: 'Tableau de bord de supervision SONELEC Comores',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#f5f5f3]">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
