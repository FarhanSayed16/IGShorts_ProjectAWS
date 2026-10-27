import React from 'react';
import {
  AUDIENCE_GROUPS,
  AudienceGroupId,
  FRESHNESS_LABEL,
  FreshnessState,
} from '@/lib/format/audience-group';

interface GroupLadderProps {
  group: AudienceGroupId | null;
  freshness: FreshnessState;
  count?: number | null;
}

const TOP_FIRST = [...AUDIENCE_GROUPS].reverse();

export const GroupLadder: React.FC<GroupLadderProps> = ({ group, freshness, count }) => {
  const active = AUDIENCE_GROUPS.find((item) => item.id === group);
  const unmeasured = count === null;
  const title = unmeasured ? 'Not measured yet' : active ? active.label : 'Not grouped yet';
  const detail = unmeasured
    ? 'No usable follower count yet.'
    : active
      ? active.range
      : 'Under 10 thousand.';

  return (
    <section className="bg-[var(--surface)] border border-[var(--line)] p-4 sm:p-6 mb-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">Audience group</h2>
          <p className="mt-1 font-display text-3xl text-[var(--ink)] leading-none">{title}</p>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">{detail}</p>
        </div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
          {FRESHNESS_LABEL[freshness]}
        </p>
      </div>
      <ol className="grid gap-2">
        {TOP_FIRST.map((item) => {
          const on = item.id === group;
          return (
            <li
              key={item.id}
              aria-current={on ? 'true' : undefined}
              className={`flex items-center justify-between gap-4 border px-3 py-2 ${
                on
                  ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]'
                  : 'border-[var(--line)] text-[var(--ink-muted)]'
              }`}
            >
              <span className="text-sm font-semibold">{item.label}</span>
              <span className={`text-xs ${on ? 'text-[var(--surface)]' : 'text-[var(--ink-faint)]'}`}>
                {item.range}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-[var(--ink-faint)]">
        This is an audience size, not a rank on all of Instagram.
      </p>
    </section>
  );
};
