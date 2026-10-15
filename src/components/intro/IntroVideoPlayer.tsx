'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FastForward, Play, ShieldCheck, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface IntroVideoPlayerProps {
  onFinish?: () => void;
  totalFrames?: number;
}

export function IntroVideoPlayer({
  onFinish,
  totalFrames = 475,
}: IntroVideoPlayerProps) {
  const router = useRouter();
  const [currentFrameNum, setCurrentFrameNum] = useState(1);
  const [isStarted, setIsStarted] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);
  const currentFrameIndex = useRef<number>(1);
  const imagesCache = useRef<Map<number, HTMLImageElement>>(new Map());

  const getFrameUrl = useCallback((index: number) => {
    const padded = String(index).padStart(5, '0');
    return `/in/frame_${padded}.webp`;
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }
  }, []);

  const handleFinish = useCallback(() => {
    if (hasEnded) return;
    setHasEnded(true);

    stopAudio();

    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }

    try {
      sessionStorage.setItem('playin_intro_seen', 'true');
    } catch (e) {}

    if (onFinish) {
      onFinish();
    } else {
      router.push('/login');
    }
  }, [hasEnded, onFinish, router, stopAudio]);

  const handleSkipToApp = () => {
    stopAudio();
    try {
      sessionStorage.setItem('playin_intro_seen', 'true');
      localStorage.setItem('playin_auth', 'true');
      localStorage.setItem('playin_user_id', 'TEST_GUEST');
    } catch (e) {}
    router.push('/');
  };

  // Preload initial buffer
  useEffect(() => {
    let isCancelled = false;

    const preloadBuffer = () => {
      const initialCount = 50;
      for (let i = 1; i <= initialCount; i++) {
        if (isCancelled) break;
        if (!imagesCache.current.has(i)) {
          const img = new window.Image();
          img.src = getFrameUrl(i);
          imagesCache.current.set(i, img);
        }
      }
      if (!isCancelled) setIsStarted(true);
    };

    preloadBuffer();

    return () => {
      isCancelled = true;
    };
  }, [getFrameUrl]);

  // Buffer ahead as the video plays
  useEffect(() => {
    if (!isStarted || hasEnded) return;

    let isCancelled = false;
    let nextBatchStart = 51;

    const bufferAhead = () => {
      if (isCancelled || hasEnded || nextBatchStart > totalFrames) return;

      const batchEnd = Math.min(nextBatchStart + 30, totalFrames);
      for (; nextBatchStart <= batchEnd; nextBatchStart++) {
        if (!imagesCache.current.has(nextBatchStart)) {
          const img = new window.Image();
          img.src = getFrameUrl(nextBatchStart);
          imagesCache.current.set(nextBatchStart, img);
        }
      }

      if (nextBatchStart <= totalFrames) {
        setTimeout(bufferAhead, 35);
      }
    };

    bufferAhead();

    return () => {
      isCancelled = true;
    };
  }, [isStarted, hasEnded, getFrameUrl, totalFrames]);

  // 60 FPS Render loop
  const renderLoop = useCallback(
    (time: number) => {
      if (hasEnded) return;

      const elapsed = time - lastFrameTime.current;
      // Target 60 FPS (~16.6ms)
      if (elapsed >= 16.6) {
        lastFrameTime.current = time;

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const nextIndex = currentFrameIndex.current + 1;

          if (nextIndex > totalFrames) {
            handleFinish();
            return;
          }

          const img = imagesCache.current.get(nextIndex);
          if (img && img.complete && img.naturalWidth > 0 && ctx) {
            if (canvas.width !== img.naturalWidth) {
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            currentFrameIndex.current = nextIndex;
            setCurrentFrameNum(nextIndex);
          } else if (!img) {
            const newImg = new window.Image();
            newImg.src = getFrameUrl(nextIndex);
            imagesCache.current.set(nextIndex, newImg);
          }
        }
      }

      animFrameId.current = requestAnimationFrame(renderLoop);
    },
    [hasEnded, totalFrames, getFrameUrl, handleFinish]
  );

  useEffect(() => {
    if (isStarted && !hasEnded) {
      lastFrameTime.current = performance.now();
      animFrameId.current = requestAnimationFrame(renderLoop);
    }

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isStarted, hasEnded, renderLoop]);

  // Audio playback lifecycle and gesture unlock
  useEffect(() => {
    if (!isStarted || hasEnded) return;

    const audio = audioRef.current;
    if (audio) {
      audio.muted = isMuted;
      audio.play().catch(() => {
        // Autoplay may be restricted until first user gesture
      });
    }

    const handleFirstGesture = () => {
      if (audioRef.current && audioRef.current.paused && !hasEnded) {
        audioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, [isStarted, hasEnded, isMuted]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      audioRef.current.muted = nextMuted;
      if (!nextMuted && audioRef.current.paused && !hasEnded) {
        audioRef.current.play().catch(() => {});
      }
      setIsMuted(nextMuted);
    }
  };

  const progressPercent = Math.min(100, Math.round((currentFrameNum / totalFrames) * 100));

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center select-none">
      {/* Background Audio Soundtrack */}
      <audio
        ref={audioRef}
        src="/m.mp3"
        preload="auto"
        playsInline
      />

      {/* 60 FPS Video Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover sm:object-contain bg-black"
      />

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-auto">
        {/* Left: 60 FPS Live Intro Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-xs font-bold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="tracking-wide uppercase text-[11px]">PLAYIN INTRO 60 FPS</span>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Sound Mute/Unmute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 active:scale-95 backdrop-blur-md border border-white/20 text-white transition-all shadow-lg"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#f5d27a]" />
            )}
          </button>

          {/* Skip Intro to Login */}
          <button
            type="button"
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 backdrop-blur-md border border-white/25 text-white text-xs font-black tracking-wide uppercase transition-all shadow-xl"
          >
            <span>Skip Intro</span>
            <FastForward className="w-3.5 h-3.5 fill-white ml-0.5" />
          </button>

          {/* Quick Skip Directly to App (Testing) */}
          <button
            type="button"
            onClick={handleSkipToApp}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#AA771C] hover:brightness-110 active:scale-95 text-black text-xs font-black tracking-wide uppercase transition-all shadow-xl shadow-amber-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>Skip to App (Guest)</span>
          </button>
        </div>
      </div>

      {/* Bottom Progress Bar & Frame Counter */}
      <div className="absolute bottom-6 left-6 right-6 z-30 pointer-events-none space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-white/80 drop-shadow-md">
          <span>Loading Play Area...</span>
          <span>
            {currentFrameNum} / {totalFrames} frames ({progressPercent}%)
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-amber-400 to-yellow-300 transition-all duration-75 ease-linear rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default IntroVideoPlayer;
