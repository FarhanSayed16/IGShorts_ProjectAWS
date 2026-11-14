'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  creatorName: string;
  creatorUsername: string;
  category: string;
  description?: string;
  chips?: string[];
  videoUrl?: string;
}

export function VideoModal({
  isOpen,
  onClose,
  title,
  creatorName,
  creatorUsername,
  category,
  description,
  chips = ['Editorial', 'Demo reel', 'UI preview'],
  videoUrl = 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.360p.vp9.webm',
}: VideoModalProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };
    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[var(--surface)] border-2 border-[var(--ink)] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[9/16] md:aspect-auto md:min-h-[420px] bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="w-full h-full object-cover"
          />

          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-black/75 border border-white/20 text-[10px] font-mono font-bold text-[var(--accent)] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-live-radar" />
            Demo reel preview
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 bg-black/80 hover:bg-black text-white border border-white/30 flex items-center justify-center"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 bg-black/80 hover:bg-black text-white border border-white/30 flex items-center justify-center"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="p-5 md:p-6 flex flex-col justify-between bg-[var(--surface)]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--canvas)] border border-[var(--line)] px-2 py-0.5">
                {category}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="text-[var(--ink-muted)] hover:text-[var(--ink)] text-lg font-mono p-1"
              >
                ✕
              </button>
            </div>

            <h3 className="font-display text-xl md:text-2xl font-bold uppercase text-[var(--ink)] tracking-tight leading-tight">
              {title}
            </h3>

            <p className="inline-block mt-1 font-mono text-xs text-[var(--ink-muted)]">
              Desk: {creatorName}
            </p>

            <p className="mt-3 text-xs md:text-sm text-[var(--ink-muted)] leading-relaxed">
              {description ||
                'Editorial briefing with public-domain demo media for a lively preview. Not an Instagram scrape and not fabricated engagement metrics.'}
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[var(--line)] font-mono text-center">
              {chips.slice(0, 3).map((chip) => (
                <div key={chip} className="p-2 bg-[var(--canvas)] border border-[var(--line)]">
                  <span className="block text-[10px] text-[var(--ink-muted)] uppercase">Tag</span>
                  <span className="font-bold text-xs text-[var(--ink)]">{chip}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-[var(--canvas)] border border-[var(--line)]">
              <span className="text-[10px] font-mono font-bold uppercase text-[var(--ink)] tracking-wider block mb-1">
                Honesty note
              </span>
              <ul className="text-[11px] text-[var(--ink-muted)] space-y-1 list-disc list-inside">
                <li>Video is a public demo reel for UI motion only</li>
                <li>No invented Instagram views, shares, or retention %</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-[var(--line)] flex items-center justify-between gap-3 flex-wrap">
            <Link
              href={`/trending/${category.toLowerCase().replace(/\s+/g, '-').replace('&', '')}`}
              className="px-4 py-2 bg-[var(--ink)] text-[var(--canvas)] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[var(--accent)] hover:text-black transition-colors"
            >
              Open category →
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-mono text-[var(--ink-muted)] hover:text-[var(--ink)]"
            >
              Close [ESC]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
