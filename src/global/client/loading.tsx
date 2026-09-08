'use client';
import { cn } from '@/lib/utils';

import styles from './loading.module.css';

export function Loading() {
  return (
    <div className={'h-full w-full flex bg-background'}>
      <div className="flex m-auto items-center gap-8">
        <svg width="72" height="72" className="stroke-foreground">
          <use href={'favicon.svg'} />
        </svg>

        <div className="flex flex-col items-center gap-5">
          <svg
            className={styles.spinner}
            width="28"
            height="28"
            viewBox="0 0 40 40"
          >
            <circle cx="20" cy="20" r="16" />
          </svg>
          <div className="flex gap-2">
            {[0, 200, 400].map((u, i) => (
              <span
                key={i}
                className={cn(
                  'size-1.5 rounded-full bg-foreground',
                  styles.dotFade,
                )}
                style={{
                  animationDelay: `${u}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
