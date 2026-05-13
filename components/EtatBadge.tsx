import type { Etat } from '@/lib/data'

export default function EtatBadge({ etat, large }: { etat: Etat; large?: boolean }) {
  const cfg = {
    RUNNING: { color: 'var(--green)', bg: '#eef7f1', border: '#b6dfc5', dot: true,  label: 'EN MARCHE' },
    STOPPED: { color: '#6b7280',      bg: '#f9fafb', border: '#e5e7eb', dot: false, label: 'ARRÊTÉ'   },
    ALARM:   { color: 'var(--red)',   bg: '#fef2f2', border: '#fecaca', dot: true,  label: 'ALARME'   },
  }[etat]

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold tracking-widest border ${
        large ? 'text-[13px] px-3 py-1.5' : 'text-[10px] px-2 py-0.5'
      }`}
      style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
    >
      {cfg.dot && (
        <span
          className={`rounded-full ${etat === 'ALARM' ? 'animate-pulse' : ''}`}
          style={{ background: cfg.color, width: large ? 7 : 5, height: large ? 7 : 5, display: 'inline-block' }}
        />
      )}
      {cfg.label}
    </span>
  )
}
