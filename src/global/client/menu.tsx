'use client';
import { useTheme } from '@teispace/next-themes';
import Cookies from 'js-cookie';
import { GlobeIcon, MoonIcon, SunIcon, SunMoonIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  element,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components';
import { locales } from '@/localization/config';
import { getRegistry, Registerable } from '@/plugins';

import { useGlobalState } from './state';

export interface GlobalMenuItem extends Registerable {
  label: () => React.ReactNode;
  content: React.ComponentType;
}

export const menus = getRegistry<GlobalMenuItem>('global-menu');

function ThemeIcon({ theme }: { theme?: string }) {
  if (theme === 'dark') return <MoonIcon />;
  if (theme === 'light') return <SunIcon />;
  return <SunMoonIcon />;
}

function ThemeSwitcher() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();

  const text = t(`default.theme`);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => {
          if (theme != 'dark') setTheme('dark');
          else setTheme('light');
        }}
        tooltip={text}
      >
        <ThemeIcon theme={theme} />
        <span>{text}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function LanguageSwitcher() {
  const t = useTranslations();
  const switchLanguage = (locale: string) => {
    Cookies.set('locale', locale, { expires: 30 }); // 设置有效期为30天
    window.location.reload();
  };

  const text = t(`default.language`);
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger render={<SidebarMenuButton tooltip={text} />}>
          <GlobeIcon />
          <span>{text}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent side={'right'} align={'start'}>
          <DropdownMenuGroup>
            {locales.map((u, i) => (
              <DropdownMenuItem key={i} onClick={() => switchLanguage(u)}>
                {t(`language.${u}`)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function AppSidebar() {
  return (
    <>
      <SidebarHeader>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menus.sorted().map((item) => {
              return (
                <SidebarMenuItem key={item.id}>{item.label()}</SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <LanguageSwitcher />
        <ThemeSwitcher />
      </SidebarFooter>
    </>
  );
}

export function GlobalMenuLabel({
  name,
  icon,
}: {
  name: string;
  icon: React.ReactNode;
}) {
  const t = useTranslations();
  const { menu, setMenu } = useGlobalState();

  return (
    <SidebarMenuButton
      isActive={menu === name}
      tooltip={t(`${name}.id`)}
      onClick={() => setMenu(name)}
    >
      {icon}
      <span>{t(`${name}.id`)}</span>
    </SidebarMenuButton>
  );
}

function Trigger() {
  const { isMobile } = useSidebar();

  return (
    isMobile && (
      <SidebarTrigger className={'fixed inset-0 opacity-0 hover:opacity-100'} />
    )
  );
}

export function GlobalMenu() {
  const { menu, setMenu, open, setOpen } = useGlobalState();

  useEffect(() => {
    setMenu(menu || menus.firstId());
  }, []);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen} className={'h-full'}>
      <Sidebar collapsible={'icon'}>
        <AppSidebar />
      </Sidebar>
      <main className={'overflow-hidden flex-1'}>
        {element(menus.record(menu)?.content)}
      </main>
      <Trigger />
    </SidebarProvider>
  );
}
