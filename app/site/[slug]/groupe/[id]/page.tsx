import Link from 'next/link'
import { SITES, GROUPES } from '@/lib/data'
import { getReleve, getHistorique } from '@/lib/influx'
import EtatBadge from '@/components/EtatBadge'
import Gauge from '@/components/Gauge'
import GroupeChart from '@/components/GroupeChart'
import HistoriqueTable from '@/components/HistoriqueTable'

// Server Component — fetch InfluxDB au rendu.

interface Props {
  params: { slug: string; id: string }
}

export default async function GroupePage({ params }: Props) {
  const { slug, id } = params
  const site = SITES.find(s => s.slug === slug)
  const groupe = GROUPES.find(g => g.id === id)

  if (!site || !groupe) return <div className="p-8 text-[#6b7280]">Groupe introuvable</div>

  // Fetch en parallèle : dernier relevé + historique 24h
  const [r, historique] = await Promise.all([
    getReleve(id),
    getHistorique(id),
  ])

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
          {new Date(r.timestamp).toLocaleString('fr-FR')}
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

      {/* GRAPHIQUE 24H — Client Component pour Recharts */}
      <div className="bg-white border border-[#e4e4e0] rounded-sm mb-4 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7280]">
            Évolution sur 24h — Puissances (kW)
          </h3>
        </div>
        <GroupeChart data={historique} />
      </div>

      {/* HISTORIQUE RELEVES — Client Component pour la pagination éventuelle */}
      <HistoriqueTable groupeId={id} />
    </div>
  )
}
