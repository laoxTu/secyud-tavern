import { useEffect, useRef, useState } from 'react';

import { Properties, utils } from '@/database';
import { Registerable, Registry } from '@/plugins';

export function useRefresh() {
  const [key, setKey] = useState(0);
  const refreshKey = () => setKey((u) => u + 1);
  return { key, refreshKey, setKey };
}

export function useTabs<T extends Registerable & { hidable?: boolean }>(
  tabs: Registry<T>,
  item?: Properties,
) {
  const [showTabs, setShowTabs] = useState<T[]>([]);
  const [hideTabs, setHideTabs] = useState<T[] | null>(null);
  useEffect(() => {
    void (async () => {
      const showTabs: T[] = [];
      const hideTabs: T[] = [];
      const set = new Set(utils.getProperty<string[]>(item, 'types'));
      for (const tab of tabs.sorted()) {
        if (!tab.hidable || set.has(tab.id)) {
          showTabs.push(tab);
        } else {
          hideTabs.push(tab);
        }
      }
      setShowTabs(showTabs);
      setHideTabs(hideTabs);
    })();
  }, [item]);

  return { showTabs, hideTabs };
}

export function useFormRef() {
  return useRef<HTMLFormElement>(null);
}

export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // 组件在浏览器加载后，设置 isClient = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  return { isClient };
}
