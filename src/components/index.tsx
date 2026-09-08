import React, { RefObject } from 'react';

export function element<T extends {}>(
  component?: React.ComponentType<T>,
  props?: T,
) {
  return component ? React.createElement(component, props as T) : null;
}

export * from './hooks';

interface IKeyboardEvent {
  ctrlKey: boolean;
  metaKey: boolean;
  code: string;
  preventDefault: () => void;
  stopPropagation: () => void;
  currentTarget?: {
    form: HTMLFormElement | null;
  };
}

/**
 * 方便复用 ctrl + enter 作为text area的提交
 * @param e
 */
export function submitTargetFormOnKey(e: IKeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && (e.code === 'Enter' || e.code === 'KeyS')) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget?.form?.requestSubmit();
  }
}

/**
 * 方便复用 ctrl + enter 作为各种editor的提交
 * @param e
 * @param formRef
 */
export function submitFormOnKey(
  e: IKeyboardEvent,
  formRef: RefObject<HTMLFormElement | null>,
) {
  if ((e.ctrlKey || e.metaKey) && (e.code === 'Enter' || e.code === 'KeyS')) {
    e.preventDefault();
    e.stopPropagation();
    // 提交表单
    formRef.current?.requestSubmit();
  }
}

export type Orientation =
  'horizontal' | 'responsive' | 'vertical' | null | undefined;

export * from './ui/accordion';
export * from './ui/aspect-ratio';
export * from './ui/alert-dialog';
export * from './ui/badge';
export * from './ui/button';
export * from './ui/button-group';
export * from './ui/checkbox';
export * from './ui/collapsible';
export * from './ui/card';
export * from './ui/combobox';
export * from './ui/dialog';
export * from './ui/drawer';
export * from './ui/dropdown-menu';
export * from './ui/empty';
export * from './ui/field';
export * from './ui/hover-card';
export * from './ui/input';
export * from './ui/input-group';
export * from './ui/item';
export * from './ui/label';
export * from './ui/navigation-menu';
export * from './ui/pagination';
export * from './ui/radio-group';
export * from './ui/resizable';
export * from './ui/switch';
export * from './ui/select';
export * from './ui/skeleton';
export * from './ui/sheet';
export * from './ui/spinner';
export * from './ui/sonner';
export * from './ui/separator';
export * from './ui/sidebar';
export * from './ui/textarea';
export * from './ui/tooltip';
export * from './ui/tabs';

export * from './combobox';
export * from './dialog';
export * from './empty';
export * from './field';
export * from './form';
export * from './input';
export * from './pager';
export * from './resizeable';
export * from './selector';
export * from './tooltip';
