'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

export interface PlayableTrack {
  id?: string;
  title: string;
  artist: string;
  audio_url?: string | null;
  artwork_url?: string | null;
  reels_count?: number;
  spotify_search_url?: string;
  youtube_search_url?: string;
}

interface AudioPlayerContextValue {
  playingTrack: PlayableTrack | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playTrack: (track: PlayableTrack) => void;
  pauseTrack: () => void;
  togglePlay: (track?: PlayableTrack) => void;
  stopTrack: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
  seek: (seconds: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [playingTrack, setPlayingTrack] = useState<PlayableTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolumeState] = useState<number>(0.75);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const progressTimerRef = useRef<number | null>(null);
  const stepRef = useRef<number>(0);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Initialize or resume AudioContext on user gesture
  const getAudioContext = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (!masterGainRef.current) {
        const masterGain = ctx.createGain();
        const effectiveVol = isMuted ? 0 : volume * 0.35;
        masterGain.gain.setValueAtTime(effectiveVol, ctx.currentTime);
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;
      }

      return ctx;
    } catch {
      return null;
    }
  }, [isMuted, volume]);

  // Stop synthetic audio loop
  const stopSynth = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    stepRef.current = 0;
  }, []);

  // Rich, audible, soothing Lo-Fi Beat Synthesizer (Drums + Rhodes Chords + Bass)
  const startSynth = useCallback(() => {
    stopSynth();
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    setDuration(30);

    // Chords (Cmaj9, Am9, Dm9, G13)
    const chordProgression: number[][] = [
      [261.63, 329.63, 392.0, 493.88, 587.33], // Cmaj9
      [220.0, 261.63, 329.63, 392.0, 493.88],  // Am9
      [146.83, 174.61, 220.0, 261.63, 329.63], // Dm9
      [196.0, 246.94, 293.66, 329.63, 440.0],  // G13
    ];

    const bassNotes = [65.41, 55.0, 73.42, 49.0]; // C2, A1, D2, G1

    const stepDuration = 0.25; // 16th notes at 60-70 BPM
    const master = masterGainRef.current;
    if (!master) return;

    const playStep = () => {
      if (!audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
      const t = audioCtxRef.current.currentTime;
      const step = stepRef.current % 16;
      const bar = Math.floor(stepRef.current / 16) % chordProgression.length;
      stepRef.current++;

      // 1. Kick on steps 0, 7, 8, 11
      if (step === 0 || step === 7 || step === 8 || step === 11) {
        try {
          const kickOsc = ctx.createOscillator();
          const kickGain = ctx.createGain();
          kickOsc.frequency.setValueAtTime(140, t);
          kickOsc.frequency.exponentialRampToValueAtTime(42, t + 0.18);
          kickGain.gain.setValueAtTime(0.55, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          kickOsc.connect(kickGain);
          kickGain.connect(master);
          kickOsc.start(t);
          kickOsc.stop(t + 0.23);
        } catch {}
      }

      // 2. Snare / Rimshot on steps 4, 12
      if (step === 4 || step === 12) {
        try {
          const snareOsc = ctx.createOscillator();
          const snareGain = ctx.createGain();
          snareOsc.type = 'triangle';
          snareOsc.frequency.setValueAtTime(220, t);
          snareOsc.frequency.exponentialRampToValueAtTime(90, t + 0.12);
          snareGain.gain.setValueAtTime(0.35, t);
          snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
          snareOsc.connect(snareGain);
          snareGain.connect(master);
          snareOsc.start(t);
          snareOsc.stop(t + 0.15);
        } catch {}
      }

      // 3. Hi-Hat on even steps (8th notes)
      if (step % 2 === 0) {
        try {
          const hatOsc = ctx.createOscillator();
          const hatGain = ctx.createGain();
          hatOsc.type = 'square';
          hatOsc.frequency.setValueAtTime(1400, t);
          hatGain.gain.setValueAtTime(0.08, t);
          hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
          hatOsc.connect(hatGain);
          hatGain.connect(master);
          hatOsc.start(t);
          hatOsc.stop(t + 0.06);
        } catch {}
      }

      // 4. Warm Electric Piano Chords on step 0 and 8
      if (step === 0 || step === 8) {
        const chord = chordProgression[bar];
        chord.forEach((freq, idx) => {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, t);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1400, t);

            // Soft lush Rhodes envelope
            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.18 / (idx + 1), t + 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(master);

            osc.start(t);
            osc.stop(t + 1.85);
          } catch {}
        });
      }

      // 5. Deep Warm Sub-Bass on step 0 and 8
      if (step === 0 || step === 8) {
        try {
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bassOsc.type = 'sine';
          bassOsc.frequency.setValueAtTime(bassNotes[bar], t);

          bassGain.gain.setValueAtTime(0.001, t);
          bassGain.gain.linearRampToValueAtTime(0.32, t + 0.05);
          bassGain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

          bassOsc.connect(bassGain);
          bassGain.connect(master);

          bassOsc.start(t);
          bassOsc.stop(t + 1.65);
        } catch {}
      }
    };

    // Run first step immediately
    playStep();
    timerRef.current = window.setInterval(playStep, stepDuration * 1000);

    // Progress counter updating currentTime every 250ms
    progressTimerRef.current = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.25;
        return next >= 30 ? 0 : next;
      });
    }, 250);
  }, [getAudioContext, stopSynth]);

  const playTrack = useCallback(
    (track: PlayableTrack) => {
      setPlayingTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);

      // Handle HTML5 audio if track has a direct audio stream URL
      if (track.audio_url) {
        stopSynth();
        if (!audioElementRef.current) {
          audioElementRef.current = new Audio();
        }
        const audio = audioElementRef.current;
        audio.src = track.audio_url;
        audio.volume = isMuted ? 0 : volume;
        audio.play().catch(() => {
          // Fall back to synth if external audio stream is blocked or fails
          startSynth();
        });

        audio.ontimeupdate = () => {
          setCurrentTime(audio.currentTime);
          if (audio.duration && !isNaN(audio.duration)) {
            setDuration(audio.duration);
          }
        };

        audio.onended = () => {
          setCurrentTime(0);
          audio.play().catch(() => {});
        };
      } else {
        // Fall back to rich Web Audio lo-fi beat engine
        if (audioElementRef.current) {
          audioElementRef.current.pause();
        }
        startSynth();
      }
    },
    [isMuted, volume, startSynth, stopSynth]
  );

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
    stopSynth();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  }, [stopSynth]);

  const stopTrack = useCallback(() => {
    setIsPlaying(false);
    setPlayingTrack(null);
    setCurrentTime(0);
    stopSynth();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
    }
  }, [stopSynth]);

  const togglePlay = useCallback(
    (track?: PlayableTrack) => {
      if (track && (!playingTrack || playingTrack.title !== track.title)) {
        playTrack(track);
        return;
      }
      if (isPlaying) {
        pauseTrack();
      } else if (playingTrack) {
        playTrack(playingTrack);
      }
    },
    [isPlaying, playingTrack, playTrack, pauseTrack]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      const effectiveVol = next ? 0 : volume * 0.35;
      if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.setValueAtTime(effectiveVol, audioCtxRef.current.currentTime);
      }
      if (audioElementRef.current) {
        audioElementRef.current.muted = next;
      }
      return next;
    });
  }, [volume]);

  const setVolume = useCallback(
    (newVol: number) => {
      const clamped = Math.max(0, Math.min(1, newVol));
      setVolumeState(clamped);
      if (!isMuted) {
        if (masterGainRef.current && audioCtxRef.current) {
          masterGainRef.current.gain.setValueAtTime(
            clamped * 0.35,
            audioCtxRef.current.currentTime
          );
        }
        if (audioElementRef.current) {
          audioElementRef.current.volume = clamped;
        }
      }
    },
    [isMuted]
  );

  const seek = useCallback((targetSeconds: number) => {
    setCurrentTime(targetSeconds);
    if (audioElementRef.current && audioElementRef.current.duration) {
      audioElementRef.current.currentTime = targetSeconds;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopSynth();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, [stopSynth]);

  return (
    <AudioPlayerContext.Provider
      value={{
        playingTrack,
        isPlaying,
        isMuted,
        volume,
        currentTime,
        duration,
        playTrack,
        pauseTrack,
        togglePlay,
        stopTrack,
        toggleMute,
        setVolume,
        seek,
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
