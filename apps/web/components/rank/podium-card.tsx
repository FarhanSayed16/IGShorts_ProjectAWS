import React from 'react';
import { BillboardList } from './billboard-list';
import { ChartEntry } from '@igshorts/shared';

interface PodiumCardProps {
  entry: ChartEntry;
}

/** Kept for callers; the Billboard list now owns the #1 treatment. */
export const PodiumCard: React.FC<PodiumCardProps> = ({ entry }) => {
  return <BillboardList entries={[entry]} featured={entry.rank === 1} />;
};
