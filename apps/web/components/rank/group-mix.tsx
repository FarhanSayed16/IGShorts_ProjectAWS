import React from 'react';

export interface GroupMixRow {
  id: string;
  label: string;
  range: string;
  count: number;
}

export interface GroupMixData {
  scope: 'chart' | 'saved';
  chartKey: string | null;
  asOf: string;
  total: number;
  groups: GroupMixRow[];
}

interface GroupMixProps {
  mix: GroupMixData;
  title: string;
  highlight?: string | null;
  context?: string;
}

const CANON: GroupMixRow[] = [
  { id: 'major', label: 'Major', range: '10 million and above', count: 0 },
  { id: 'public', label: 'Public', range: '1 million to under 10 million', count: 0 },
  { id: 'established', label: 'Established', range: '100 thousand to under 1 million', count: 0 },
  { id: 'community', label: 'Community', range: '10 thousand to under 100 thousand', count: 0 },
  { id: 'ungrouped', label: 'Not grouped yet', range: 'Known count under 10 thousand', count: 0 },
  { id: 'not_measured', label: 'Not measured yet', range: 'No usable count', count: 0 },
];

const SLICE: Record<string, string> = {
  major: 'var(--ink)',
  public: '#5c5c5c',
  established: '#8a8a8a',
  community: '#b5b5b5',
  ungrouped: '#d6d6d6',
  not_measured: '#efefef',
};

function completeGroups(groups: GroupMixRow[]): GroupMixRow[] {
  return CANON.map((slot) => {
    const found = groups.find((group) => group.id === slot.id);
    return found ? { ...slot, count: found.count, label: found.label, range: found.range } : slot;
  });
}

function colorFor(id: string, on: boolean): string {
  return on ? 'var(--accent)' : SLICE[id] || 'var(--ink)';
}

const Donut: React.FC<{ rows: GroupMixRow[]; total: number; highlight?: string | null }> = ({
  rows,
  total,
  highlight,
}) => {
  const size = 168;
  const radius = 62;
  const stroke = 16;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const slices = rows.filter((row) => row.count > 0);
  const gap = slices.length > 1 ? 3 : 0;
  let cursor = 0;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-[148px] h-[148px] sm:w-[168px] sm:h-[168px] shrink-0"
      role="img"
      aria-label={`${total} saved profiles split by audience group`}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--canvas)"
        strokeWidth={stroke}
      />
      {slices.map((group) => {
        const sweep = (group.count / total) * circumference;
        const length = Math.max(sweep - gap, 1);
        const offset = cursor;
        cursor += sweep;
        const on = highlight != null && group.id === highlight;
        return (
          <circle
            key={group.id}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colorFor(group.id, on)}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={`${length} ${circumference - length}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${center} ${center})`}
          >
            <title>{`${group.label}: ${group.count}`}</title>
          </circle>
        );
      })}
      <text
        x={center}
        y={center - 4}
        textAnchor="middle"
        fill="var(--ink)"
        fontSize="34"
        fontFamily="var(--font-display), Impact, sans-serif"
      >
        {total}
      </text>
      <text
        x={center}
        y={center + 16}
        textAnchor="middle"
        fill="var(--ink-faint)"
        fontSize="10"
        letterSpacing="1.6"
      >
        SAVED
      </text>
    </svg>
  );
};

export const GroupMix: React.FC<GroupMixProps> = ({ mix, title, highlight, context }) => {
  const rows = completeGroups(mix.groups);

  if (mix.total === 0) {
    return (
      <section className="bg-[var(--surface)] border border-[var(--line)] p-4 sm:p-6 mb-8" aria-label={title}>
        <h2 className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">{title}</h2>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">No saved profiles to split yet.</p>
      </section>
    );
  }

  const featured = [...rows.filter((row) => row.count > 0)].sort((a, b) => b.count - a.count);
  const marked = highlight ? rows.find((row) => row.id === highlight) : undefined;
  const cards =
    marked && !featured.some((row) => row.id === marked.id) ? [marked, ...featured] : featured;

  return (
    <section className="bg-[var(--surface)] border border-[var(--line)] mb-8" aria-label={title}>
      <div className="px-4 sm:px-6 pt-5 pb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">{title}</h2>
          {context && <p className="mt-2 max-w-xl text-sm text-[var(--ink-muted)]">{context}</p>}
        </div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
          {mix.total} saved profiles
        </p>
      </div>

      <div className="px-4 sm:px-6 pb-5 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
        <Donut rows={rows} total={mix.total} highlight={highlight} />
        <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 gap-3">
          {cards.map((group) => {
            const share = Math.round((group.count / mix.total) * 100);
            const on = highlight != null && group.id === highlight;
            return (
              <div
                key={group.id}
                className={`border px-4 py-4 ${on ? 'border-[var(--ink)]' : 'border-[var(--line)]'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                    <span
                      className="inline-block w-2.5 h-2.5"
                      style={{ background: colorFor(group.id, on) }}
                      aria-hidden="true"
                    />
                    {group.label}
                  </span>
                  {on && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]">
                      This profile
                    </span>
                  )}
                </div>
                <p className="mt-2 font-display text-5xl leading-none text-[var(--ink)] tabular-nums">
                  {group.count}
                </p>
                <p className="mt-2 text-xs text-[var(--ink-muted)]">
                  {share}% · {group.range}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-[var(--line)] border-t border-[var(--line)]">
        {rows.map((group) => {
          const share = Math.round((group.count / mix.total) * 100);
          const on = highlight != null && group.id === highlight;
          return (
            <li key={group.id} className="bg-[var(--surface)] px-4 py-3">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                <span
                  className="inline-block w-1.5 h-1.5"
                  style={{ background: colorFor(group.id, on) }}
                  aria-hidden="true"
                />
                {group.label}
              </span>
              <span className="mt-1 block text-sm font-semibold tabular-nums text-[var(--ink)]">
                {group.count}
                <span className="ml-1 text-[11px] font-normal text-[var(--ink-faint)]">{share}%</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
