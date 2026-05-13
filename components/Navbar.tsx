'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const path = usePathname()

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#e4e4e0] h-24 flex items-center px-6 pr-16 gap-6">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/sonelec-logo.png" alt="Logo SONELEC" width={56} height={56} className="rounded" />
        <div className="flex flex-col items-center leading-tight">
          <span className="font-semibold text-[18px] tracking-tight">WONA</span>
          <span className="text-[#9ca3af] text-[14px] font-medium">SONELEC</span>
        </div>
      </Link>

      <div className="h-4 w-px bg-[#e4e4e0]" />

      <div className="flex items-center gap-1">
        {[
          { href: '/', label: 'Vue générale' },
          { href: '/saisie', label: 'Saisie terrain' },
          { href: '/rapports', label: 'Rapports' },
          { href: '/historique', label: 'Historique' },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded text-[15px] font-medium transition-colors border-b-2 ${
              path === item.href
                ? 'text-[#1E1EE8] border-[#1E1EE8] bg-[#f0f0ff]'
                : 'text-[#6b7280] border-transparent hover:text-[#1a1a1a] hover:bg-[#f5f5f3]'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[13px] text-[#6b7280]">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
          Temps réel
        </div>
        <div className="text-[13px] font-mono text-[#9ca3af]">
          {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </nav>
  )
}
