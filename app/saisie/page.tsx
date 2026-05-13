'use client'
import { useState } from 'react'
import { SITES, GROUPES } from '@/lib/data'

// Pas de mock ici — SITES et GROUPES sont des constantes statiques.
// Le submit envoie les données vers /api/releve qui écrit dans InfluxDB.

const CHAMPS = [
  { key: 'tension_l1', label: 'Tension L1', unit: 'V', min: 350, max: 450 },
  { key: 'tension_l2', label: 'Tension L2', unit: 'V', min: 350, max: 450 },
  { key: 'tension_l3', label: 'Tension L3', unit: 'V', min: 350, max: 450 },
  { key: 'courant_l1', label: 'Courant L1', unit: 'A', min: 0, max: 2000 },
  { key: 'courant_l2', label: 'Courant L2', unit: 'A', min: 0, max: 2000 },
  { key: 'courant_l3', label: 'Courant L3', unit: 'A', min: 0, max: 2000 },
  { key: 'frequence', label: 'Fréquence', unit: 'Hz', min: 45, max: 55 },
  { key: 'puissance_active', label: 'Puissance Active', unit: 'kW', min: 0, max: 2000 },
  { key: 'puissance_reactive', label: 'Puissance Réactive', unit: 'kVAR', min: 0, max: 1500 },
  { key: 'puissance_apparente', label: 'Puissance Apparente', unit: 'kVA', min: 0, max: 2000 },
  { key: 'facteur_puissance', label: 'Facteur de puissance', unit: '', min: 0, max: 1 },
  { key: 'temp_eau', label: 'Température eau', unit: '°C', min: 60, max: 100 },
  { key: 'pression_huile', label: 'Pression huile', unit: 'bar', min: 2, max: 8 },
  { key: 'niveau_gazoil', label: 'Niveau gazoil', unit: '%', min: 0, max: 100 },
  { key: 'vitesse_rotation', label: 'Vitesse rotation', unit: 'tr/min', min: 1450, max: 1550 },
]

