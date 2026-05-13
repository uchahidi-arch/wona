import { NextRequest, NextResponse } from 'next/server'
import { InfluxDB } from '@influxdata/influxdb-client'
import { GROUPES } from '@/lib/data'

// GET /api/historique?site_id=1&groupe_id=vt1
// Retourne les relevés des dernières 24h, un point par heure par groupe.

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const siteId   = searchParams.get('site_id')
    const groupeId = searchParams.get('groupe_id')

    // Détermine quels groupe_ids interroger
    let groupeIds: string[]
    if (groupeId) {
      groupeIds = [groupeId]
    } else if (siteId) {
      groupeIds = GROUPES.filter(g => g.site_id === siteId).map(g => g.id)
    } else {
      groupeIds = GROUPES.map(g => g.id)
    }

    const client = new InfluxDB({
      url:   process.env.INFLUX_URL!,
      token: process.env.INFLUX_TOKEN!,
    })

    const queryApi = client.getQueryApi(process.env.INFLUX_ORG!)
    const bucket   = process.env.INFLUX_BUCKET!

    // Filtre Flux sur les groupe_ids
    const tagFilter = groupeIds
      .map(id => `r["groupe_id"] == "${id}"`)
      .join(' or ')

    const query = `
      from(bucket: "${bucket}")
        |> range(start: -24h)
        |> filter(fn: (r) => r["_measurement"] == "releve_groupe")
        |> filter(fn: (r) => ${tagFilter})
        |> pivot(rowKey: ["_time", "groupe_id"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"], desc: true)
    `

    const rows: any[] = []

    await new Promise<void>((resolve, reject) => {
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const r = tableMeta.toObject(row)
          const groupe = GROUPES.find(g => g.id === r['groupe_id'])
          rows.push({
            timestamp:         r['_time'],
            groupe:            groupe?.nom ?? r['groupe_id'],
            groupe_id:         r['groupe_id'],
            site_id:           groupe?.site_id ?? '',
            tension_l1:        r['tension_l1']         ?? 0,
            frequence:         r['frequence']          ?? 0,
            puissance_active:  r['puissance_active']   ?? 0,
            puissance_reactive:r['puissance_reactive'] ?? 0,
            facteur_puissance: r['facteur_puissance']  ?? 0,
            courant_l1:        r['courant_l1']         ?? 0,
            temp_eau:          r['temp_eau']           ?? 0,
            niveau_gazoil:     r['niveau_gazoil']      ?? 0,
          })
        },
        error(err) { reject(err) },
        complete()  { resolve() },
      })
    })

    return NextResponse.json(rows)
  } catch (err: any) {
    console.error('[GET /api/historique]', err)
    return NextResponse.json([], { status: 200 }) // retourne [] si InfluxDB pas encore connecté
  }
}
