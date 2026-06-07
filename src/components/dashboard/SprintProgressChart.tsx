'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Item = { number: number; title: string; passou: number; falhou: number; pendente: number };

export const SprintProgressChart = ({ data }: { data: Item[] }) => {
  const chartData = data.map((d) => ({ name: `S${d.number}`, Passou: d.passou, Falhou: d.falhou, Pendente: d.pendente }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }}
          cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Passou" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Falhou" stackId="a" fill="#ef4444" />
        <Bar dataKey="Pendente" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
