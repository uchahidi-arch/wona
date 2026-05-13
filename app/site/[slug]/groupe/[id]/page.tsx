'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { SITES, GROUPES, getMockReleve, getMockHistorique } from '@/lib/data'
import EtatBadge from '@/components/EtatBadge'
import Gauge from '@/components/Gauge'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export default function GroupePage() {
  const { slug, id } = useParams<{ slug: string; id: string }>()
  const site = SITES.find(s => s.slug === slug)
  const groupe = GROUPES.find(g => g.id === id)
  const r = getMockReleve(id)
  const historique = getMockHistorique(id)

  if (!site || !groupe) return <div className="p-8 text-[#6b7280]">Groupe introuvable</div>

  const releves_recents = Array.from({ length: 8 }, (_, i) => {
    const t = new Date(Date.now() - i * 5 * 60 * 1000)
    return {
      time: t.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      tension: (400 + Math.random() * 10 - 5).toFixed(1),
      freq: (49 + Math.random() * 1).toFixed(2),
      pa: (770 + Math.random() * 30).toFixed(0),
      fp: (0.82 + Math.random() * 0.08).toFixed(2),
    }
  }).reverse()

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-[#9ca3af] mb-6">
        <Link href="/" className="hover:text-[#1a1a1a]">Vue générale</Link>
        <span>/</span>
        <Link href={`/site/${slug}`} className="hover:text-[#1a1a1a]">{site.nom}</Link>
        <span>/</span>
        <span className="text-[#1a1a1a] font-medium">{groupe.nom}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            GROUPE {groupe.nom}
          </h1>
          <EtatBadge etat={groupe.etat} large />
        </div>
        <div className="text-[11px] font-mono text-[#9ca3af]">
          {new Date().toLocaleString('fr-FR')}
        </div>
      </div>

      {/* SYSTEME ELECTRIQUE */}
      <div className="bg-white border border-[#e4e4e0] rounded-sm mb-4">
        <div className="px-5 py-3 border-b border-[#f0f0ee] flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#6b7280]">Système électrique</span>
        </div>
        <div className="px-5 py-5">
          <div className="grid grid-cols-6 gap-3 mb-6">
            <Gauge value={r.tension_l1} min={350} max={450} unit="V" label="Tension L1" size={130} decimals={0} />
            <Gauge value={r.tension_l2} min={350} max={450} unit="V" label="Tension L2" size={130} decimals={0} />
            <Gauge value={r.tension_l3} min={350} max={450} unit="V" label="Tension L3" size={130} decimals={0} />
            <Gauge value={r.frequence} min={45} max={55} unit="Hz" label="Fréquence" size={130} decimals={2} />
            <Gauge value={r.facteur_puissance} min={0} max={1} unit="" label="Facteur P." size={130} decimals={2} />
            <Gauge value={r.batterie_v} min={20} max={30} unit="V" label="Batterie" size={130} decimals={1} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Gauge value={r.puissance_active} min={0} max={2000} unit="kW" label="Puissance Active" size={140} decimals={0} />
            <Gauge value={r.puissance_reactive} min={0} max={1500} unit="kVAR" label="Puissance Réactive" size={140} decimals={0} />
            <Gauge value={r.puissance_apparente} min={0} max={2000} unit="kVA" label="Puissance Apparente" size={140} decimals={0} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[
              { val: r.courant_l1, label: 'Courant L1 (Phase 1)' },
              { val: r.courant_l2, label: 'Courant L2 (Phase 2)' },
              { val: r.courant_l3, label: 'Courant L3 (Phase 3)' },
            ].map(({ val, label }) => (
              <div key={label} className="bg-[#f5f5f3] rounded p-4 flex items-center justify-between">
                <span className="text-[11px] text-[#6b7280] uppercase tracking-wide">{label}</span>
                <span className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono' }}>
                  {(val / 1000).toFixed(2)}
                  <span className="text-[13px] font-normal text-[#9ca3af] ml-1">kA</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SYSTEME MECANIQUE */}
      <div className="bg-white border border-[#e4e4e0] rounded-sm mb-4">
        <div className="px-5 py-3 border-b border-[#f0f0ee] flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
          </svg>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#6b7280]">Système mécanique</span>
        </div>
        <div className="px-5 py-5 grid grid-cols-5 gap-3">
          {[
            { label: 'Temp. eau', value: r.temp_eau, unit: '°C', warn: 90, crit: 100 },
            { label: 'Pression huile', value: r.pression_huile, unit: 'bar', warn: 5.5, crit: 6.5 },
            { label: 'Niveau gazoil', value: r.niveau_gazoil, unit: '%', warn: 25, crit: 10 },
            { label: 'Vitesse rotation', value: r.vitesse_rotation, unit: 'tr/min', warn: 1520, crit: 1550 },
            { label: 'Heures marche', value: r.heures_marche, unit: 'h', warn: 15000, crit: 20000 },
          ].map(({ label, value, unit, warn, crit }) => {
            const isWarn = value > warn
            const isCrit = value > crit
            const color = isCrit ? '#dc2626' : isWarn ? '#ea580c' : '#1a1a1a'
            return (
              <div key={label} className="bg-[#f5f5f3] rounded p-4">
                <div className="text-[10px] text-[#9ca3af] uppercase tracking-wide mb-2">{label}</div>
                <div className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono', color }}>
                  {value.toFixed(1)}
                </div>
                <div className="text-[11px] text-[#9ca3af] mt-0.5">{unit}</div>
                {(isWarn || isCrit) && (
                  <div className="mt-2 text-[10px] font-semibold" style={{ color }}>
                    {isCrit ? '⚠ CRITIQUE' : '⚠ ATTENTION'}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* GRAPHIQUE 24H */}
      <div className="bg-white border border-[#e4e4e0] rounded-sm mb-4 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7280]">
            Évolution sur 24h — Puissances (kW)
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={historique} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', border: '1px solid #e4e4e0', borderRadius: 2 }} />
            <Legend iconSize={8} iconType="line" wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
            <Line type="monotone" dataKey="pa" stroke="#16a34a" strokeWidth={1.5} dot={false} name="P. Active" />
            <Line type="monotone" dataKey="pr" stroke="#ea580c" strokeWidth={1.5} dot={false} name="P. Réactive" />
            <Line type="monotone" dataKey="papp" stroke="#2563eb" strokeWidth={1.5} dot={false} name="P. Apparente" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* HISTORIQUE RELEVES */}
      <div className="bg-white border border-[#e4e4e0] rounded-sm p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7280] mb-4">
          Historique des relevés
        </h3>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[#e4e4e0]">
              {['Heure', 'Tension (V)', 'Fréquence (Hz)', 'P. Active (kW)', 'Facteur P.'].map(h => (
                <th key={h} className="text-left pb-2 text-[10px] text-[#9ca3af] uppercase tracking-wide font-semibold pr-6">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {releves_recents.map((row, i) => (
              <tr key={i} className="border-b border-[#f5f5f3] hover:bg-[#f9f9f8]">
                <td className="py-2 pr-6 font-mono text-[#6b7280]" style={{ fontFamily: 'JetBrains Mono' }}>{row.time}</td>
                <td className="py-2 pr-6 font-mono font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>{row.tension}</td>
                <td className="py-2 pr-6 font-mono font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>{row.freq}</td>
                <td className="py-2 pr-6 font-mono font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>{row.pa}</td>
                <td className="py-2 font-mono font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>{row.fp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
