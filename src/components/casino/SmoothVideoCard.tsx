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

  // Helper to load and cache a frame
  const loadFrame = useCallback(
    (index: number) => {
      if (imagesCache.current.has(index)) return imagesCache.current.get(index)!;
      const padded = String(index).padStart(5, '0');
      const img = new window.Image();
      img.src = `${framesDir}/frame_${padded}.webp`;
      imagesCache.current.set(index, img);
      return img;
    },
    [framesDir]
  );

  // Preload initial small buffer on mount without flooding network threads
  useEffect(() => {
    let isCancelled = false;
    for (let i = 1; i <= 3; i++) {
      if (isCancelled) break;
      loadFrame(i);
    }
    return () => {
      isCancelled = true;
    };
  }, [loadFrame]);

  // When hovered, stream and buffer the remaining frames progressively
  useEffect(() => {
    if (!isHovered) return;

    let isCancelled = false;
    let nextBatch = 4;

    const streamRemaining = () => {
      if (isCancelled || !isHovered || nextBatch > totalFrames) return;

      const batchEnd = Math.min(nextBatch + 15, totalFrames);
      for (let i = nextBatch; i <= batchEnd; i++) {
        loadFrame(i);
      }
      nextBatch = batchEnd + 1;

      if (nextBatch <= totalFrames) {
        setTimeout(streamRemaining, 40);
      }
    };

    streamRemaining();

    return () => {
      isCancelled = true;
    };
  }, [isHovered, loadFrame, totalFrames]);

  // 60 FPS animation loop
  const renderFrame = useCallback(
    (time: number) => {
      if (!isHovered) return;

      const elapsed = time - lastFrameTime.current;
      // Target ~45-60 FPS (~18ms per frame)
      if (elapsed >= 18) {
        lastFrameTime.current = time;

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const idx = currentFrameIndex.current;
          let img = imagesCache.current.get(idx);
          if (!img) {
            img = loadFrame(idx);
          }

          if (img && img.complete && img.naturalWidth > 0 && ctx) {
            if (canvas.width !== img.naturalWidth) {
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setIsPlaying(true);
            currentFrameIndex.current = (idx % totalFrames) + 1;
          } else {
            // If current frame is decoding, peek at next frame so video doesn't stall
            const nextIdx = (idx % totalFrames) + 1;
            const nextImg = imagesCache.current.get(nextIdx);
            if (nextImg && nextImg.complete && nextImg.naturalWidth > 0 && ctx) {
              if (canvas.width !== nextImg.naturalWidth) {
                canvas.width = nextImg.naturalWidth;
                canvas.height = nextImg.naturalHeight;
              }
              ctx.drawImage(nextImg, 0, 0, canvas.width, canvas.height);
              setIsPlaying(true);
              currentFrameIndex.current = (nextIdx % totalFrames) + 1;
            }
          }
        }
      }

      animFrameId.current = requestAnimationFrame(renderFrame);
    },
    [isHovered, totalFrames, loadFrame]
  );

  useEffect(() => {
    if (isHovered) {
      // Paint first available frame immediately so user sees instant response
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const firstImg = imagesCache.current.get(currentFrameIndex.current) || imagesCache.current.get(1);
        if (firstImg && firstImg.complete && firstImg.naturalWidth > 0 && ctx) {
          if (canvas.width !== firstImg.naturalWidth) {
            canvas.width = firstImg.naturalWidth;
            canvas.height = firstImg.naturalHeight;
          }
          ctx.drawImage(firstImg, 0, 0, canvas.width, canvas.height);
          setIsPlaying(true);
        }
      }

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      className="w-full rounded-3xl p-0 shadow-2xl bg-neutral-950"
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
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
