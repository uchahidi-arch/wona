export default function Footer() {
  return (
    <footer className="border-t border-[#e4e4e0] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-[11px] text-[#9ca3af]" style={{ fontFamily: 'var(--mono)' }}>
          © {new Date().getFullYear()} SONELEC — Wona
        </span>
        <span className="text-[11px] text-[#9ca3af]">
          Société Nationale d'Électricité des Comores
        </span>
      </div>
    </footer>
  )
}
