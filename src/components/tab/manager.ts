// components/tab/manager.ts

import {Registry} from "@/models/registerable";
import {TabConfig} from ".";


// Tab 注册表
export default class TabManager<T> extends Registry<TabConfig<T>> {
    getFirstTab() {
        const tabs = this.getSorted();
        return tabs.length > 0 ? tabs[0] : undefined;
    }
}