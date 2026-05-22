"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function SeasonCharts({
  data,
}: {
  data: { month: string; goals: number; cards: number; matches: number }[];
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted">Нет закрытых матчей для графиков</p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="month" tick={{ fill: "#888", fontSize: 11 }} />
          <YAxis tick={{ fill: "#888", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: 8,
            }}
          />
          <Legend />
          <Bar dataKey="goals" name="Голы" fill="#00e676" radius={[4, 4, 0, 0]} />
          <Bar dataKey="cards" name="Карточки" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="matches" name="Матчи" fill="#64748b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
