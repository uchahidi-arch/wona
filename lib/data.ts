export type Etat = 'RUNNING' | 'STOPPED' | 'ALARM'

export interface Site {
  id: string
  nom: string
  slug: string
  localisation: string
  actif: boolean
}

export interface Groupe {
  id: string
  site_id: string
  nom: string
  etat: Etat
  puissance_installee: number
}

export interface Releve {
  id: string
  groupe_id: string
  timestamp: string
  tension_l1: number; tension_l2: number; tension_l3: number
  courant_l1: number; courant_l2: number; courant_l3: number
  frequence: number
  puissance_active: number
  puissance_reactive: number
  puissance_apparente: number
  facteur_puissance: number
  temp_eau: number
  pression_huile: number
  niveau_gazoil: number
  heures_marche: number
  vitesse_rotation: number
  batterie_v: number
}

// ── MOCK DATA ──────────────────────────────────────────────────────────────

export const SITES: Site[] = [
  { id: '1', nom: 'Voidjou', slug: 'voidjou', localisation: 'Ngazidja Nord', actif: true },
  { id: '2', nom: 'Itsambouni', slug: 'itsambouni', localisation: 'Ngazidja Centre', actif: true },
  { id: '3', nom: 'Fomboni', slug: 'fomboni', localisation: 'Mwali', actif: true },
  { id: '4', nom: 'Trenani', slug: 'trenani', localisation: 'Ngazidja Sud', actif: true },
]

export const GROUPES: Groupe[] = [
  { id: 'vt1', site_id: '1', nom: '25-VT1', etat: 'RUNNING', puissance_installee: 2000 },
  { id: 'vt2', site_id: '1', nom: '25-VT2', etat: 'RUNNING', puissance_installee: 2000 },
  { id: 'vt3', site_id: '1', nom: '25-VT3', etat: 'STOPPED', puissance_installee: 2000 },
  { id: 'vt4', site_id: '1', nom: '25-VT4', etat: 'ALARM',   puissance_installee: 2000 },
  { id: 'vt5', site_id: '1', nom: '25-VT5', etat: 'RUNNING', puissance_installee: 2000 },
  { id: 'vt6', site_id: '1', nom: '25-VT6', etat: 'RUNNING', puissance_installee: 2000 },
  { id: 'vt7', site_id: '1', nom: '25-VT7', etat: 'STOPPED', puissance_installee: 2000 },
  { id: 'it1', site_id: '2', nom: '25-IT1', etat: 'RUNNING', puissance_installee: 1500 },
  { id: 'it2', site_id: '2', nom: '25-IT2', etat: 'ALARM',   puissance_installee: 1500 },
  { id: 'fb1', site_id: '3', nom: '25-FB1', etat: 'RUNNING', puissance_installee: 1000 },
  { id: 'tr1', site_id: '4', nom: '25-TR1', etat: 'STOPPED', puissance_installee: 800  },
]

export function getMockReleve(groupeId: string): Releve {
  const base = Math.random()
  return {
    id: groupeId,
    groupe_id: groupeId,
    timestamp: new Date().toISOString(),
    tension_l1: 400 + Math.random() * 10 - 5,
    tension_l2: 402 + Math.random() * 10 - 5,
    tension_l3: 404 + Math.random() * 10 - 5,
    courant_l1: 1240 + Math.random() * 50,
    courant_l2: 1290 + Math.random() * 50,
    courant_l3: 1290 + Math.random() * 50,
    frequence: 49 + Math.random() * 2 - 1,
    puissance_active: 771 + Math.random() * 50,
    puissance_reactive: 458 + Math.random() * 30,
    puissance_apparente: 897 + Math.random() * 40,
    facteur_puissance: 0.80 + Math.random() * 0.15,
    temp_eau: 78 + Math.random() * 10,
    pression_huile: 4.2 + Math.random() * 0.5,
    niveau_gazoil: 60 + Math.random() * 30,
    heures_marche: 8420 + Math.floor(Math.random() * 100),
    vitesse_rotation: 1500 + Math.random() * 10 - 5,
    batterie_v: 24 + Math.random() * 4,
  }
}

export function getMockHistorique(groupeId: string): Array<{time: string, pa: number, pr: number, papp: number}> {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2,'0')}:00`,
    pa: 700 + Math.random() * 200,
    pr: 400 + Math.random() * 100,
    papp: 850 + Math.random() * 100,
  }))
}

export function getSiteEtat(siteId: string): Etat {
  const groupes = GROUPES.filter(g => g.site_id === siteId)
  if (groupes.some(g => g.etat === 'ALARM')) return 'ALARM'
  if (groupes.every(g => g.etat === 'STOPPED')) return 'STOPPED'
  return 'RUNNING'
}

export function getSitePuissance(siteId: string): number {
  return GROUPES
    .filter(g => g.site_id === siteId && g.etat === 'RUNNING')
    .reduce((sum, g) => sum + g.puissance_installee, 0)
}

export function etatColor(etat: Etat): string {
  if (etat === 'RUNNING') return '#16a34a'
  if (etat === 'ALARM')   return '#ea580c'
  return '#6b7280'
}

export function etatBg(etat: Etat): string {
  if (etat === 'RUNNING') return '#f0fdf4'
  if (etat === 'ALARM')   return '#fff7ed'
  return '#f9fafb'
}

export function etatBorder(etat: Etat): string {
  if (etat === 'RUNNING') return '#bbf7d0'
  if (etat === 'ALARM')   return '#fed7aa'
  return '#e5e7eb'
}
