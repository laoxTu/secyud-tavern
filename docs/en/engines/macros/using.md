# Macros Engine Usage Guide

## Defining Macros

Add key-value pairs in the Macro tab of the preset editor:

| Key | Value |
|---|---|
| `charName` | Alice |
| `worldName` | Cat's Paw Tavern |
| `charAge` | 19 |

## Using Macros

Use Eta template syntax in **any text** — prompts, worldbook content, regex replacement text, etc.:

```text
You are <%= it.charName %>, <%= it.charAge %> years old, the proprietress of <%= it.worldName %>.
```

At runtime this renders as:

```text
You are Alice, 19 years old, the proprietress of Cat's Paw Tavern.
```

## Eta Syntax

Full [Eta template syntax](https://eta.js.org/docs/4.x.x/syntax/template-syntax) is supported:

```text
<% /* Comment, not output */ %>

<% /* Conditionals */ %>
<%= it.charAge >= 18 ? "adult" : "minor" %>

<% /* Raw output (no HTML escaping) */ %>
<%~ it.rawHtml %>
```

## Substitution Timing

| Stage | What is substituted | Effect |
|---|---|---|
| `onProcessInput` | Templates in LLM message bodies | Macros are already replaced in the messages the AI receives |
| `onRenderStream` | Templates in streaming output | Real-time replacement as the AI outputs token by token |
| `onRenderContent` | All history + current output | Macros are replaced in all displayed content when paging through |

## Macro Priority

Multiple presets may define macros with the same name. Later-preset values override earlier ones. Override behavior can be controlled via `requires` dependency ordering.

## Best Practices

- **Naming**: camelCase, semantically clear (`charName` rather than `n`)
- **Granularity**: Use macros for frequently changing items (character names), worldbooks for fixed content
- **Composition**: Worldbook content itself can also contain macro placeholders
