import Link from 'next/link'
import { SITES, GROUPES, etatBorder } from '@/lib/data'
import { getReleve, getHistorique } from '@/lib/influx'
import EtatBadge from '@/components/EtatBadge'
import Gauge from '@/components/Gauge'
import SiteChart from '@/components/SiteChart'

// Server Component — les données sont fetchées côté serveur au moment du rendu.
// Quand InfluxDB est connecté, getReleve() et getHistorique() retournent les vraies données.

interface Props {
  params: { slug: string }
}

export default async function SitePage({ params }: Props) {
  const { slug } = params
  const site = SITES.find(s => s.slug === slug)
  const groupes = GROUPES.filter(g => g.site_id === site?.id)

  if (!site) return <div className="p-8 text-[#6b7280]">Site introuvable</div>

  // Fetch tous les relevés des groupes du site en parallèle
  const releves = await Promise.all(
    groupes.map(g => getReleve(g.id))
  )

  // Historique du premier groupe RUNNING pour le graphique site
  const groupeRunning = groupes.find(g => g.etat === 'RUNNING')
  const historique = groupeRunning
    ? await getHistorique(groupeRunning.id)
    : []

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
        {groupes.map((groupe, idx) => {
          const r = releves[idx]
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

      {/* Production journalière — SiteChart est un Client Component pour Recharts */}
      <div className="bg-white border border-[#e4e4e0] rounded-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#6b7280]">
            Production journalière — kWh
          </h3>
          <span className="text-[11px] font-mono text-[#9ca3af]">Aujourd'hui</span>
        </div>
        <SiteChart data={historique} />
      </div>
    </div>
  )
}
