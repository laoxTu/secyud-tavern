'use client';
import { Trash2Icon } from 'lucide-react';
import { _Translator, useTranslations } from 'next-intl';
import React, { useCallback, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '.';

export interface TooltipDialogInfo {
  tooltip: string;
  title: string;
  desc?: string;
}

interface TooltipDialogProps {
  tooltip: React.ReactNode;
  children?: React.ReactNode;
  disabled?: boolean;
  onOpen?: () => Promise<void>;
  onSubmit?: (data: FormData) => Promise<void>;
  info: TooltipDialogInfo;
  className?: string;
  style?: React.CSSProperties;
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export function TooltipDialog({
  tooltip,
  info,
  disabled,
  children,
  onOpen,
  onSubmit,
  className,
  style,
  formRef,
}: TooltipDialogProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  const openDialog = useCallback(async () => {
    await onOpen?.();
    setOpen(true);
  }, [setOpen, onOpen]);

  const handleSubmit = useCallback(
    async (data: FormData) => {
      await onSubmit?.(data);
      setOpen(false);
    },
    [setOpen, onSubmit],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Tooltip />}>
        <TooltipTrigger
          onClick={openDialog}
          render={<Button variant={'ghost'} disabled={disabled} />}
        >
          {tooltip}
        </TooltipTrigger>
        <TooltipContent>
          <p>{info.tooltip}</p>
        </TooltipContent>
      </DialogTrigger>
      <DialogContent
        className={className}
        style={style}
        render={<form action={handleSubmit} ref={formRef} />}
      >
        <DialogHeader>
          <DialogTitle>{info.title}</DialogTitle>
          {info.desc && <DialogDescription>{info.desc}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>
          {onSubmit && <Button type="submit">{t('default.ensure')}</Button>}
          <DialogClose render={<Button variant="outline" />}>
            {t('default.cancel')}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TooltipAlertDialogProps {
  children: React.ReactNode;
  info: TooltipDialogInfo;
  disabled?: boolean;
  onOpen?: () => Promise<void>;
  onSubmit: () => Promise<void>;
}

export function TooltipAlertDialog({
  children,
  disabled,
  info,
  onOpen,
  onSubmit,
}: TooltipAlertDialogProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations();

  const openDialog = useCallback(async () => {
    await onOpen?.();
    setOpen(true);
  }, [setOpen, onOpen]);

  const handleSubmit = useCallback(async () => {
    await onSubmit();
    setOpen(false);
  }, [setOpen, onSubmit]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Tooltip />}>
        <TooltipTrigger
          onClick={openDialog}
          render={<Button variant="destructive" disabled={disabled} />}
        >
          {children}
        </TooltipTrigger>
        <TooltipContent>
          <p>{info.tooltip}</p>
        </TooltipContent>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{info.title}</AlertDialogTitle>
          {info.desc && (
            <AlertDialogDescription>{info.desc}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction variant={'destructive'} onClick={handleSubmit}>
            {t('default.ensure')}
          </AlertDialogAction>
          <AlertDialogCancel render={<Button variant="outline" />}>
            {t('default.cancel')}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface DeleteDialogProps {
  itemName?: string;
  disabled?: boolean;
  onDelete: () => Promise<void>;
}

export function DeleteDialog({
  onDelete,
  disabled,
  itemName,
}: DeleteDialogProps) {
  const t = useTranslations();
  return (
    <TooltipAlertDialog
      onSubmit={onDelete}
      disabled={disabled}
      info={info(t, 'delete', itemName)}
    >
      <Trash2Icon color={'red'} />
    </TooltipAlertDialog>
  );
}

function info(t: _Translator, type: string, item?: string): TooltipDialogInfo {
  const param = item
    ? {
        target: t(item),
      }
    : undefined;
  return {
    title: t(`message.${type}.title`, param),
    tooltip: t(`message.${type}.tooltip`, param),
    desc: t(`message.${type}.desc`, param),
  };
}

export const dialogs = { info };
