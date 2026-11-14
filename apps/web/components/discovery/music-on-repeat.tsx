import React from 'react';
import { MusicTrackCard } from '@igshorts/shared';
import { MusicCollection } from './music-collection';

export function MusicOnRepeat({ tracks }: { tracks: MusicTrackCard[] }) {
  return <MusicCollection title="Music on Repeat" tracks={tracks} />;
}
