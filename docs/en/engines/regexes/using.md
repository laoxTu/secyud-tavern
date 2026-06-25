# Regexes Engine Usage Guide

## Adding Regex Rules

Create rules in the Regex tab of the preset editor:

| Field | Description |
|---|---|
| pattern | Search pattern (JS regex string, e.g. `/pattern/g`) |
| replacement | Replacement text |
| target | `input` / `output` / `both` |

## Target Descriptions

| target | Replacement timing |
|---|---|
| `input` | User input → before sending to AI |
| `output` | AI response → before displaying to user |
| `both` | Applied to both input and output |

## Usage Examples

### Removing AI Formatting Markers

| pattern | replacement | target |
|---|---|---|
| `**` | (empty) | output |
| `__` | (empty) | output |
| `\n{3,}` | `\n\n` | output |

### Standardizing Terminology

| pattern | replacement | target |
|---|---|---|
| `color` | `colour` | both |

### Removing Character Prefix

SillyTavern-style `{{char}}:` prefix:

| pattern | replacement | target |
|---|---|---|
| `\{\{char\}\}: ?` | (empty) | output |

## Notes

- `pattern` uses `String.replace()`, which **replaces only the first match at a time**
- Add the `g` flag for global replacement (e.g. `/pattern/g`)
- Input-direction replacement runs before worldbook matching
- Output-direction replacement runs during both stream rendering and full-page rendering
- Enable `disabled` to temporarily turn off a rule
