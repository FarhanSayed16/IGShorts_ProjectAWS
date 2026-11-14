/**
 * Legal in-browser playback catalog for IGshorts.
 *
 * Playable in-app (HTML5 Audio):
 * - Public demo / CC-friendly MP3 beds (SoundHelix examples)
 * - Public internet radio streams (HTTPS Radio Browser stations)
 *
 * Not streamed ourselves (outbound SP / YT / official embeds only):
 * - Spotify / Apple commercial catalog without their SDKs + licenses
 * - Arbitrary YouTube audio outside the YouTube iframe player
 */

export type PlaybackMode = 'stream' | 'radio' | 'synth' | 'unavailable';

export function isDemoBedUrl(url: string | null | undefined): boolean {
  return Boolean(url && url.includes('soundhelix.com'));
}

export interface RadioStation {
  id: string;
  name: string;
  tagline: string;
  streamUrl: string;
  homepage?: string;
  artworkUrl?: string;
}

/** Verified HTTPS live stations (lofi / chill / India-friendly). */
export const LIVE_RADIO_STATIONS: RadioStation[] = [
  {
    id: 'radio-chillhop',
    name: 'I Love Chillhop',
    tagline: 'Live 24/7 chillhop',
    streamUrl:
      'https://ilm.stream12.radiohost.de/ilm_ilovechillhop_mp3-192?upd-meta&upd-scheme=https',
    homepage: 'https://ilovemusic.de/',
    artworkUrl:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'radio-isekoi-chill',
    name: 'ISEKOI Chill Zone',
    tagline: 'Live downtempo & liquid',
    streamUrl: 'https://public.isekoi-radio.com/listen/chill/radio.mp3',
    homepage: 'https://isekoi-radio.com',
    artworkUrl:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'radio-digital-malayali',
    name: 'India Digital Radio',
    tagline: 'Live Indian lo-fi mix',
    streamUrl: 'https://radio.digitalmalayali.in/listen/stream/radio.mp3',
    homepage: 'https://radio.digitalmalayali.in/',
    artworkUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
  },
];

/**
 * Demo MP3 beds (SoundHelix public examples) assigned to editorial cards
 * so Preview plays real audio immediately without Spotify licensing.
 * Spotify/YouTube remain the path for commercial full tracks.
 */
const DEMO_BEDS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
] as const;

const TITLE_STREAMS: Record<string, string> = {
  'midnight drive': DEMO_BEDS[0],
  'city lights': DEMO_BEDS[1],
  'signal noise': DEMO_BEDS[2],
  'afterglow loop': DEMO_BEDS[3],
  'monsoon frequency': DEMO_BEDS[4],
  'studio warmup': DEMO_BEDS[5],
  'midnight echoes': DEMO_BEDS[0],
  'neon horizon': DEMO_BEDS[1],
  'golden hour groove': DEMO_BEDS[2],
  'coffee & vinyl': DEMO_BEDS[3],
};

export function resolveTrackStreamUrl(title: string, explicitUrl?: string | null): string | null {
  if (explicitUrl) return explicitUrl;
  const key = title.trim().toLowerCase();
  if (TITLE_STREAMS[key]) return TITLE_STREAMS[key];
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash + key.charCodeAt(i) * (i + 1)) % DEMO_BEDS.length;
  }
  return DEMO_BEDS[hash] || DEMO_BEDS[0];
}

export function stationToPlayable(station: RadioStation) {
  return {
    id: station.id,
    title: station.name,
    artist: station.tagline,
    audio_url: station.streamUrl,
    artwork_url: station.artworkUrl ?? null,
    mode: 'radio' as const,
    source_note: 'Live radio stream',
    spotify_search_url: station.homepage,
  };
}

export function extractSpotifyEmbedUrl(spotifyUrl: string | null | undefined): string | null {
  if (!spotifyUrl) return null;
  const track = spotifyUrl.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (track) return `https://open.spotify.com/embed/track/${track[1]}?utm_source=igshorts`;
  const playlist = spotifyUrl.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
  if (playlist) return `https://open.spotify.com/embed/playlist/${playlist[1]}?utm_source=igshorts`;
  return null;
}

export function playbackBadge(mode?: PlaybackMode | string | null, sourceNote?: string | null): string {
  if (mode === 'unavailable') return 'STREAM UNAVAILABLE';
  if (mode === 'radio') return 'LIVE RADIO';
  if (mode === 'synth') return 'AMBIENT FALLBACK';
  if (mode === 'stream') {
    if (sourceNote && /preview bed/i.test(sourceNote)) return 'PREVIEW BED';
    if (sourceNote && /licensed/i.test(sourceNote)) return 'LICENSED STREAM';
    return 'PREVIEW BED';
  }
  if (sourceNote) {
    if (/unavailable/i.test(sourceNote)) return 'STREAM UNAVAILABLE';
    if (/preview bed/i.test(sourceNote)) return 'PREVIEW BED';
    if (/live radio/i.test(sourceNote)) return 'LIVE RADIO';
    return sourceNote.toUpperCase().slice(0, 28);
  }
  return 'PREVIEW BED';
}
