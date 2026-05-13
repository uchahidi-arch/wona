'use client'
import { useState } from 'react'
import { SITES, GROUPES } from '@/lib/data'

type Format = 'pdf' | 'excel'
type Periode = 'jour' | 'semaine' | 'mois' | 'custom'

export default function RapportsPage() {
  const [siteId, setSiteId] = useState<string>('all')
  const [groupeId, setGroupeId] = useState<string>('all')
  const [periode, setPeriode] = useState<Periode>('jour')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [loading, setLoading] = useState<Format | null>(null)
  const [done, setDone] = useState<Format | null>(null)

  const groupesFiltres = siteId === 'all' ? GROUPES : GROUPES.filter(g => g.site_id === siteId)

  async function handleExport(format: Format) {
    setLoading(format)
    setDone(null)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(null)
    setDone(format)
    setTimeout(() => setDone(null), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">

      <div className="mb-8">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">Wona — SONELEC</div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--cond)' }}>RAPPORTS</h1>
        <p className="text-[13px] text-[#6b7280] mt-1">Génération de rapports PDF et Excel par site, groupe et période</p>
      </div>

      <div className="grid grid-cols-1 gap-4">

        <div className="bg-white border border-[#e4e4e0] rounded-sm p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-4">Paramètres du rapport</div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#6b7280] mb-1.5">Site</label>
              <select
                value={siteId}
                onChange={e => { setSiteId(e.target.value); setGroupeId('all') }}
                className="w-full border border-[#e4e4e0] rounded-sm px-3 py-2 text-[13px] bg-white focus:outline-none focus:border-[#1E1EE8]"
              >
                <option value="all">Tous les sites</option>
                {SITES.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#6b7280] mb-1.5">Groupe</label>
              <select
                value={groupeId}
                onChange={e => setGroupeId(e.target.value)}
                className="w-full border border-[#e4e4e0] rounded-sm px-3 py-2 text-[13px] bg-white focus:outline-none focus:border-[#1E1EE8]"
              >
                <option value="all">Tous les groupes</option>
                {groupesFiltres.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#6b7280] mb-1.5">Période</label>
            <div className="flex gap-2">
              {(['jour', 'semaine', 'mois', 'custom'] as Periode[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriode(p)}
                  className="px-4 py-1.5 text-[12px] font-medium rounded-sm border transition-colors"
                  style={
                    periode === p
                      ? { background: '#1E1EE8', color: '#fff', borderColor: '#1E1EE8' }
                      : { background: '#fff', color: '#6b7280', borderColor: '#e4e4e0' }
                  }
                >
                  {p === 'jour' ? "Aujourd'hui" : p === 'semaine' ? 'Cette semaine' : p === 'mois' ? 'Ce mois' : 'Personnalisé'}
                </button>
              ))}
            </div>
          </div>

          {periode === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#6b7280] mb-1.5">Date début</label>
                <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
                  className="w-full border border-[#e4e4e0] rounded-sm px-3 py-2 text-[13px] bg-white focus:outline-none focus:border-[#1E1EE8]"
                  style={{ fontFamily: 'var(--mono)' }} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-[#6b7280] mb-1.5">Date fin</label>
                <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)}
                  className="w-full border border-[#e4e4e0] rounded-sm px-3 py-2 text-[13px] bg-white focus:outline-none focus:border-[#1E1EE8]"
                  style={{ fontFamily: 'var(--mono)' }} />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-[#e4e4e0] rounded-sm p-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-4">Contenu du rapport</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Production journalière', desc: 'kWh par groupe et par heure' },
              { label: 'Puissance active', desc: 'Courbe sur la période sélectionnée' },
              { label: 'Facteur de puissance', desc: 'Moyenne et valeurs min/max' },
              { label: 'Heures de marche', desc: 'Cumul par groupe' },
              { label: 'Alarmes', desc: 'Liste et durée des incidents' },
              { label: 'Disponibilité', desc: 'Taux de disponibilité en %' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2.5 p-3 bg-[#f5f5f3] rounded-sm">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--green)' }} />
                <div>
                  <div className="text-[12px] font-semibold text-[#1a1a1a]">{item.label}</div>
                  <div className="text-[11px] text-[#9ca3af]">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleExport('pdf')}
            disabled={loading !== null}
            className="flex items-center justify-between bg-white border border-[#e4e4e0] rounded-sm px-5 py-4 hover:shadow-sm transition-all group disabled:opacity-50"
            style={{ '--hover-border': 'var(--red)' } as React.CSSProperties}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--red)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#e4e4e0')}
          >
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-0.5">Export</div>
              <div className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--cond)' }}>
                {loading === 'pdf' ? 'GÉNÉRATION...' : done === 'pdf' ? 'TÉLÉCHARGÉ !' : 'RAPPORT PDF'}
              </div>
              <div className="text-[11px] text-[#6b7280] mt-0.5">Mise en page A4, prêt à imprimer</div>
            </div>
            <div className="w-10 h-10 rounded-sm flex items-center justify-center transition-colors"
              style={{ background: done === 'pdf' ? 'var(--green)' : '#fef2f2' }}>
              {loading === 'pdf'
                ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--red)' }} />
                : done === 'pdf'
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="var(--red)"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              }
            </div>
          </button>

          <button
            onClick={() => handleExport('excel')}
            disabled={loading !== null}
            className="flex items-center justify-between bg-white border border-[#e4e4e0] rounded-sm px-5 py-4 hover:shadow-sm transition-all group disabled:opacity-50"
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#e4e4e0')}
          >
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-0.5">Export</div>
              <div className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--cond)' }}>
                {loading === 'excel' ? 'GÉNÉRATION...' : done === 'excel' ? 'TÉLÉCHARGÉ !' : 'RAPPORT EXCEL'}
              </div>
              <div className="text-[11px] text-[#6b7280] mt-0.5">Données brutes, feuilles par groupe</div>
            </div>
            <div className="w-10 h-10 rounded-sm flex items-center justify-center transition-colors"
              style={{ background: done === 'excel' ? 'var(--green)' : '#eef7f1' }}>
              {loading === 'excel'
                ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--green)' }} />
                : done === 'excel'
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="var(--green)"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
              }
            </div>
          </button>
        </div>

      </div>
    </div>
  )
}
