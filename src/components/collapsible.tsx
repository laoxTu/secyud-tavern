import { ChevronsDownIcon, ChevronsUpIcon } from 'lucide-react';
import { useState } from 'react';

import {
  Button,
  Card,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '.';

interface EntryCollapsiableProps {
  title: string;
  children: React.ReactNode;
  tools: React.ReactNode;
}
export function EntryCollapsiable({
  title,
  children,
  tools,
}: EntryCollapsiableProps) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible
      className={'flex-row shrink-0'}
      render={<Card />}
      open={open}
      onOpenChange={setOpen}
    >
      <div className={'flex flex-col'}>
        <Button
          size={'icon'}
          variant={'ghost'}
          className={'m-auto'}
          onClick={() => setOpen((u) => !u)}
        >
          {open ? <ChevronsUpIcon /> : <ChevronsDownIcon />}
        </Button>
        <CollapsibleTrigger
          nativeButton={false}
          render={<div />}
          className={'flex-1 overflow-hidden cursor-pointer hover:bg-gray-100'}
        >
          <p
            className={'flex-1 text-xs px-2 m-auto'}
            style={{
              writingMode: 'vertical-lr',
            }}
          >
            {title}
          </p>
        </CollapsibleTrigger>
        <div className={'flex flex-col m-auto'}>{tools}</div>
      </div>
      <CollapsibleContent className={'flex flex-col'} style={{ width: '72vw' }}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
