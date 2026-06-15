# Deepseek 引擎 — 使用指南

## 配置位置

Deepseek 在**模型（LLM API）**中配置，不在预设编辑器中。

进入 Business → LlmApis → 创建/编辑 → Provider 选择 "deepseek"。

## 配置项

| 参数 | 说明 | 默认值 |
|---|---|---|
| **API Key** | Deepseek 平台获取的 API Key | - |
| **Model** | `deepseek-v4-flash`（快速） / `deepseek-v4-pro`（强力） | v4-flash |
| **Thinking** | 推理模式开关 | 开启 |
| **reasoning_effort** | 推理深度（Thinking 开启时显示） | high |
| **Stream** | 流式输出 | 开启 |
| **Temperature** | 随机性 [0, 2]（Thinking 关闭时显示） | 1 |
| **Top-P** | 核采样 [0, 1]（Thinking 关闭时显示） | 1 |
| **Logprobs** | 对数概率（当前禁用） | 关闭 |

## Thinking 模式

Thinking 开启时，Deepseek 会在回复前进行内部推理。推理内容不会出现在输出中。

**效果**：某些任务（逻辑推理、数学、代码生成）质量更高，但延迟增加。

**调节**：
- `high` — 标准推理深度
- `max` — 最大推理深度（更慢但更深思熟虑）

## API Key 安全

- API Key 输入后自动加密存储到 SQLite
- 仅在服务端调用 Deepseek API 时解密
- 导出配置时 Key 自动清除
- iframe 中的预设脚本无法访问 Key

## 获取 API Key

1. 访问 [Deepseek 开放平台](https://platform.deepseek.com/)
2. 注册账号并充值
3. 在 API Keys 页面创建 Key
4. 复制到 Tavern 的 API Key 字段

## 在故事中使用

创建/编辑故事时，在 "LLM API" 字段选择配置好的 Deepseek 模型。故事开始后，所有对话都会通过该模型生成回复。

## 流式与非流式

| 模式 | 体验 | 适用场景 |
|---|---|---|
| **Stream 开启** | 逐字实时显示 | 一般对话（推荐） |
| **Stream 关闭** | 等待完整回复后一次性显示 | 需要完整上下文判断的场景 |
