'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { TrendCard } from '@igshorts/shared';
import { VideoModal } from './video-modal';
import { DiscoveryMedia } from './discovery-media';

interface SlideItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  videoUrl: string;
  posterUrl: string;
  categorySlug: string;
  badge: string;
  stats: {
    views: string;
    velocity: string;
    shares: string;
  };
}

const CAROUSEL_SLIDES: SlideItem[] = [
  {
    id: 'slide-1',
    category: 'Technology',
    categorySlug: 'technology',
    badge: 'LIVE BROADCAST',
    title: 'AI Tools Reshaping Short-Form Storytelling & Creator Workflows',
    summary:
      'Generative video pipelines and automated pacing cuts are cutting post-production turnaround by 70%, propelling indie creators into algorithmic spotlight.',
    videoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.360p.vp9.webm',
    posterUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    stats: { views: '18.4M', velocity: '+420%', shares: '840K' },
  },
  {
    id: 'slide-2',
    category: 'Music',
    categorySlug: 'music',
    badge: 'AUDIO SPOTLIGHT',
    title: 'The Viral Resurgence of Lo-Fi Ambient Soundtracks',
    summary:
      'Creators across travel and tech reels are adopting vintage analog synth textures and warm rhythms to achieve record-high watch-through percentages.',
    videoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.360p.vp9.webm',
    posterUrl:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80',
    stats: { views: '29.1M', velocity: '+380%', shares: '1.2M' },
  },
  {
    id: 'slide-3',
    category: 'Sports & Gaming',
    categorySlug: 'sports-gaming',
    badge: 'CREATOR SERIES',
    title: 'Matchday Behind-the-Scenes: The Ronaldo Global Phenomenon',
    summary:
      'Exclusive tactical warmups, locker-room access, and post-game shorts generated over 120M cumulative reel impressions across 3 days.',
    videoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.360p.vp9.webm',
    posterUrl:
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
    stats: { views: '44.8M', velocity: '+510%', shares: '2.4M' },
  },
  {
    id: 'slide-4',
    category: 'Internet Culture',
    categorySlug: 'internet-culture',
    badge: 'VIRAL MOMENTUM',
    title: 'Cinematic Hyper-Lapse Travel Transitions Sweeping Feeds',
    summary:
      'Seamless multi-city jump-cuts coupled with rhythmic beat drops are dominating the global explore page, raising audience retention to 82%.',
    videoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.360p.vp9.webm',
    posterUrl:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    stats: { views: '14.2M', velocity: '+290%', shares: '620K' },
  },
];

