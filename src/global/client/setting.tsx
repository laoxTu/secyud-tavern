import { SettingsIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef } from 'react';
import { create } from 'zustand';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  element,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components';
import { GlobalMenuLabel } from '@/global/client';
import { getRegistry, Registerable } from '@/plugins';

import styles from './setting.module.css';

export interface SettingTab extends Registerable {
  icon: React.ComponentType;
  label: string;
  content: React.ComponentType;
}

interface SettingState {
  tab: string;
  setTab: (tab: string) => void;
}

export const useSettingState = create<SettingState>((set) => ({
  tab: '',
  setTab: (tab: string) => set({ tab }),
}));

export const tabs = getRegistry<SettingTab>('setting-tabs');

/**
 * 设置页面，使用滚动触发高亮
 * 1，只有顶部交互会触发高亮
 * 2，元素需完整进入视口
 * 3，视口顶部有浏览器tab，需要考虑
 */
function Content() {
  const { tab, setTab } = useSettingState();
  const t = useTranslations();
  const sectionRefs = useRef<Record<string, HTMLDivElement>>({});
  const scrolling = useRef<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const scroll = (tab: string) => {
    setTab(tab);
    scrolling.current = true;
    const element = sectionRefs.current[tab];
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setTimeout(() => (scrolling.current = false), 500);
    }
  };

  const observe = (tab: string, element: HTMLDivElement | null) => {
    if (element) {
      sectionRefs.current[tab] = element;
      observerRef.current?.observe(element);
    }
  };

  useEffect(() => {
    if (!tab) {
      setTab(tabs.firstId()!);
    }
    const distance = 10;
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrolling.current) {
          return;
        }
        for (const entry of entries) {
          const id = entry.target.getAttribute('data-tab-id');
          const {
            boundingClientRect: { top, bottom },
          } = entry;
          console.debug(`[tab]: ${id} ${distance} ${top} ${bottom}`);
          if (top <= distance && bottom >= distance) {
            if (id && id !== tab) {
              setTab(id);
            }
            break;
          }
        }
      },
      {
        threshold: 1,
      }, // 固定导航高度
    );
    observerRef.current = observer;
    Object.values(sectionRefs.current).forEach((u) => observer.observe(u));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={'h-full overflow-auto relative'}>
      <Tabs className={'sticky top-0 z-10'} value={tab} onValueChange={scroll}>
        <TabsList
          className={'overflow-x-auto scrollbar-none justify-normal self-end'}
        >
          {tabs.sorted().map((tab) => {
            return (
              <TabsTrigger key={tab.id} value={tab.id}>
                {element(tab.icon)} {t(tab.label)}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
      {tabs.sorted().map((tab) => (
        <Card key={tab.id}>
          <CardHeader
            className={'flex'}
            data-tab-id={tab.id}
            ref={(el) => observe(tab.id, el)}
          >
            {element(tab.icon)}
            <CardTitle className={'text-base'}>{t(tab.label)}</CardTitle>
          </CardHeader>
          <CardContent className={styles.setting}>
            {element(tab.content)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const menu = {
  id: 'setting',
  sequence: 99999,
  content: Content,
  label: () => <GlobalMenuLabel icon={<SettingsIcon />} name={'setting'} />,
};
