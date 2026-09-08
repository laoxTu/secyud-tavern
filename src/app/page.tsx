'use client';
import { useIsClient } from '@/components';
import { GlobalMenu } from '@/global/client';

export default function Home() {
  const { isClient } = useIsClient();
  // 如果是服务端渲染，或者客户端还没加载完，返回空
  if (!isClient) {
    return null; // 或者返回一个占位 div
  }
  return <GlobalMenu />;
}
