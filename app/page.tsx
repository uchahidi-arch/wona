import Link from 'next/link'
import { SITES, GROUPES, getSiteEtat, getSitePuissance, etatColor, etatBg, etatBorder } from '@/lib/data'
import EtatBadge from '@/components/EtatBadge'

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--cond)' }}>
            Vue générale
          </h1>
          <p className="text-[13px] text-[#6b7280] mt-0.5">
            {SITES.length} sites — {GROUPES.filter(g => g.etat === 'RUNNING').length} groupes en marche
          </p>
        </div>
        <div className="text-[11px] font-mono text-[#9ca3af]">
          {new Date().toLocaleString('fr-FR')}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-8">
        {SITES.map(site => {
          const etat = getSiteEtat(site.id)
          const puissance = getSitePuissance(site.id)
          const groupes = GROUPES.filter(g => g.site_id === site.id)
          const running = groupes.filter(g => g.etat === 'RUNNING').length
          const alarm = groupes.filter(g => g.etat === 'ALARM').length

          return (
            <Link
              key={site.id}
              href={`/site/${site.slug}`}
              className="block bg-white border rounded-sm p-5 hover:shadow-md transition-shadow"
              style={{ borderColor: etatBorder(etat) }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: etatColor(etat) }} />
                    <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--cond)' }}>
                      {site.nom.toUpperCase()}
                    </h2>
                  </div>
                  <p className="text-[12px] text-[#9ca3af]">{site.localisation}</p>
                </div>
                <EtatBadge etat={etat} />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-[#f5f5f3] rounded p-3">
                  <div className="text-[10px] text-[#9ca3af] uppercase tracking-wide mb-1">Groupes</div>
                  <div className="text-2xl font-bold" style={{ fontFamily: 'var(--mono)' }}>{groupes.length}</div>
                </div>
                <div className="rounded p-3" style={{ background: '#eef7f1' }}>
                  <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--green)' }}>En marche</div>
                  <div className="text-2xl font-bold" style={{ fontFamily: 'var(--mono)', color: 'var(--green)' }}>{running}</div>
                </div>
                <div className="bg-[#f5f5f3] rounded p-3">
                  <div className="text-[10px] text-[#9ca3af] uppercase tracking-wide mb-1">Puissance</div>
                  <div className="text-2xl font-bold" style={{ fontFamily: 'var(--mono)' }}>{(puissance / 1000).toFixed(1)}</div>
                  <div className="text-[10px] text-[#9ca3af]">MW</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {groupes.map(g => (
                  <span
                    key={g.id}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded border"
                    style={{ fontFamily: 'var(--mono)', color: etatColor(g.etat), background: etatBg(g.etat), borderColor: etatBorder(g.etat) }}
                  >
                    {g.nom}
                  </span>
                ))}
              </div>

              {alarm > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium" style={{ color: 'var(--red)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  {alarm} alarme{alarm > 1 ? 's' : ''} active{alarm > 1 ? 's' : ''}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      <div className="bg-white border border-[#e4e4e0] rounded-sm p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7280] mb-4">
          Synthèse — Tous sites
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Puissance active totale', value: '8 420', unit: 'kW' },
            { label: 'Production journalière', value: '201 780', unit: 'kWh' },
            { label: 'Groupes actifs', value: '7', unit: '/ 11' },
            { label: 'Disponibilité', value: '63.6', unit: '%' },
          ].map((s, i) => (
            <div key={s.label} className={`${i > 0 ? 'border-l border-[#e4e4e0] pl-4' : ''}`}>
              <div className="text-[10px] text-[#9ca3af] uppercase tracking-wide mb-1">{s.label}</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold" style={{ fontFamily: 'var(--mono)' }}>{s.value}</span>
                <span className="text-[12px] text-[#9ca3af]">{s.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
