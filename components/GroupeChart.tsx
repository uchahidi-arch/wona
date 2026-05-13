'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import type { PointHistorique } from '@/lib/data'

export default function GroupeChart({ data }: { data: PointHistorique[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" />
        <XAxis dataKey="time" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={3} />
        <YAxis tick={{ fontSize: 10, fontFamily: 'JetBrains Mono', fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono', border: '1px solid #e4e4e0', borderRadius: 2 }} />
        <Legend iconSize={8} iconType="line" wrapperStyle={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} />
        <Line type="monotone" dataKey="pa"   stroke="#16a34a" strokeWidth={1.5} dot={false} name="P. Active" />
        <Line type="monotone" dataKey="pr"   stroke="#ea580c" strokeWidth={1.5} dot={false} name="P. Réactive" />
        <Line type="monotone" dataKey="papp" stroke="#2563eb" strokeWidth={1.5} dot={false} name="P. Apparente" />
      </LineChart>
    </ResponsiveContainer>
  )
}
