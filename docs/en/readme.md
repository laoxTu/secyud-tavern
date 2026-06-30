# Secyud Tavern

A highly customizable AI role-playing and interactive storytelling platform. No clutter — everything revolves around three simple concepts: **Presets**, **Models**, and **Stories**.

## Why Secyud Tavern

In traditional tools like SillyTavern, character cards, world books, themes, and scripts must be imported and managed separately. Piecing together a complete character experience means juggling scattered files and wrestling with dependencies.

Secyud Tavern takes a different approach:

- **Presets as bundles**: One JSON file packages character settings, lorebooks, regex rules, styles, scripts, and macros. Authors publish a character — users import a single file for the full experience.
- **Multi-core parallelism**: Activate multiple presets simultaneously, combining works from different authors like building blocks. The engine doesn't enforce conflict resolution — preset authors coordinate through naming conventions.
- **Fully customizable UI**: Without presets, the interface is a clean white canvas. The UI is entirely defined and rendered by presets. The input bar and controls only appear on mouse hover.
- **Variable-driven**: A structured variable table drives world state evolution. Loading a save reads the snapshot directly — no need to replay history.
- **Floor-based rendering**: Only one floor is displayed at a time, ideal for MVU patterns and status bars. No risk of crashing from floor pile-up.

## Three Core Concepts

### 1. Preset

A preset is a unified collection of editable content, categorized by `tags`.

It's plugin-extensible and supports editing five types of content out of the box:

| Engine | Role | Description |
|---|---|---|
| **Macro** | Macro definitions | Key-value pairs; placeholders are replaced via the Eta template engine during prompt assembly and rendering |
| **Lorebook** | World book | Conditional background knowledge, injected into context with three matching modes for precise timing control |
| **Regex** | Regex replacement | Find-and-replace on text before sending or displaying, with layer-based scoping |
| **Script** | Scripting | JavaScript injected into the iframe, receives message notifications for custom rendering |
| **Style** | Styling | CSS injected into the iframe to customize the interface appearance |

#### Lorebook: Three Matching Modes

The lorebook is a conditional knowledge injection engine — it matches entries against message content and injects matched knowledge into the LLM context. It uses **pluggable matchers** for different trigger strategies. Three modes are built in, with support for extending via plugins.

**Always**

A special matching mode — the lorebook entry is always present in context, no keyword trigger needed.

- `lastMessage`: Controls placement. When off, injected before every round of dialogue. When on, only appended after the last message.
- `layer`: `< 100` places content before the message; `≥ 100` places it after. Use `priority` for ordering within the same layer.

Perfect for fixed character settings and world background — information needed in every round, with no point in re-matching each time.

**Normal**

Keyword-based matching. An upgrade over SillyTavern's keyword system — supports up to **8 keyword groups**, with **OR logic** within groups and **satisfaction-count logic** across groups.

Here's an example: I'm writing a lorebook entry about a character. Group 1 has possible locations (school, shop, street). Group 2 has physical traits (long hair, glasses, tall). Group 3 has personality traits (gentle, introverted, sharp-tongued). If `fitCount` is set to 2, then as long as at least two groups match in the AI's response — like "a gentle girl with long hair" (traits + personality), or "a student from City A" (location + identity) — the lorebook activates, injecting the character's full info into context.

The advantage is **precise control over matching conditions**: it won't trigger from a single keyword, nor does it require every group to match. Especially useful for location-based world books, character profiles, faction introductions, and similar content.

**Event**

Extends Normal matching with **time-based matching**. In addition to satisfying keyword conditions, a time reference must be present — specifically, `relatedDates` must exist in the variables table — for the event to trigger.

Event-type lorebooks are designed for **guiding story direction**. Use them for future foreshadowing ("a plague will break out in the city in three days") or historical backstory ("the truth behind the great war twenty years ago"), letting the story unfold naturally at the right moment rather than dumping all the setting onto the AI at once. Works best with the variable system — for example, when the player investigates a certain date, the variables table updates `relatedDates`, and the corresponding world book event unlocks automatically.

**Extensibility**

Matching modes are plugin-based. `lorebookMatcherRegistry` manages all matchers; each matcher only needs to implement the `match(ctx, expression) => boolean` interface and a corresponding editor UI. Want to add probability matching, emotion matching, recursive matching, or other custom modes? Write a plugin, register it, done — no engine code changes needed.

When your preset collection grows large, filter by `tags`.

### 2. Model (LLM API)

Like SillyTavern's "plug", this is the configuration for the model API. It separates two independent concerns:

**LLM Engine** — the model API itself. Plugin-extensible; each provider implements two interfaces:

| Interface | Runtime | Role |
|---|---|---|
| **Config** | Client | Configuration form UI (model selection, parameter tuning) |
| **Engine** | Server | Calls the model API, returns an SSE streaming response |

Adding a new provider only requires registering a Config and an Engine.

**InputBuilder** — the context assembly pattern. Separate from the model API, it's responsible for assembling conversation history + activated lorebooks into the final message array sent to the LLM. InputBuilder is also pluggable; a default builder is built in (injects lorebooks by layer, merges consecutive messages from the same role), and it can be replaced or extended via plugins.

Two engines are built in: **Deepseek** and **OpenAI**. Using Deepseek as an example, configurable options include:

- Model selection (deepseek-v4-flash / deepseek-v4-pro)
- API Key (encrypted storage, custom character-offset cipher)
- Temperature / Top-P / Stream / Logprobs
- Thinking mode (reasoning_effort)

The OpenAI engine supports custom baseURL, making it compatible with any OpenAI-protocol service (LocalAI, Ollama, etc.).

### 3. Story

A story is not a character card — it's a **save file**.

