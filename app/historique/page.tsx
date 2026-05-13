'use client'
import { useState, useMemo, useEffect } from 'react'
import { SITES, GROUPES } from '@/lib/data'

// Les données viennent de /api/historique (qui lit InfluxDB).
// Quand InfluxDB n'est pas encore connecté, l'API retourne [] et le tableau est vide.

const COLONNES = [
  { key: 'timestamp', label: 'Horodatage' },
  { key: 'groupe', label: 'Groupe' },
  { key: 'tension_l1', label: 'U L1 (V)' },
  { key: 'frequence', label: 'Fréq. (Hz)' },
  { key: 'puissance_active', label: 'PA (kW)' },
  { key: 'puissance_reactive', label: 'PR (kVAR)' },
  { key: 'facteur_puissance', label: 'FP' },
  { key: 'courant_l1', label: 'I L1 (A)' },
  { key: 'temp_eau', label: 'T°eau (°C)' },
  { key: 'niveau_gazoil', label: 'Gazoil (%)' },
]

const PER_PAGE = 20

function formatVal(key: string, val: any) {
  if (key === 'timestamp') {
    return new Date(val).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }
  if (key === 'groupe') return val
  if (key === 'facteur_puissance') return Number(val).toFixed(2)
  if (key === 'frequence') return Number(val).toFixed(1)
  return Number(val).toFixed(0)
}

export default function HistoriquePage() {
  const [siteId, setSiteId] = useState('all')
  const [groupeId, setGroupeId] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const groupesFiltres = siteId === 'all' ? GROUPES : GROUPES.filter(g => g.site_id === siteId)

  // Fetch depuis l'API route au changement de filtre
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (siteId !== 'all') params.set('site_id', siteId)
    if (groupeId !== 'all') params.set('groupe_id', groupeId)

    fetch(`/api/historique?${params.toString()}`)
      .then(r => r.json())
      .then(rows => {
        setData(rows)
        setPage(1)
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [siteId, groupeId])

  const filtered = useMemo(() => {
    if (!search) return data
    return data.filter(row =>
      String(row.groupe ?? '').toLowerCase().includes(search.toLowerCase())
    )
  }, [data, search])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="mb-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1">
          Wona — SONELEC
        </div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          HISTORIQUE
        </h1>
        <p className="text-[13px] text-[#6b7280] mt-1">
          Relevés enregistrés — filtrage par site, groupe et recherche
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-[#e4e4e0] rounded-sm p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={siteId}
            onChange={e => { setSiteId(e.target.value); setGroupeId('all') }}
            className="border border-[#e4e4e0] rounded-sm px-3 py-1.5 text-[12px] bg-white focus:outline-none focus:border-[#1a1a1a]"
          >
            <option value="all">Tous les sites</option>
            {SITES.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>

          <select
            value={groupeId}
            onChange={e => { setGroupeId(e.target.value); setPage(1) }}
            className="border border-[#e4e4e0] rounded-sm px-3 py-1.5 text-[12px] bg-white focus:outline-none focus:border-[#1a1a1a]"
          >
            <option value="all">Tous les groupes</option>
            {groupesFiltres.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
          </select>

          <input
            type="text"
            placeholder="Rechercher un groupe..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="border border-[#e4e4e0] rounded-sm px-3 py-1.5 text-[12px] bg-white focus:outline-none focus:border-[#1a1a1a] w-48"
          />

          <div className="ml-auto text-[11px] text-[#9ca3af]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {loading ? '...' : `${filtered.length} relevés`}
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white border border-[#e4e4e0] rounded-sm overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[#e4e4e0] bg-[#f5f5f3]">
                {COLONNES.map(col => (
                  <th key={col.key} className="px-4 py-2.5 text-left font-bold uppercase tracking-widest text-[10px] text-[#9ca3af] whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={COLONNES.length} className="px-4 py-8 text-center text-[#9ca3af] text-[13px]">
                    Chargement...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={COLONNES.length} className="px-4 py-8 text-center text-[#9ca3af] text-[13px]">
                    Aucun relevé trouvé
                  </td>
                </tr>
              ) : (
                paginated.map((row, i) => (
                  <tr key={i} className="border-b border-[#f0f0ee] hover:bg-[#fafafa] transition-colors">
                    {COLONNES.map(col => (
                      <td
                        key={col.key}
                        className={`px-4 py-2.5 text-[#1a1a1a] whitespace-nowrap ${col.key === 'groupe' ? 'font-semibold' : ''}`}
                        style={col.key !== 'groupe' && col.key !== 'timestamp' ? { fontFamily: 'JetBrains Mono, monospace' } : {}}
                      >
                        {formatVal(col.key, row[col.key])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-[11px] text-[#9ca3af]">Page {page} / {totalPages}</div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-[12px] border border-[#e4e4e0] rounded-sm bg-white text-[#6b7280] hover:border-[#1a1a1a] disabled:opacity-40 transition-colors"
            >
              Précédent
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-[12px] border rounded-sm transition-colors ${
                    p === page
                      ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                      : 'bg-white text-[#6b7280] border-[#e4e4e0] hover:border-[#1a1a1a]'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-[12px] border border-[#e4e4e0] rounded-sm bg-white text-[#6b7280] hover:border-[#1a1a1a] disabled:opacity-40 transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
