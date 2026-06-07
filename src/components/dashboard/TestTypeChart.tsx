'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { TestType } from '@prisma/client';
import { testTypeMeta } from '@/lib/labels';

const COLORS: Record<TestType, string> = {
  SEGURANCA: '#ef4444',
  UNITARIO: '#3b82f6',
  INTEGRACAO: '#6366f1',
  E2E: '#a855f7',
  USABILIDADE: '#14b8a6',
  PERFORMANCE: '#f59e0b',
  UI_UX: '#ec4899',
  ACESSIBILIDADE: '#06b6d4',
};

export const TestTypeChart = ({ data }: { data: Record<TestType, number> }) => {
  const chartData = (Object.keys(data) as TestType[])
    .filter((k) => data[k] > 0)
    .map((k) => ({ name: testTypeMeta[k].label, value: data[k], type: k }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
          {chartData.map((entry) => (
            <Cell key={entry.type} fill={COLORS[entry.type]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};
