import React from 'react';
import { getMatchDetail } from '@/lib/matches';
import { MatchDetailView } from '@/components/cricket/MatchDetailView';

export const revalidate = 60;

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialData = await getMatchDetail(id);

  return <MatchDetailView initialData={initialData} matchId={id} />;
}
