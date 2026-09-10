import { useEffect, useState } from 'react';
import { validate } from 'uuid';

import { files } from '@/files/client';

interface MediaProps {
  source: string;
  className?: string;
  alt?: string;
}

function Video({ source, className }: MediaProps) {
  return (
    <video
      src={source}
      //显示播放进度控制等按钮
      controls
      /**
       * 默认不下载视频内容，只加载元数据
       * 只有在播放时才加载
       */
      preload="metadata"
      className={className}
    />
  );
}

function Image({ source, className, alt }: MediaProps) {
  return <img src={source} alt={alt} className={className} />;
}

interface AutoMediaProps {
  filename?: string | null;
  className?: string;
  type?: string | null;
  alt?: string;
}

export function AutoMedia({
  type: defaultType,
  filename,
  className,
  alt,
}: AutoMediaProps) {
  const [type, setType] = useState(defaultType);

  useEffect(() => {
    setType(defaultType ?? null);
    if (defaultType || !filename) return;
    (async () => {
      if (validate(filename)) {
        const file = await files.proxy.get(filename);
        setType(file.type);
      } else if (files.outer(filename)) {
        const response = await fetch('/api/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: filename,
            ignore: true,
          }),
        });
        const mime = (response.headers.get('content-type') ?? '')
          .split(';')[0]
          .trim()
          .toLowerCase();
        setType(mime);
      }
    })();
  }, [filename, defaultType]);

  const props: MediaProps = {
    source: files.url(filename),
    className,
    alt,
  };

  if (type) {
    if (type.startsWith('image')) {
      return <Image {...props} />;
    } else if (type.startsWith('video')) {
      return <Video {...props} />;
    }
  }
  return <Image source="/favicon.svg" className={className} />;
}
