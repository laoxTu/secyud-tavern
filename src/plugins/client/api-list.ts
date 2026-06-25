import {def} from "@/plugins/client/api";

import * as module0 from '@/business/client/navigation';
import * as module1 from '@/business/client/template/tab-header';
import * as module2 from 'next-intl';
import * as module3 from 'react';
import * as module4 from 'react/jsx-dev-runtime';
import * as module5 from 'react/jsx-runtime';

export const buildPluginApi = () => {
    def('@/business/client/navigation', module0);
    def('@/business/client/template/tab-header', module1);
    def('next-intl', module2);
    def('react', module3);
    def('react/jsx-dev-runtime', module4);
    def('react/jsx-runtime', module5);
};
