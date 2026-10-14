import React from 'react';
import { getTodayMatches } from '@/lib/matches';
import { HomeFlow } from '@/components/home/HomeFlow';

export const revalidate = 5;

export default async function HomePage() {
  const { matches, meta, isMock } = await getTodayMatches();

  return <HomeFlow initialMatches={matches} meta={meta} isMock={isMock} />;
}
