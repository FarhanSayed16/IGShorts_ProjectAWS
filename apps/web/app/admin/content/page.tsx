'use client';

import React, { useEffect, useState } from 'react';
import { Clapperboard, Music2, Radio, TrendingUp, RefreshCw, Play } from 'lucide-react';
import { MusicTrackCard } from '@igshorts/shared';
import { fetchMusicTracks, fetchPulseToday, fetchTrends } from '@/lib/api/client';
import { updateMusicPreviewUrl } from '@/lib/api/admin-client';

export default function AdminContentPage() {
  const [tracks, setTracks] = useState<MusicTrackCard[]>([]);
  const [trendCount, setTrendCount] = useState<number | null>(null);
  const [pulseSlots, setPulseSlots] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [music, trends, pulse] = await Promise.all([
        fetchMusicTracks({ limit: 24 }),
        fetchTrends({ limit: 1 }),
        fetchPulseToday(),
      ]);
      setTracks(music.data ?? []);
      const nextDrafts: Record<string, string> = {};
      for (const t of music.data ?? []) {
        nextDrafts[t.id] = t.previewAudioUrl || '';
      }
      setDrafts(nextDrafts);
      setTrendCount(trends.meta?.total ?? music.data?.length ?? 0);
      setPulseSlots(pulse.items?.length ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load content studio data.');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const savePreview = async (id: string) => {
    setSavingId(id);
    setNotice('');
    setError('');
    try {
      const url = (drafts[id] || '').trim() || null;
      await updateMusicPreviewUrl(id, url);
      setNotice(`Saved preview URL for track ${id.slice(0, 8)}…`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save preview URL');
    } finally {
      setSavingId(null);
    }
  };

  const playPreview = (id: string, url: string) => {
    if (!url) return;
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    audio.pause();
    audio.src = url;
    setPreviewId(id);
    audio.play().catch(() => {
      setError('Could not play that preview URL in-browser.');
      setPreviewId(null);
    });
    audio.onended = () => setPreviewId(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--brand-slate)]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#00d26a] mb-2">
            OCC Content Studio
          </p>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Content
          </h1>
          <p className="text-xs text-[var(--neutral-400)] mt-1.5 max-w-xl leading-relaxed">
            Set licensed/CC <code className="text-[#00d26a]">previewAudioUrl</code> per music track.
            Hear it before the public player uses it. Trends/Pulse full CRUD can expand later.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--brand-slate)] text-white border border-white/10 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00d26a]' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-rose-800/60 bg-rose-950/40 text-rose-200 text-xs">
          {error}
        </div>
      )}
      {notice && (
        <div className="p-3.5 rounded-xl border border-emerald-800/60 bg-emerald-950/40 text-emerald-200 text-xs">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] border-l-4 border-l-[#00d26a]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)]">
              Trends
            </span>
            <TrendingUp className="w-4 h-4 text-[#00d26a]" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {trendCount == null ? '—' : trendCount}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] border-l-4 border-l-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)]">
              Music
            </span>
            <Music2 className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">{tracks.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] border-l-4 border-l-[#00d26a]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--neutral-400)]">
              Pulse
            </span>
            <Radio className="w-4 h-4 text-[#00d26a]" />
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {pulseSlots == null ? '—' : pulseSlots}
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Clapperboard className="w-4 h-4 text-[#00d26a]" />
          <h2 className="text-sm font-display font-bold text-white">Music preview URLs</h2>
        </div>
        <div className="space-y-3">
          {tracks.length === 0 && !loading && (
            <p className="text-xs text-[var(--neutral-500)]">No music tracks returned.</p>
          )}
          {tracks.map((track) => (
            <div
              key={track.id}
              className="p-4 rounded-2xl border border-[var(--brand-slate)] bg-black/30 space-y-2"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-white">{track.title}</p>
                  <p className="text-xs text-[var(--neutral-400)]">{track.artist}</p>
                </div>
                <span className="text-[10px] font-mono text-[var(--neutral-500)]">
                  {track.sourceLabel}
                </span>
              </div>
              <input
                value={drafts[track.id] ?? ''}
                onChange={(e) =>
                  setDrafts((prev) => ({ ...prev, [track.id]: e.target.value }))
                }
                placeholder="https://…/preview.mp3 (licensed / CC)"
                className="w-full px-3 py-2 rounded-xl bg-[var(--brand-deep)] border border-[var(--brand-slate)] text-xs text-white"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => playPreview(track.id, drafts[track.id] || '')}
                  disabled={!drafts[track.id]}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase border border-white/20 rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  {previewId === track.id ? 'Playing…' : 'Hear'}
                </button>
                <button
                  type="button"
                  onClick={() => void savePreview(track.id)}
                  disabled={savingId === track.id}
                  className="px-3 py-1.5 text-[11px] font-bold uppercase bg-[#00d26a] text-black rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {savingId === track.id ? 'Saving…' : 'Save preview URL'}
                </button>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-[11px] font-bold uppercase border border-[#00d26a]/40 text-[#00d26a] rounded-lg"
                >
                  Preview as public
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
