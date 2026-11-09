import { LinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';

import { useIsMobile } from '@/utils/client/hooks/use-mobile';

import {
  Button,
  buttonVariants,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '.';

export function TextTooltip({ text, len }: { text?: string; len?: number }) {
  if (!text) {
    return null;
  }
  len ??= 32;
  return (
    <>
      {text.substring(0, len)}
      {text.length > len ? (
        <Tooltip>
          <TooltipTrigger
            className="cursor-pointer inline-block text-xs w-4 text-center m-auto border rounded-full hover:border-primary hover:text-primary"
            render={<span />}
          >
            ⋯
          </TooltipTrigger>
          <TooltipContent>
            <p>{text}</p>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </>
  );
}

interface ClickTooltipProps {
  children: React.ReactNode;
  text?: string;
  label?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ClickTooltip({
  children,
  className,
  label,
  text,
  onClick,
  disabled,
}: ClickTooltipProps) {
  const t = useTranslations();
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={onClick}
        className={className}
        render={<Button disabled={disabled} variant={'ghost'} />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>
        <p>{text && t(text)}</p>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

interface LinkTooltipProps {
  children?: React.ReactNode;
  text?: string;
  href: string;
}

export function LinkTooltip({
  children,
  text = 'default.link',
  href,
}: LinkTooltipProps) {
  const t = useTranslations();
  return (
    <Tooltip>
      <TooltipTrigger
        className={buttonVariants({ variant: 'link' })}
        render={<Link href={href} target="_blank" />}
      >
        {children || <LinkIcon />}
      </TooltipTrigger>
      <TooltipContent>
        <p>{t(text)}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface IconTooltipProps {
  children: React.ReactNode;
  text?: string;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}
const tooltipContentClassName =
  'w-auto max-w-xs rounded-md border-0 bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-none';
export function IconTooltip({
  children,
  className,
  label,
  text,
  disabled,
}: IconTooltipProps) {
  const t = useTranslations();
  const isMobile = useIsMobile();
  return isMobile ? (
    <Popover>
      <PopoverTrigger
        className={className}
        render={<Button disabled={disabled} variant={'ghost'} />}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent className={tooltipContentClassName}>
        <p>{text && t(text)}</p>
        {label}
      </PopoverContent>
    </Popover>
  ) : (
    <Tooltip>
      <TooltipTrigger
        className={className}
        render={<Button disabled={disabled} variant={'ghost'} />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>
        <p>{text && t(text)}</p>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
