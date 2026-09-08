import { NextResponse } from 'next/server';

function download(filename: string, stream: ReadableStream | Buffer) {
  return new NextResponse(stream as any, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}

function resource(
  filename: string,
  filetype: string,
  stream: ReadableStream | Buffer,
) {
  return new NextResponse(stream as any, {
    status: 200,
    headers: {
      'Content-Type': filetype,
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}

export const response = {
  download,
  resource,
  json: (json: any) => NextResponse.json(json),
  null: () => NextResponse.json(null),
  create(body?: BodyInit | null, init?: ResponseInit) {
    return new NextResponse(body, init);
  },
};
