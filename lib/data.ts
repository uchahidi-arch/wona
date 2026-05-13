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

export interface PointHistorique {
  time: string
  pa: number
  pr: number
  papp: number
}

// ── DONNÉES STATIQUES (ne changent pas) ───────────────────────────────────

export const SITES: Site[] = [
  { id: '1', nom: 'Voidjou',     slug: 'voidjou',     localisation: 'Ngazidja Nord',   actif: true },
  { id: '2', nom: 'Itsambouni', slug: 'itsambouni', localisation: 'Ngazidja Centre', actif: true },
  { id: '3', nom: 'Fomboni',    slug: 'fomboni',    localisation: 'Mwali',           actif: true },
  { id: '4', nom: 'Trenani',    slug: 'trenani',    localisation: 'Ndzuani',    actif: true },
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

// ── HELPERS (calculs sur les constantes) ──────────────────────────────────

export function getSiteEtat(siteId: string): Etat {
  const groupes = GROUPES.filter(g => g.site_id === siteId)
  if (groupes.some(g => g.etat === 'ALARM'))    return 'ALARM'
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
