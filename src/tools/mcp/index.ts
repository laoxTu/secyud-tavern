// MCP（Model Context Protocol）工具，通过配置远端服务器把它暴露的工具挂进来。
// 工具是在浏览器里执行的，所以只做 Streamable HTTP，stdio 那种要起子进程的接不进来。
export interface McpConfig {
  // 工具名前缀，不同服务器的工具容易重名
  code: string;
  // Streamable HTTP 端点
  url: string;
  // 额外请求头，如 Authorization
  headers: Record<string, string>;
  // 单次请求超时，单位秒
  timeout: number;
  // 返回内容的长度上限
  maxLength: number;
  // 只暴露这些工具，留空表示全部
  includes: string[];
}

export const defaultMcpConfig: McpConfig = {
  code: '',
  url: '',
  headers: {},
  timeout: 30,
  maxLength: 8000,
  includes: [],
};

export const mcp = {
  default: defaultMcpConfig,
  name: 'mcp',
};
