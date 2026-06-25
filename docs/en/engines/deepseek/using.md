# Deepseek Engine Usage Guide

## Configuration Location

Go to Business → LlmApis → Create/Edit → Provider, select "deepseek".

## Configuration Items

| Parameter | Description | Default |
|---|---|---|
| API Key | Obtained from the Deepseek platform | - |
| Model | `deepseek-v4-flash` / `deepseek-v4-pro` | v4-flash |
| Thinking | Reasoning mode toggle | On |
| reasoning_effort | Reasoning depth (when Thinking is on) | high |
| Stream | Streaming output | On |
| Temperature | Randomness [0, 2] (when Thinking is off) | 1 |
| Top-P | Nucleus sampling [0, 1] (when Thinking is off) | 1 |
| Max Tokens | Maximum output token count | 0 (unlimited) |
| Logprobs | Log probabilities | Off |

## Thinking Mode

When enabled, Deepseek performs internal reasoning before responding (the reasoning content is not shown in the output).

- `high` — Standard reasoning depth
- `max` — Maximum reasoning depth (slower but more thorough)

## Streaming vs Non-Streaming

| Mode | Experience | Use Case |
|---|---|---|
| Stream on | Real-time character-by-character display | General conversation |
| Stream off | Display all at once after completion | When full context is needed for judgment |

## API Key Security

- Automatically encrypted and stored in SQLite upon input
- Decrypted only on the server when calling the API
- Preset scripts inside the iframe cannot access it

## Obtaining an API Key

1. Visit the [Deepseek Open Platform](https://platform.deepseek.com/)
2. Register and top up
3. Create a key on the API Keys page
4. Paste it into the Tavern API Key field
