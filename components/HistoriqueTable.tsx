'use client'
import { useEffect, useState } from 'react'

// Fetche les 8 derniers relevés du groupe depuis /api/historique

interface Row {
  timestamp: string
  tension_l1: number
  frequence: number
  puissance_active: number
  facteur_puissance: number
}

export default function HistoriqueTable({ groupeId }: { groupeId: string }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/historique?groupe_id=${groupeId}`)
      .then(r => r.json())
      .then(data => setRows(data.slice(0, 8)))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [groupeId])

  return (
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
          {loading ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-[#9ca3af] text-[12px]">Chargement...</td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-[#9ca3af] text-[12px]">Aucun relevé disponible</td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-b border-[#f5f5f3] hover:bg-[#f9f9f8]">
                <td className="py-2 pr-6 font-mono text-[#6b7280]" style={{ fontFamily: 'JetBrains Mono' }}>
                  {new Date(row.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-2 pr-6 font-mono font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>
                  {Number(row.tension_l1).toFixed(1)}
                </td>
                <td className="py-2 pr-6 font-mono font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>
                  {Number(row.frequence).toFixed(2)}
                </td>
                <td className="py-2 pr-6 font-mono font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>
                  {Number(row.puissance_active).toFixed(0)}
                </td>
                <td className="py-2 font-mono font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>
                  {Number(row.facteur_puissance).toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
