'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Flame, Eye, Sparkles } from 'lucide-react';
import { StarBorder } from '@/components/ui/StarBorder';

interface SmoothVideoCardProps {
  title: string;
  posterSrc: string;
  framesDir: string;
  totalFrames?: number;
  category: string;
  provider: string;
  playersCount: string;
  tag?: string;
  onPlayClick?: () => void;
}

export function SmoothVideoCard({
  title,
  posterSrc,
  framesDir,
  totalFrames = 300,
  category,
  provider,
  playersCount,
  tag = 'HOT',
  onPlayClick,
}: SmoothVideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);
  const currentFrameIndex = useRef<number>(1);
  const imagesCache = useRef<Map<number, HTMLImageElement>>(new Map());

  // Helper to format frame path: /R/frame_00001.webp -> /R/frame_00300.webp
  const getFrameUrl = useCallback(
    (index: number) => {
      const padded = String(index).padStart(5, '0');
      return `${framesDir}/frame_${padded}.webp`;
    },
    [framesDir]
  );

  // Preload initial buffer of frames on desktop mount for instant zero-lag playback
  useEffect(() => {
    let isCancelled = false;

    // Skip heavy frame buffering on mobile/touch devices
    const isTouchOnly = typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (isTouchOnly) return;

    const preloadBuffer = () => {
      for (let i = 1; i <= 30; i++) {
        if (isCancelled) break;
        if (!imagesCache.current.has(i)) {
          const img = new window.Image();
          img.src = getFrameUrl(i);
          imagesCache.current.set(i, img);
        }
      }
    };

    preloadBuffer();
    return () => {
      isCancelled = true;
    };
  }, [getFrameUrl]);

  // When hovered, stream and buffer the remaining frames
  useEffect(() => {
    if (!isHovered) return;

    let isCancelled = false;
    let i = 41;

    const streamRemaining = () => {
      if (isCancelled || !isHovered || i > totalFrames) return;

      const batchEnd = Math.min(i + 20, totalFrames);
      for (; i <= batchEnd; i++) {
        if (!imagesCache.current.has(i)) {
          const img = new window.Image();
          img.src = getFrameUrl(i);
          imagesCache.current.set(i, img);
        }
      }

      if (i <= totalFrames) {
        setTimeout(streamRemaining, 40);
      }
    };

    streamRemaining();

    return () => {
      isCancelled = true;
    };
  }, [isHovered, getFrameUrl, totalFrames]);

  // 60 FPS animation loop
  const renderFrame = useCallback(
    (time: number) => {
      if (!isHovered) return;

      const elapsed = time - lastFrameTime.current;
      // Target 60 FPS (~16.6ms per frame)
      if (elapsed >= 16.6) {
        lastFrameTime.current = time;

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const nextIndex = (currentFrameIndex.current % totalFrames) + 1;
          const img = imagesCache.current.get(nextIndex);

          if (img && img.complete && img.naturalWidth > 0 && ctx) {
            if (canvas.width !== img.naturalWidth) {
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            currentFrameIndex.current = nextIndex;
            setIsPlaying(true);
          } else if (!img) {
            // Queue load if missing
            const newImg = new window.Image();
            newImg.src = getFrameUrl(nextIndex);
            imagesCache.current.set(nextIndex, newImg);
          }
        }
      }

      animFrameId.current = requestAnimationFrame(renderFrame);
    },
    [isHovered, totalFrames, getFrameUrl]
  );

  useEffect(() => {
    if (isHovered) {
      lastFrameTime.current = performance.now();
      animFrameId.current = requestAnimationFrame(renderFrame);
    } else {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
      currentFrameIndex.current = 1;
      setIsPlaying(false);
    }

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isHovered, renderFrame]);

  return (
    <StarBorder
      as="div"
      color="#D4AF37"
      trailColor="#FFDF73"
      duration={5}
      direction="clockwise"
      stars={2}
      trailLength={0.35}
      thickness={2}
      radius={24}
      glow={0.8}
      sparkle={true}
      hover="brighten"
      clickPulse={true}
      className="w-full rounded-3xl overflow-hidden p-0 shadow-2xl bg-neutral-950"
    >
      <div
        onMouseEnter={() => {
          if (typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            setIsHovered(true);
          }
        }}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onPlayClick}
        className={`group relative overflow-hidden rounded-3xl bg-neutral-950 transition-all duration-300 cursor-pointer w-full h-full ${
          isHovered ? 'scale-[1.01]' : ''
        }`}
      >
        {/* 16:10 Aspect Container for Cinematic Game Card */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
        {/* Base Poster Native Image (1.webp or 2.webp) - 100% reliable, zero next/image 400 errors */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterSrc}
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isPlaying ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* 60 FPS HTML5 Canvas Video Stream */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-200 ${
            isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Ambient Dark Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/35 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-brand-600 text-white shadow-md shadow-brand-600/40">
              {tag}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md text-white/90 border border-white/10">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {provider}
            </span>
          </div>

          {/* 60 FPS Video Status Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border transition-all ${
              isHovered
                ? 'bg-red-600/90 text-white border-red-500 shadow-md animate-pulse'
                : 'bg-black/60 text-white/80 border-white/10'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isHovered ? 'bg-white animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span>{isHovered ? '60 FPS PREVIEW' : 'HOVER TO PLAY'}</span>
          </div>
        </div>

        {/* Play Action Center Overlay (visible on hover) */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-2xl shadow-brand-600/60 ring-4 ring-white/30 backdrop-blur-sm">
            <Play className="w-8 h-8 fill-white ml-1" />
          </div>
        </div>

        {/* Bottom Game Details Overlay (Matching reference image style) */}
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none space-y-2">
          {/* Main Title */}
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase drop-shadow-md">
            {title}
          </h2>

          {/* Pill tags row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-sm">
              {category}
            </span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white/15 backdrop-blur-md text-white border border-white/15 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              {playersCount}
            </span>
            <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white/15 backdrop-blur-md text-white border border-white/15 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              60 FPS
            </span>
          </div>
        </div>
      </div>
    </div>
  </StarBorder>
);
}

export default SmoothVideoCard;
