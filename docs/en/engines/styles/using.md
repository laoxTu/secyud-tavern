# Styles Engine Usage Guide

## Writing Preset Styles

Write CSS directly in the Style tab of the preset editor using the Monaco editor. The styles are injected into the conversation iframe's `<head>`.

## Basic Example

```css
/* Dark theme for the conversation interface */
body {
    background: #1a1a2e;
    color: #e0e0e0;
    font-family: "Microsoft YaHei", sans-serif;
    margin: 0;
    padding: 20px;
}

#chat-root {
    max-width: 800px;
    margin: 0 auto;
}

.msg {
    padding: 12px 16px;
    margin: 8px 0;
    border-radius: 8px;
}

.msg.user {
    background: #16213e;
    text-align: right;
}

.msg.assistant {
    background: #0f3460;
    text-align: left;
}

#status {
    position: fixed;
    top: 0;
    right: 0;
    padding: 8px 12px;
    background: rgba(0,0,0,0.5);
    color: #888;
    font-size: 12px;
}
```

## Priority Sorting

CSS is concatenated after sorting by `priority`, with higher values coming later (and thus able to override lower values). Set a larger priority when you need to ensure styles are not overridden by other presets.

## Scope Isolation

To avoid style conflicts between multiple presets, use the preset code as a class name prefix:

```css
.my-preset-code .msg {
    background: pink;
}

.my-preset-code .msg.assistant {
    font-style: italic;
}
```

## Notes

- CSS is injected into the iframe `<head>` and is completely isolated from the main application
- Injected on first render; subsequent page navigation does not re-inject
- CSS from multiple presets is concatenated and injected together, in priority order
- Combine with the Scripts engine for dynamic style switching (day/night mode)
- Avoid relying on `!important`, as it breaks the cascade override logic across multiple presets
