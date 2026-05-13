'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { SITES, GROUPES, getMockReleve, getMockHistorique, etatColor, etatBg, etatBorder } from '@/lib/data'
import EtatBadge from '@/components/EtatBadge'
import Gauge from '@/components/Gauge'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function SitePage() {
  const { slug } = useParams<{ slug: string }>()
  const site = SITES.find(s => s.slug === slug)
  const groupes = GROUPES.filter(g => g.site_id === site?.id)
  const historique = getMockHistorique('site')

  if (!site) return <div className="p-8 text-[#6b7280]">Site introuvable</div>

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">

      {/* Breadcrumb + header */}
      <div className="flex items-center gap-2 text-[12px] text-[#9ca3af] mb-6">
        <Link href="/" className="hover:text-[#1a1a1a]">Vue générale</Link>
        <span>/</span>
        <span className="text-[#1a1a1a] font-medium">{site.nom}</span>
      </div>

      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          {site.nom.toUpperCase()} — {groupes.length} GROUPES
        </h1>
        <div className="flex items-center gap-3 text-[11px] text-[#9ca3af]">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
            Temps réel
          </div>
          <span style={{ fontFamily: 'JetBrains Mono' }}>{new Date().toLocaleTimeString('fr-FR')}</span>
        </div>
      </div>

      {/* Groupes grid */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {groupes.map(groupe => {
          const r = getMockReleve(groupe.id)
          const isRunning = groupe.etat === 'RUNNING'

          return (
            <Link
              key={groupe.id}
              href={`/site/${slug}/groupe/${groupe.id}`}
              className="block bg-white border rounded-sm hover:shadow-md transition-shadow"
              style={{ borderColor: etatBorder(groupe.etat) }}
            >
              {/* Groupe header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#f0f0ee]">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold tracking-widest" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                    {groupe.nom}
                  </span>
                  <EtatBadge etat={groupe.etat} />
                </div>
                {isRunning && (
                  <div className="flex items-center gap-6 text-[11px] text-[#6b7280]">
                    <span>PA: <b className="text-[#1a1a1a]" style={{ fontFamily: 'JetBrains Mono' }}>{r.puissance_active.toFixed(0)} kW</b></span>
                    <span>F: <b className="text-[#1a1a1a]" style={{ fontFamily: 'JetBrains Mono' }}>{r.frequence.toFixed(1)} Hz</b></span>
                    <span>V: <b className="text-[#1a1a1a]" style={{ fontFamily: 'JetBrains Mono' }}>{r.tension_l1.toFixed(0)} V</b></span>
                    <span className="text-[#9ca3af]">Voir détail →</span>
                  </div>
                )}
              </div>

              {isRunning && (
                <div className="px-5 py-4">
                  {/* Systeme electrique */}
                  <div className="mb-3">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3">
                      ⚡ Système électrique
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      <Gauge value={r.tension_l1} min={350} max={450} unit="V" label="Tension L1" size={110} decimals={0} />
                      <Gauge value={r.frequence} min={45} max={55} unit="Hz" label="Fréquence" size={110} decimals={1} />
                      <Gauge value={r.puissance_active} min={0} max={2000} unit="kW" label="P. Active" size={110} decimals={0} />
                      <Gauge value={r.puissance_reactive} min={0} max={1500} unit="kVAR" label="P. Réactive" size={110} decimals={0} />
                      <Gauge value={r.puissance_apparente} min={0} max={2000} unit="kVA" label="P. Apparente" size={110} decimals={0} />
                      <Gauge value={r.facteur_puissance} min={0} max={1} unit="" label="Facteur P." size={110} decimals={2} />
                    </div>
                  </div>

                  {/* Courants */}
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3">
                      Courants phases
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { val: r.courant_l1, label: 'Courant L1' },
                        { val: r.courant_l2, label: 'Courant L2' },
                        { val: r.courant_l3, label: 'Courant L3' },
                      ].map(({ val, label }) => (
                        <div key={label} className="bg-[#f5f5f3] rounded p-3 flex items-center justify-between">
                          <span className="text-[11px] text-[#6b7280] uppercase tracking-wide">{label}</span>
                          <span className="text-lg font-bold" style={{ fontFamily: 'JetBrains Mono' }}>
                            {(val / 1000).toFixed(2)} <span className="text-[12px] font-normal text-[#9ca3af]">kA</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!isRunning && (
                <div className="px-5 py-6 text-[13px] text-[#9ca3af] font-medium">
                  Groupe à l'arrêt — aucune donnée disponible
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* Production journalière */}
      <div className="bg-white border border-[#e4e4e0] rounded-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7280]">
            Production journalière — kWh
          </h3>
          <span className="text-[11px] font-mono text-[#9ca3af]">Aujourd'hui</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={historique} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradPA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, fontFamily: 'JetBrains Mono', border: '1px solid #e4e4e0', borderRadius: 2 }}
              labelStyle={{ color: '#6b7280' }}
            />
            <Area type="monotone" dataKey="pa" stroke="#16a34a" strokeWidth={1.5} fill="url(#gradPA)" name="kWh" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
