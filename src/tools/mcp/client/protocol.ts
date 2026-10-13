'use client';
import { proxy } from '@/global/client/proxy';
import { BusinessError } from '@/interceptors';
import { signals, sseUtils } from '@/signal';
import { arrUtils, jsonUtils } from '@/utils';

import { defaultMcpConfig, McpConfig } from '..';

export interface McpToolDefinition {
  name: string;
  description?: string;
  inputSchema?: Record<string, any>;
}

export interface McpContent {
  type: string;
  text?: string;
  [key: string]: any;
}

export interface McpCallResult {
  content?: McpContent[];
  isError?: boolean;
  [key: string]: any;
}

// 当前 Streamable HTTP 的协议版本，服务端会回自己支持的那个，这里不做协商
const protocolVersion = '2025-06-18';

/**
 * MCP 的 Streamable HTTP 客户端。
 * 只发 POST：不订阅服务端主动推送的那条 GET 流，够用了。
 */
export class McpClient {
  // 服务端在 initialize 的响应头里给会话id，后续请求都要带上
  private session?: string;
  private sequence = 0;
  // 同一次会话只初始化一次；失败要清掉，否则服务器恢复了这个实例也永远起不来
  private ready?: Promise<void>;

  constructor(private readonly config: McpConfig) {}

  async listTools(signal: AbortSignal) {
    await this.ensure(signal);
    const result = await this.request('tools/list', {}, signal);
    return (result?.tools ?? []) as McpToolDefinition[];
  }

  async callTool(name: string, args: any, signal: AbortSignal) {
    await this.ensure(signal);
    const result = await this.request(
      'tools/call',
      { name, arguments: args },
      signal,
    );
    return renderResult(result);
  }

  private ensure(signal: AbortSignal) {
    this.ready ??= this.initialize(signal).catch((err) => {
      this.ready = undefined;
      throw err;
    });
    return this.ready;
  }

  private async initialize(signal: AbortSignal) {
    const result = await this.request(
      'initialize',
      {
        protocolVersion,
        capabilities: {},
        clientInfo: { name: 'secyud-tavern', version: '1' },
      },
      signal,
    );
    // 初始化之后必须补这条通知，部分服务端收不到就直接拒绝后续请求
    await this.notify('notifications/initialized', {}, signal);
    console.debug('[mcp](initialized): ', result?.serverInfo);
  }

  private async request(method: string, params: any, signal: AbortSignal) {
    const id = ++this.sequence;
    const response = await this.send(
      { jsonrpc: '2.0', id, method, params },
      signal,
    );
    const message = await this.receive(response, id);
    if (message?.error) {
      throw new BusinessError(
        `mcp error: ${message.error.message ?? 'unknown'}`,
        'error.mcp.request_failed',
      )
        .withValue('method', method)
        .withValue('url', this.config.url);
    }
    return message?.result;
  }

  private async notify(method: string, params: any, signal: AbortSignal) {
    const response = await this.send(
      { jsonrpc: '2.0', method, params },
      signal,
    );
    // 通知没有响应体，取消掉免得流挂在那边
    await response.body?.cancel().catch(() => {});
  }

  private async send(payload: any, signal: AbortSignal) {
    const { controller, destroy } = signals.createSub(signal);
    // 表单里填了非法数字会得到 NaN，NaN > 0 为 false，回落到默认值
    const seconds =
      this.config.timeout > 0 ? this.config.timeout : defaultMcpConfig.timeout;
    const timer = setTimeout(() => controller.abort(), seconds * 1000);
    try {
      const response = await proxy.raw(
        {
          url: this.config.url,
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
            // Streamable HTTP 要求同时声明两种，只写 json 会被部分服务端判 406
            Accept: 'application/json, text/event-stream',
            ...this.config.headers,
            ...(this.session ? { 'Mcp-Session-Id': this.session } : {}),
          },
        },
        { signal: controller.signal },
      );
      const session = response.headers.get('mcp-session-id');
      if (session) this.session = session;
      if (!response.ok) {
        // 会话过期时服务端回 404，按规范要重新 initialize 再重试，这里先不处理
        throw new BusinessError(
          `mcp server respond ${response.status}`,
          'error.mcp.request_failed',
        )
          .withValue('url', this.config.url)
          .withValue('status', response.status);
      }
      return response;
    } finally {
      clearTimeout(timer);
      destroy();
    }
  }

  private async receive(response: Response, id: number) {
    const contentType = response.headers.get('content-type') ?? '';
    // 不是 sse 就是一条 json；空响应体（202）会解析成 null
    if (!contentType.includes('text/event-stream')) {
      return jsonUtils.parse(await response.text());
    }
    // 流里可能夹着通知和别的响应，只认 id 对得上的那条
    for await (const message of sseUtils.read(response.body!)) {
      if (message?.id === id) return message;
    }
    return null;
  }
}

/**
 * 把调用结果拼成模型能读的文本。
 * 只认 content；图片、资源这些没有统一的可读形式，直接给 json。
 * 新协议里的 structuredContent 还没接，等真遇到再补。
 */
function renderResult(result?: McpCallResult | null) {
  if (!result) return '';
  const text = arrUtils.join(result.content, '\n', (u) =>
    u.type === 'text' ? u.text : JSON.stringify(u),
  );
  return result.isError ? `error: ${text}` : text;
}
