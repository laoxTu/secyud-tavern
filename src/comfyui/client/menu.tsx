import { BrushIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { comfyuis as main } from '@/comfyui';
import { comfyuis, useComfyUIState } from '@/comfyui/client';
import { ModelContent } from '@/comfyui/client/model';
import { WorkflowContent } from '@/comfyui/client/workflow';
import {
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components';
import { GlobalMenuItem, useGlobalState } from '@/global/client';

function Content() {
  const { page } = useComfyUIState();
  return page === comfyuis.model.name ? <ModelContent /> : <WorkflowContent />;
}

function Label() {
  const { page, setPage } = useComfyUIState();
  const { menu, setMenu } = useGlobalState();
  const t = useTranslations();
  const name = comfyuis.name;

  return (
    <>
      <SidebarMenuButton
        tooltip={t(`${name}.id`)}
        onClick={() => {
          setMenu(name);
          if (menu === name) {
            setPage(
              page === comfyuis.model.name
                ? comfyuis.workflow.name
                : comfyuis.model.name,
            );
          }
        }}
      >
        <BrushIcon />
        <span>{t(`${name}.id`)}</span>
      </SidebarMenuButton>
      <SidebarMenuSub>
        <SidebarMenuSubItem>
          <SidebarMenuButton
            isActive={menu === name && page === comfyuis.model.name}
            onClick={() => {
              setMenu(name);
              setPage(comfyuis.model.name);
            }}
          >
            <span>{t(`comfyui.model.id`)}</span>
          </SidebarMenuButton>
        </SidebarMenuSubItem>
        <SidebarMenuSubItem>
          <SidebarMenuButton
            isActive={menu === name && page === comfyuis.workflow.name}
            onClick={() => {
              setMenu(name);
              setPage(comfyuis.workflow.name);
            }}
          >
            <span>{t(`comfyui.workflow.id`)}</span>
          </SidebarMenuButton>
        </SidebarMenuSubItem>
      </SidebarMenuSub>
    </>
  );
}

export const menu: GlobalMenuItem = {
  id: main.name,
  sequence: 20,
  content: Content,
  label() {
    return <Label />;
  },
};
