/**
 * lib/influx.ts
 * Toutes les requêtes InfluxDB v2.
 *
 * Variables d'environnement requises dans .env.local :
 *   INFLUX_URL=http://localhost:8086
 *   INFLUX_TOKEN=ton_token_ici
 *   INFLUX_ORG=ton_org
 *   INFLUX_BUCKET=ton_bucket
 *
 * Installation : npm install @influxdata/influxdb-client
 */

import { InfluxDB } from '@influxdata/influxdb-client'
import type { Releve, PointHistorique } from './data'

// ── Client ────────────────────────────────────────────────────────────────

const client = new InfluxDB({
  url:   process.env.INFLUX_URL!,
  token: process.env.INFLUX_TOKEN!,
})

const org    = process.env.INFLUX_ORG!
const bucket = process.env.INFLUX_BUCKET!

// ── Dernier relevé d'un groupe ────────────────────────────────────────────
//
// Appelé depuis : app/site/[slug]/page.tsx  →  getMockReleve(groupe.id)
//                 app/site/[slug]/groupe/[id]/page.tsx  →  getMockReleve(id)
//
// Remplace : getMockReleve(groupeId)

export async function getReleve(groupeId: string): Promise<Releve> {
  const queryApi = client.getQueryApi(org)

  // Flux query : dernier point pour ce groupe sur les 10 dernières minutes
  const query = `
    from(bucket: "${bucket}")
      |> range(start: -10m)
      |> filter(fn: (r) => r["groupe_id"] == "${groupeId}")
      |> last()
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
  `

  const rows: Record<string, number | string>[] = []

  await new Promise<void>((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        rows.push(tableMeta.toObject(row))
      },
      error(err) { reject(err) },
      complete()  { resolve() },
    })
  })

  const r = rows[0] ?? {}

  // Mapping champs InfluxDB → interface Releve
  // Adapter les noms de champs selon ce que Telegraf pousse réellement
  return {
    id:                groupeId,
    groupe_id:         groupeId,
    timestamp:         String(r['_time'] ?? new Date().toISOString()),
    tension_l1:        Number(r['tension_l1']        ?? 0),
    tension_l2:        Number(r['tension_l2']        ?? 0),
    tension_l3:        Number(r['tension_l3']        ?? 0),
    courant_l1:        Number(r['courant_l1']        ?? 0),
    courant_l2:        Number(r['courant_l2']        ?? 0),
    courant_l3:        Number(r['courant_l3']        ?? 0),
    frequence:         Number(r['frequence']         ?? 0),
    puissance_active:  Number(r['puissance_active']  ?? 0),
    puissance_reactive:Number(r['puissance_reactive']?? 0),
    puissance_apparente:Number(r['puissance_apparente']??0),
    facteur_puissance: Number(r['facteur_puissance'] ?? 0),
    temp_eau:          Number(r['temp_eau']          ?? 0),
    pression_huile:    Number(r['pression_huile']    ?? 0),
    niveau_gazoil:     Number(r['niveau_gazoil']     ?? 0),
    heures_marche:     Number(r['heures_marche']     ?? 0),
    vitesse_rotation:  Number(r['vitesse_rotation']  ?? 0),
    batterie_v:        Number(r['batterie_v']        ?? 0),
  }
}

// ── Historique 24h d'un groupe ────────────────────────────────────────────
//
// Appelé depuis : app/site/[slug]/page.tsx  →  getMockHistorique('site')
//                 app/site/[slug]/groupe/[id]/page.tsx  →  getMockHistorique(id)
//
// Remplace : getMockHistorique(groupeId)

export async function getHistorique(groupeId: string): Promise<PointHistorique[]> {
  const queryApi = client.getQueryApi(org)

  // Agrégation par heure sur 24h
  const query = `
    from(bucket: "${bucket}")
      |> range(start: -24h)
      |> filter(fn: (r) => r["groupe_id"] == "${groupeId}")
      |> filter(fn: (r) =>
          r["_field"] == "puissance_active" or
          r["_field"] == "puissance_reactive" or
          r["_field"] == "puissance_apparente"
        )
      |> aggregateWindow(every: 1h, fn: mean, createEmpty: false)
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
  `

  const points: PointHistorique[] = []

  await new Promise<void>((resolve, reject) => {
    queryApi.queryRows(query, {
      next(row, tableMeta) {
        const r = tableMeta.toObject(row)
        const t = new Date(String(r['_time']))
        points.push({
          time: `${String(t.getHours()).padStart(2, '0')}:00`,
          pa:   Number(r['puissance_active']   ?? 0),
          pr:   Number(r['puissance_reactive'] ?? 0),
          papp: Number(r['puissance_apparente']?? 0),
        })
      },
      error(err) { reject(err) },
      complete()  { resolve() },
    })
  })

  return points
}