- Pick a model + load some presets (along with their dependencies) = a story
- Freely configure when starting a new save, or copy from an existing story
- Exporting a save = sharing the complete experience: which presets were used, what was discussed, how the world changed

**Variable system**: Embed `<variable_changes>` tags in AI replies for automatic variable change parsing and stripping from output — native support, no plugin needed:

```text
<variable_changes>
[{
  "op": "add",
  "path": "time/hour",
  "value": 23
}]
</variable_changes>
```

**Summary feature**: Content before a message marked as `summary` is ignored during prompt assembly. Use with summarization prompts to effectively control context length.

**Floor-based rendering**: Messages are displayed by floor; only the current floor is shown, with pagination to switch. This design suits MVU patterns and status bar displays, and avoids crashing the iframe from too many floors stacking up.

## Getting Started

1. In the Business dashboard's Stories list, click the enter icon (↘) next to a story
2. Enter the play interface — a clean white canvas if no presets are configured
3. The input bar and controls are hidden by default, appearing on mouse hover
4. After loading presets, the UI is rendered by preset scripts for deep customization
5. Type a message → AI streams a reply → variables auto-parse → floor updates

## Quick Start

```bash
pnpm install          # Install dependencies
pnpm build            # Production build
pnpm gen-plugin-api   # Generate plugin API
pnpm gen-db-migrate   # Generate DB migration
pnpm start -p 12804   # Start → http://localhost:12804
```

### Available Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server on port 12804 |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm db-migrate` | Generate & run database migrations |
| `pnpm gen-plugin-api` | Generate plugin API types |
| `pnpm gen-plugin <name>` | Bundle a plugin → `plugins/<name>/client.js` |
| `pnpm test` | Run tests |

### Plugin Compilation

Plugin source code (`client.tsx`) is compiled to `client.js` via `pnpm gen-plugin <name>`. The process:

1. Reads `modules` from `plugins/<name>/manifest.json`
2. esbuild bundles; paths in `modules` are marked `external` (imports preserved)
3. Post-processing replaces `import { x } from '@/xxx'` with `const { x } = window.__PLUGIN_API__['@/xxx']`

Plugin `manifest.json`:
```json
{
  "id": "my-plugin",
  "version": "1.0.0",
  "clientScript": "client.js",
  "modules": [
    "react",
    "@/business/client/navigation",
    "@/components/ui/button"
  ]
}
```

## Project Structure

```
src/
├── app/           # Next.js pages & REST API
├── business/      # Data persistence (Repository factory + Drizzle ORM + SQLite)
├── components/    # UI components (ui primitives / custom composites / page templates)
├── engines/       # Processing engines
│   ├── macros/    #   Macro system ──┐
│   ├── lorebooks/ #   Lorebook       │
│   ├── regexes/   #   Regex replace  ├─ Preset engines (configured in preset editor)
│   ├── scripts/   #   Scripts        │
│   ├── styles/    #   Styles ────────┘
│   ├── deepseek/  #   Deepseek ───────┐
│   └── openai/    #   OpenAI ─────────┘─ Model engines (configured in model settings)
├── handler/       # Request interceptor pipeline (param parsing + error handling)
├── lib/           # General utilities (cn() classname merging)
├── llmapis/       # LLM API abstraction layer (config + engine + input building)
├── plugins/       # Plugin system (Registry pattern + client plugin framework)
├── presets/       # Preset management
├── slots/         # Session runtime (ConversationProvider lifecycle)
├── stories/       # Story / save system
└── utils/         # Utilities (encryption, Registry topological sort, stream reading)

plugins/           # External plugin directory
└── my-plugin/  #   Example plugin
```

### Engine Execution Pipeline

Engines are responsible for **processing strings** (replacing placeholders, transforming text, injecting context) — they don't directly render UI. Actual rendering is done by preset scripts inside the iframe.

```
Initialize (initializer):
    Macro   → Collect all preset key-value pairs → slot.content.macros = { key: value, ... }
    Lorebook → Parse lorebook entries, group by match type
    Regex   → Split regex rules by target (input/output/both)
    Script  → Collect scripts, sort by priority
    Style   → Collect styles, sort by priority

Process Input (inputProcesser):
    Lorebook → Scan history messages, match & activate lorebooks
    Regex   → Apply input regex replacements to message text
    Llmapi  → Build LLM message format, inject activated lorebook content
    Macro   → Replace <%= it.key %> placeholders in messages via Eta engine

LLM Call (page.tsx → POST /api/llmapis/{id}/chat):
    Deepseek/OpenAI → Server calls model API, returns SSE stream

Stream Render (streamRenderer):
    Regex   → Apply output regex replacements to stream
    Macro   → Replace Eta template placeholders in stream
    → page.tsx calls postMessage({ type: "streamContent", data: { output } })
    → Preset scripts in iframe receive message, render custom UI

Full Render (contentRenderer):
    Regex   → Apply regex replacements to all history messages
    Macro   → Replace template placeholders across all history
    Style   → Inject CSS <style> into iframe head
    Script  → Inject JS <script> into iframe body
    → page.tsx calls postMessage({ type: "renderContent", data: { inputs, output } })
    → Preset scripts in iframe receive message, render custom UI
    → postMessage({ type: "variables", data: {...} }) syncs variables to iframe
```

## Documentation

Detailed docs in the `docs/` directory. Each module includes `design.md` and `using.md`.

## License

Open source. Free to study, commercial use prohibited.

🔗 [https://github.com/laoxTu/secyud-tavern](https://github.com/laoxTu/secyud-tavern)

---

*Note: documentation is partially AI-assisted. Some details may be off — don't take everything at face value.*
