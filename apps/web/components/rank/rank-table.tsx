import React from 'react';
import { ChartEntry } from '@igshorts/shared';
import { BillboardList } from './billboard-list';

interface RankTableProps {
  entries: ChartEntry[];
  compact?: boolean;
  caption?: string;
}

export const RankTable: React.FC<RankTableProps> = ({ entries, compact = false, caption }) => {
  return <BillboardList entries={entries} featured={!compact} caption={caption} />;
};
