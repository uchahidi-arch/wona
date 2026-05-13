'use client'

interface GaugeProps {
  value: number
  min: number
  max: number
  unit: string
  label: string
  size?: number
  decimals?: number
}

function getColor(pct: number): string {
  if (pct < 0.6) return '#1A6B3C'
  if (pct < 0.85) return '#F5A623'
  return '#dc2626'
}

export default function Gauge({ value, min, max, unit, label, size = 140, decimals = 1 }: GaugeProps) {
  const pct = Math.min(Math.max((value - min) / (max - min), 0), 1)
  const color = getColor(pct)

  const cx = size / 2
  const cy = size / 2
  const r = size * 0.36
  const startAngle = -200
  const sweepAngle = 220
  const endAngle = startAngle + sweepAngle * pct

  function polarToXY(angleDeg: number, radius: number) {
    const rad = (angleDeg * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  function arcPath(startDeg: number, endDeg: number, radius: number) {
    const s = polarToXY(startDeg, radius)
    const e = polarToXY(endDeg, radius)
    const large = endDeg - startDeg > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`
  }

  const strokeW = size * 0.058

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size * 0.85} viewBox={`0 0 ${size} ${size}`}>
        <path d={arcPath(startAngle, startAngle + sweepAngle, r)} fill="none" stroke="#e4e4e0" strokeWidth={strokeW} strokeLinecap="round" />
        {pct > 0 && (
          <path d={arcPath(startAngle, endAngle, r)} fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
        )}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const angle = startAngle + sweepAngle * t
          const inner = polarToXY(angle, r - strokeW * 1.1)
          const outer = polarToXY(angle, r + strokeW * 0.4)
          return <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#9ca3af" strokeWidth="1" />
        })}
        {(() => {
          const minPos = polarToXY(startAngle + 8, r + strokeW * 1.8)
          const maxPos = polarToXY(startAngle + sweepAngle - 8, r + strokeW * 1.8)
          return (
            <>
              <text x={minPos.x} y={minPos.y} fontSize={size * 0.075} fill="#9ca3af" textAnchor="middle" fontFamily="JetBrains Mono, monospace">{min}</text>
              <text x={maxPos.x} y={maxPos.y} fontSize={size * 0.075} fill="#9ca3af" textAnchor="middle" fontFamily="JetBrains Mono, monospace">{max}</text>
            </>
          )
        })()}
        <text x={cx} y={cy + r * 0.2} textAnchor="middle" fontSize={size * 0.18} fontWeight="700" fill={color} fontFamily="JetBrains Mono, monospace">
          {value.toFixed(decimals)}
        </text>
        <text x={cx} y={cy + r * 0.45} textAnchor="middle" fontSize={size * 0.09} fill="#6b7280" fontFamily="Inter, sans-serif">
          {unit}
        </text>
      </svg>
      <span className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide text-center leading-tight">
        {label}
      </span>
    </div>
  )
}
