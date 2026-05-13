import { NextRequest, NextResponse } from 'next/server'
import { InfluxDB, Point } from '@influxdata/influxdb-client'

// POST /api/releve
// Body JSON : { groupe_id, timestamp, tension_l1, frequence, ... }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { groupe_id, timestamp, ...champs } = body

    if (!groupe_id) {
      return NextResponse.json({ error: 'groupe_id manquant' }, { status: 400 })
    }

    const client = new InfluxDB({
      url:   process.env.INFLUX_URL!,
      token: process.env.INFLUX_TOKEN!,
    })

    const writeApi = client.getWriteApi(
      process.env.INFLUX_ORG!,
      process.env.INFLUX_BUCKET!,
      'ms' // précision milliseconde
    )

    const point = new Point('releve_groupe')
      .tag('groupe_id', groupe_id)
      .timestamp(timestamp ? new Date(timestamp) : new Date())

    // Ajoute tous les champs numériques dynamiquement
    for (const [key, value] of Object.entries(champs)) {
      if (typeof value === 'number' && !isNaN(value)) {
        point.floatField(key, value)
      }
    }

    writeApi.writePoint(point)
    await writeApi.close()

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[POST /api/releve]', err)
    return NextResponse.json({ error: err.message ?? 'Erreur serveur' }, { status: 500 })
  }
}