export function LiveMediaCarousel({ initialTrend }: { initialTrend?: TrendCard | null }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentSlide = CAROUSEL_SLIDES[activeIndex];

  // Auto-advance slides every 9 seconds unless user hovers or interacts
  useEffect(() => {
    if (isPausedByUser) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
      setProgress(0);
    }, 9000);
    return () => clearInterval(interval);
  }, [isPausedByUser]);

  // Video progress line
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
  }, [activeIndex]);

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setIsPausedByUser(true);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      setIsPausedByUser(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
    setProgress(0);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    setProgress(0);
  };

  return (
    <>
      <section
        aria-label="Live Media Reel Carousel"
        className="mb-12 border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-lg transition-all"
        onMouseEnter={() => setIsPausedByUser(true)}
        onMouseLeave={() => setIsPausedByUser(false)}
      >
        {/* Top Control Bar with Slide Numbers & Live Telemetry */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-[var(--canvas)] border-b border-[var(--line)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-live-radar" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--accent)]">
              {currentSlide.badge}
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono text-[var(--ink-muted)]">
              • High-Velocity Reels
            </span>
          </div>

          {/* Slide Indicator Buttons */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="flex gap-1.5 items-center">
              {CAROUSEL_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => {
                    setActiveIndex(idx);
                    setProgress(0);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    activeIndex === idx
                      ? 'w-6 bg-[var(--accent)]'
                      : 'w-2 bg-[var(--line-strong)] opacity-30 hover:opacity-75'
                  }`}
                />
              ))}
            </div>

            <span className="text-[11px] font-mono font-bold text-[var(--ink)] ml-2">
              0{activeIndex + 1} / 0{CAROUSEL_SLIDES.length}
            </span>

            {/* Prev / Next controls */}
            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                onClick={goToPrev}
                aria-label="Previous slide"
                className="w-8 h-8 sm:w-6 sm:h-6 min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 flex items-center justify-center border border-[var(--line)] hover:border-[var(--ink)] text-xs text-[var(--ink)] bg-[var(--surface)]"
              >
                ←
              </button>
              <button
                type="button"
                onClick={goToNext}
                aria-label="Next slide"
                className="w-8 h-8 sm:w-6 sm:h-6 min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 flex items-center justify-center border border-[var(--line)] hover:border-[var(--ink)] text-xs text-[var(--ink)] bg-[var(--surface)]"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Main Media Grid: Video Player (Left) + Editorial Breakdown (Right) */}
        <div className="grid md:grid-cols-[1.3fr_1fr]">
          {/* Left: Autoplaying Inline Video Frame */}
          <div className="relative min-h-[280px] sm:min-h-[360px] md:min-h-[420px] bg-black flex items-center justify-center overflow-hidden group">
            <video
              ref={videoRef}
              key={currentSlide.id}
              src={currentSlide.videoUrl}
              poster={currentSlide.posterUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Subtle dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Live Progress Bar on Video */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
              <div
                className="h-full bg-[var(--accent)] transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Inline Media Action Controls Overlay */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-between gap-1.5 z-10">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={toggleVideoPlay}
                  aria-label={isPlaying ? 'Pause inline video' : 'Play inline video'}
                  className="px-2.5 py-1.5 min-h-[36px] bg-black/80 text-white hover:bg-black text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider border border-white/25 flex items-center gap-1.5 backdrop-blur-sm shadow-md"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                  className="px-2 py-1.5 min-h-[36px] bg-black/80 text-white hover:bg-black text-[10px] sm:text-xs border border-white/25 backdrop-blur-sm shadow-md flex items-center gap-1"
                  title={isMuted ? 'Unmute sound' : 'Mute sound'}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Unmute</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Sound</span>
                    </>
                  )}
                </button>
              </div>

              {/* Watch Full Brief Button */}
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="px-2.5 sm:px-3 py-1.5 min-h-[36px] bg-[var(--accent)] text-black font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-transform flex items-center"
              >
                Expand ↗
              </button>
            </div>
          </div>

          {/* Right: Editorial Narrative & Telemetry */}
          <div className="p-6 sm:p-8 flex flex-col justify-between bg-[var(--surface)] border-t md:border-t-0 md:border-l border-[var(--line)]">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-1 rounded-sm">
                  {currentSlide.category}
                </span>
                <span className="text-[10px] font-mono uppercase text-[var(--ink-muted)]">
                  Algorithm Spotlight
                </span>
              </div>

              <h2 className="chart-title text-2xl sm:text-3xl lg:text-4xl leading-[0.98] text-[var(--ink)]">
                {currentSlide.title}
              </h2>

              <p className="mt-3 text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
                {currentSlide.summary}
              </p>

              {/* Live Metric Pills */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-[var(--line)] font-mono text-center">
                <div className="p-2.5 bg-[var(--canvas)] border border-[var(--line)] rounded-sm">
                  <span className="block text-[10px] text-[var(--ink-muted)] uppercase">24H Views</span>
                  <span className="font-bold text-xs sm:text-sm text-[var(--ink)]">
                    {currentSlide.stats.views}
                  </span>
                </div>
                <div className="p-2.5 bg-[var(--canvas)] border border-[var(--line)] rounded-sm">
                  <span className="block text-[10px] text-[var(--ink-muted)] uppercase">Velocity</span>
                  <span className="font-bold text-xs sm:text-sm text-[var(--accent)]">
                    {currentSlide.stats.velocity}
                  </span>
                </div>
                <div className="p-2.5 bg-[var(--canvas)] border border-[var(--line)] rounded-sm">
                  <span className="block text-[10px] text-[var(--ink-muted)] uppercase">Shares</span>
                  <span className="font-bold text-xs sm:text-sm text-[var(--ink)]">
                    {currentSlide.stats.shares}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="px-4 py-2 bg-[var(--ink)] text-[var(--canvas)] text-xs font-mono font-bold uppercase tracking-wider hover:bg-[var(--accent)] hover:text-black transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch 15s Brief</span>
                </button>
                <Link
                  href={`/trending/${currentSlide.categorySlug}`}
                  className="px-4 py-2 border border-[var(--line)] text-xs font-mono font-bold uppercase tracking-wider hover:border-[var(--ink)] text-[var(--ink)] transition-colors"
                >
                  Full Coverage →
                </Link>
              </div>

              <span className="text-[10px] font-mono uppercase text-[var(--ink-muted)]">
                Auto-rotates every 9s
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal overlay for full breakdown */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        title={currentSlide.title}
        creatorName="Editorial Newsroom"
        creatorUsername="igshorts"
        category={currentSlide.category}
        description={currentSlide.summary}
        stats={currentSlide.stats}
      />
    </>
  );
}
