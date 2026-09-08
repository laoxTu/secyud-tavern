'use client';
import RealmPageContent from '@/stories/client/realms/page';

export default function RealmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <RealmPageContent params={params} />;
}
