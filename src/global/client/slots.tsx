import { element } from '@/components';

import { getSingleton, Registerable, Registry } from '..';

export interface UI extends Registerable {
  slot: string;
  component: React.ComponentType;
}

class UIRegistry extends Registry<UI> {
  private groupedItems: Record<string, UI[]> | null = null;
  constructor() {
    super('uis');
  }

  grouped() {
    if (!this.groupedItems) {
      this.groupedItems = {};
      for (const ui of this.sorted()) {
        if (!this.groupedItems[ui.slot]) {
          this.groupedItems[ui.slot] = [];
        }
        this.groupedItems[ui.slot].push(ui);
      }
    }
    return this.groupedItems;
  }

  group(slot: string) {
    return this.grouped()[slot] ?? [];
  }

  protected invalidateCache() {
    super.invalidateCache();
    this.groupedItems = null;
  }
}

export const uis = getSingleton('uis', () => new UIRegistry());

interface SlotProps {
  slot: string;
}

export function UISlot({ slot }: SlotProps) {
  const uiComponents = uis.group(slot);
  return <>{uiComponents.map((ui) => element(ui.component, { key: ui.id }))}</>;
}
