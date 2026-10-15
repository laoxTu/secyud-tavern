'use client';
import RealmPageContent from '@/stories/realms/client/page';

export default function RealmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <RealmPageContent params={params} />;
}