export default function SaisiePage() {
  const [siteId, setSiteId] = useState('')
  const [groupeId, setGroupeId] = useState('')
  const [valeurs, setValeurs] = useState<Record<string, string>>({})
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16))
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const groupesFiltres = GROUPES.filter(g => g.site_id === siteId)

  const handleChange = (key: string, val: string) => {
    setValeurs(prev => ({ ...prev, [key]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)

    try {
      // Envoie vers l'API route /api/releve qui écrit dans InfluxDB
      const res = await fetch('/api/releve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupe_id: groupeId,
          timestamp: new Date(timestamp).toISOString(),
          ...Object.fromEntries(
            Object.entries(valeurs).map(([k, v]) => [k, parseFloat(v)])
          ),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur serveur')
      }

      setSent(true)
    } catch (err: any) {
      setError(err.message ?? 'Erreur inconnue')
    } finally {
      setSending(false)
    }
  }

  const reset = () => {
    setValeurs({})
    setSent(false)
    setError(null)
    setSiteId('')
    setGroupeId('')
    setTimestamp(new Date().toISOString().slice(0, 16))
  }

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f5f5f3]">
        <div className="bg-white border border-[#bbf7d0] rounded-sm p-8 text-center max-w-sm w-full">
          <div className="text-4xl font-bold text-[#16a34a] mb-2" style={{ fontFamily: 'JetBrains Mono' }}>✓</div>
          <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
            RELEVÉ ENREGISTRÉ
          </h2>
          <p className="text-[13px] text-[#6b7280] mb-1">
            {GROUPES.find(g => g.id === groupeId)?.nom} — {SITES.find(s => s.id === siteId)?.nom}
          </p>
          <p className="text-[11px] font-mono text-[#9ca3af] mb-6">
            {new Date(timestamp).toLocaleString('fr-FR')}
          </p>
          <button
            onClick={reset}
            className="w-full bg-[#1a1a1a] text-white text-[13px] font-semibold py-3 rounded-sm hover:bg-[#333] transition-colors"
          >
            Nouveau relevé
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
          SAISIE TERRAIN
        </h1>
        <p className="text-[12px] text-[#9ca3af] mt-0.5">15 paramètres — Optimisé mobile</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Site + Groupe */}
        <div className="bg-white border border-[#e4e4e0] rounded-sm p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3">
            Localisation
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] text-[#6b7280] font-medium mb-1.5 block">Site</label>
              <select
                required
                value={siteId}
                onChange={e => { setSiteId(e.target.value); setGroupeId('') }}
                className="w-full border border-[#e4e4e0] rounded-sm px-3 py-3 text-[14px] bg-white appearance-none"
              >
                <option value="">Sélectionner un site</option>
                {SITES.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[#6b7280] font-medium mb-1.5 block">Groupe</label>
              <select
                required
                value={groupeId}
                onChange={e => setGroupeId(e.target.value)}
                disabled={!siteId}
                className="w-full border border-[#e4e4e0] rounded-sm px-3 py-3 text-[14px] bg-white appearance-none disabled:opacity-40"
              >
                <option value="">Sélectionner un groupe</option>
                {groupesFiltres.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Champs */}
        {[
          { titre: '⚡ Système électrique', keys: ['tension_l1','tension_l2','tension_l3','courant_l1','courant_l2','courant_l3','frequence','puissance_active','puissance_reactive','puissance_apparente','facteur_puissance'] },
          { titre: '⚙ Système mécanique', keys: ['temp_eau','pression_huile','niveau_gazoil','vitesse_rotation'] },
        ].map(section => (
          <div key={section.titre} className="bg-white border border-[#e4e4e0] rounded-sm p-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3">
              {section.titre}
            </div>
            <div className="flex flex-col gap-3">
              {section.keys.map(key => {
                const champ = CHAMPS.find(c => c.key === key)!
                const val = parseFloat(valeurs[key] || '')
                const isOutOfRange = !isNaN(val) && (val < champ.min || val > champ.max)
                return (
                  <div key={key}>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <label className="text-[12px] font-medium text-[#1a1a1a]">{champ.label}</label>
                      <span className="text-[10px] text-[#9ca3af]">{champ.min} — {champ.max} {champ.unit}</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        placeholder={`Ex: ${((champ.min + champ.max) / 2).toFixed(1)}`}
                        value={valeurs[key] || ''}
                        onChange={e => handleChange(key, e.target.value)}
                        className={`w-full border rounded-sm px-3 py-3 text-[16px] font-mono pr-14 ${
                          isOutOfRange
                            ? 'border-[#ea580c] bg-[#fff7ed] text-[#ea580c]'
                            : valeurs[key]
                              ? 'border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]'
                              : 'border-[#e4e4e0] bg-white text-[#1a1a1a]'
                        }`}
                        style={{ fontFamily: 'JetBrains Mono' }}
                      />
                      {champ.unit && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9ca3af] font-mono">
                          {champ.unit}
                        </span>
                      )}
                    </div>
                    {isOutOfRange && (
                      <p className="text-[11px] text-[#ea580c] mt-1 font-medium">
                        Valeur hors plage normale
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Heure relevé */}
        <div className="bg-white border border-[#e4e4e0] rounded-sm p-4">
          <label className="text-[11px] text-[#6b7280] font-medium mb-1.5 block">Heure du relevé</label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={e => setTimestamp(e.target.value)}
            className="w-full border border-[#e4e4e0] rounded-sm px-3 py-3 text-[14px] bg-white"
          />
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-sm px-4 py-3 text-[13px] text-[#ea580c] font-medium">
            ⚠ {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!siteId || !groupeId || sending}
          className="w-full bg-[#1a1a1a] text-white text-[14px] font-bold py-4 rounded-sm disabled:opacity-40 transition-opacity"
          style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em' }}
        >
          {sending ? 'ENREGISTREMENT...' : 'ENREGISTRER LE RELEVÉ'}
        </button>

      </form>
    </div>
  )
}
