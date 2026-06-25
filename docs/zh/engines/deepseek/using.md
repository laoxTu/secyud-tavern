# Deepseek 引擎使用指南

## 配置位置

在 Business → LlmApis → 创建/编辑 → Provider 选择 "deepseek"。

## 配置项

| 参数 | 说明 | 默认值 |
|---|---|---|
| API Key | Deepseek 平台获取 | - |
| Model | `deepseek-v4-flash` / `deepseek-v4-pro` | v4-flash |
| Thinking | 推理模式开关 | 开启 |
| reasoning_effort | 推理深度（Thinking 开启时）| high |
| Stream | 流式输出 | 开启 |
| Temperature | 随机性 [0, 2]（Thinking 关闭时）| 1 |
| Top-P | 核采样 [0, 1]（Thinking 关闭时）| 1 |
| Max Tokens | 最大输出 token 数 | 0（不限制） |
| Logprobs | 对数概率 | 关闭 |

## Thinking 模式

启用后 Deepseek 在回复前进行内部推理（推理内容不显示在输出中）。

- `high` — 标准推理深度
- `max` — 最大推理深度（更慢但更深思熟虑）

## 流式 vs 非流式

| 模式 | 体验 | 适用场景 |
|---|---|---|
| Stream 开启 | 逐字实时显示 | 一般对话 |
| Stream 关闭 | 完成后一次性显示 | 需要完整上下文判断 |

## API Key 安全

- 输入后自动加密存储到 SQLite
- 仅服务端调用 API 时解密
- iframe 中的预设脚本无法访问

## 获取 API Key

1. 访问 [Deepseek 开放平台](https://platform.deepseek.com/)
2. 注册并充值
3. 在 API Keys 页面创建 Key
4. 粘贴到 Tavern 的 API Key 字段
