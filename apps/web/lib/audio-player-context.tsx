'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

export interface PlayableTrack {
  id?: string;
  title: string;
  artist: string;
  artwork_url?: string | null;
  reels_count?: number;
  spotify_search_url?: string;
  youtube_search_url?: string;
}

interface AudioPlayerContextValue {
  playingTrack: PlayableTrack | null;
  isPlaying: boolean;
  isMuted: boolean;
  playTrack: (track: PlayableTrack) => void;
  pauseTrack: () => void;
  togglePlay: (track?: PlayableTrack) => void;
  stopTrack: () => void;
  toggleMute: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [playingTrack, setPlayingTrack] = useState<PlayableTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);

  // Stop synthetic lo-fi chords
  const cleanupSynth = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Web Audio synthesizer for an ambient lo-fi chord progression
  const startSynth = useCallback(() => {
    cleanupSynth();
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!gainNodeRef.current) {
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(isMuted ? 0 : 0.08, ctx.currentTime);
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;
      }

      const chords: number[][] = [
        [261.63, 329.63, 392.0, 523.25], // C maj7
        [220.0, 261.63, 329.63, 440.0],  // A min7
        [174.61, 220.0, 261.63, 349.23], // F maj7
        [196.0, 246.94, 293.66, 392.0],  // G7
      ];

      let chordIndex = 0;

      const playChord = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
        const now = audioCtxRef.current.currentTime;
        const freqs = chords[chordIndex % chords.length];
        chordIndex++;

        freqs.forEach((freq, i) => {
          if (!audioCtxRef.current || !gainNodeRef.current) return;
          const osc = audioCtxRef.current.createOscillator();
          const noteGain = audioCtxRef.current.createGain();

          osc.type = i % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          // Soft ambient envelope
          noteGain.gain.setValueAtTime(0.001, now);
          noteGain.gain.exponentialRampToValueAtTime(0.04 / (i + 1), now + 0.3);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

          osc.connect(noteGain);
          noteGain.connect(gainNodeRef.current);

          osc.start(now);
          osc.stop(now + 2.9);
        });
      };

      playChord();
      timerRef.current = window.setInterval(playChord, 3000);
    } catch {
      // AudioContext not allowed or failed, degrade silently
    }
  }, [cleanupSynth, isMuted]);

  const playTrack = useCallback((track: PlayableTrack) => {
    setPlayingTrack(track);
    setIsPlaying(true);
    startSynth();
  }, [startSynth]);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    cleanupSynth();
  }, [cleanupSynth]);

  const stopTrack = useCallback(() => {
    setIsPlaying(false);
    setPlayingTrack(null);
    cleanupSynth();
  }, [cleanupSynth]);

  const togglePlay = useCallback((track?: PlayableTrack) => {
    if (track && (!playingTrack || playingTrack.title !== track.title)) {
      playTrack(track);
      return;
    }
    if (isPlaying) {
      pauseTrack();
    } else if (playingTrack) {
      setIsPlaying(true);
      startSynth();
    }
  }, [isPlaying, playingTrack, playTrack, pauseTrack, startSynth]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setValueAtTime(next ? 0 : 0.08, audioCtxRef.current.currentTime);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    return () => {
      cleanupSynth();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [cleanupSynth]);

  return (
    <AudioPlayerContext.Provider
      value={{
        playingTrack,
        isPlaying,
        isMuted,
        playTrack,
        pauseTrack,
        togglePlay,
        stopTrack,
        toggleMute,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
}
