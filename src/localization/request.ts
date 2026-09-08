import { getRequestConfig, RequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { defaultLocale, locales, timeZones } from '@/localization/config';
import { resources } from '@/localization/resources';
import { jsonUtils } from '@/utils';

export default getRequestConfig(async ({}) => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value;
  console.debug('[localization](locale): ', cookieLocale);

  const locale = cookieLocale || defaultLocale;
  if (!locales.includes(locale)) {
    notFound();
  }

  // 解析完整的配置
  const config = locale.split('-');
  const language = config[0];
  const region = config.length > 1 ? config[1] : 'CN';

  const messagesList: any[] = (await resources[language]?.()) ?? [];

  const messages = messagesList.reduce(
    (p, c) => jsonUtils.merge(p, c.default),
    {},
  );

  const res: RequestConfig = {
    locale,
    messages,
    timeZone: timeZones[region],
    now: new Date(),
  };
  return res;
});
