"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function PlayerGoalSparkline({
  data,
}: {
  data: { label: string; goals: number }[];
}) {
  if (data.length < 2) return null;

  return (
    <div className="h-36 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#888" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "#888" }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip
            contentStyle={{
              background: "#141414",
              border: "1px solid #333",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="goals"
            stroke="#00e676"
            strokeWidth={2}
            dot={{ r: 3, fill: "#00e676" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
