'use client';
import { FoldHorizontalIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { PanelImperativeHandle } from 'react-resizable-panels';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  Button,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '.';

const minSize = 18;

interface Props {
  side: React.ReactNode;
  children: React.ReactNode;
}

interface MainResizeableState {
  width: number;
  setWidth: (width: number) => void;
}

export const useMainResizeableState = create<MainResizeableState>()(
  persist(
    (set) => ({
      width: 20,
      setWidth: (width: number) => {
        set({ width });
      },
    }),
    {
      name: 'main_resize',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        width: state.width,
      }),
    },
  ),
);

export function MainResizeable({ side, children }: Props) {
  const { setWidth } = useMainResizeableState();

  const leftPanel = useRef<PanelImperativeHandle | null>(null);
  const rightPanel = useRef<PanelImperativeHandle | null>(null);

  const [size] = useState<number>(useMainResizeableState.getState().width);

  const triggerCollapsed = () => {
    const panel = leftPanel.current;
    const right = rightPanel.current;
    if (!panel || !right) return;
    const panelCollapsed = panel.isCollapsed();
    const rightCollapsed = right.isCollapsed();

    if (panelCollapsed) panel.expand();
    else if (rightCollapsed) right.expand();
    else panel.collapse();
  };

  return (
    <ResizablePanelGroup className="relative" orientation="horizontal">
      <ResizablePanel
        panelRef={leftPanel}
        collapsible={true}
        defaultSize={`${size}`}
        minSize={`${minSize}`}
        onResize={(size) => {
          setWidth(size.asPercentage);
        }}
      >
        <div className={'overflow-hidden h-full flex flex-col'}>{side}</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        panelRef={rightPanel}
        collapsible={true}
        minSize={`${minSize}`}
      >
        <div className={'overflow-hidden h-full flex flex-col'}>{children}</div>
      </ResizablePanel>
      <Button
        className={'absolute right-0 opacity-0 hover:opacity-100'}
        variant={'ghost'}
        size={'icon'}
        onClick={triggerCollapsed}
      >
        <FoldHorizontalIcon />
      </Button>
    </ResizablePanelGroup>
  );
}
