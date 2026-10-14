'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { IntroVideoPlayer } from '@/components/intro/IntroVideoPlayer';

export default function IntroPage() {
  const router = useRouter();

  const handleFinish = () => {
    try {
      sessionStorage.setItem('playin_intro_seen', 'true');
    } catch (e) {}
    router.push('/login');
  };

  return <IntroVideoPlayer onFinish={handleFinish} totalFrames={475} />;
}
