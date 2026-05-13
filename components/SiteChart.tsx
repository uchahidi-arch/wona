'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { PointHistorique } from '@/lib/data'

export default function SiteChart({ data }: { data: PointHistorique[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradPA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" />
        <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, fontFamily: 'JetBrains Mono', border: '1px solid #e4e4e0', borderRadius: 2 }}
          labelStyle={{ color: '#6b7280' }}
        />
        <Area type="monotone" dataKey="pa" stroke="#16a34a" strokeWidth={1.5} fill="url(#gradPA)" name="kWh" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
