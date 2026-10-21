'use client';

import React, { useEffect, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function HistoryChart({
  data,
}: {
  data: { observed_at: string; follower_count: number | null }[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const points = data
    .filter((row) => row.follower_count != null)
    .map((row) => {
      const d = new Date(row.observed_at);
      return {
        date: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
        followers: row.follower_count as number,
      };
    })
    .reverse();

  if (!mounted || points.length < 2) return null;

  return (
    <div className="h-48 w-full mb-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--neutral-400)' }} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--neutral-400)' }} width={64} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--brand-deep)',
              borderColor: 'var(--brand-slate)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#fff',
            }}
          />
          <Line
            type="monotone"
            dataKey="followers"
            stroke="var(--brand-accent)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
