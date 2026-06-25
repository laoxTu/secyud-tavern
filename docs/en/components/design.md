# Components Module — Design Documentation

## Overview

`src/components/` is the application's **UI component system**, following a strict three-layer architecture:

```
src/components/
├── ui/           # Presentation layer — stateless UI primitives (25 files)
├── custom/       # Composition layer — reusable behavioral components (pagination, search, tabs)
└── template/     # Business logic layer — page templates that interact with APIs (5 files)
```

## Design Philosophy

### Strict Layering

| Layer | Directory | State Management | External Dependencies | Responsibility |
|---|---|---|---|---|
| Presentation | `ui/` | Stateless | No business dependencies | Atomic UI primitives |
| Composition | `custom/` | Local state | UI layer primitives | Reusable behavioral components |
| Business | `template/` | Context + state | API, i18n, Toast | Complete page templates |

**Design intent**: Each layer can only depend downward — upper layers may reference lower layers, lower layers must not reference upper layers. Changing UI primitive styles will not affect business logic; switching backend APIs will not affect presentation components.

### Not Copy-Pasted shadcn/ui

All UI components are not copy-pasted from the shadcn/ui repository, but written in-house. They:
- Use the same tech stack (Radix UI primitives + CVA + Tailwind CSS)
- Follow the project's consistent code style (`data-slot` attribute, function declarations, naming conventions)
- Adapt to the project's specific needs (e.g., `input-group.tsx` supports complex input decoration compositions)

### Template Generics

All components in `template/` are generic components, adapting to different business entities via the `TModel` type parameter:

```tsx
// Same component used for Stories, Presets, LlmApis
<ModelListContentTemplate<StoryModel>    modelType="story"  ... />
<ModelListContentTemplate<PresetModel>   modelType="preset" ... />
<ModelListContentTemplate<LlmapiModel>   modelType="llmapi" ... />
```

## Three-Layer Architecture in Detail

### 1. Presentation Layer (UI Layer)

Each component is a standalone `.tsx` file, exporting:
- Main component (function declaration)
- Sub-components (in the same file as the main component)
- CVA variants object (for external composition)

**Core tech stack**:
- **Radix UI**: Unstyled, accessible primitives (Dialog, Select, Tabs, Tooltip, Accordion, Switch, Checkbox, etc.)
- **class-variance-authority (cva)**: Managing variants (Button variant/size, Item variant/size, Field orientation)
- **@base-ui/react**: Used only for Combobox (multi-select chip mode, not natively supported by Radix)
- **react-resizable-panels**: Used only for Resizable panels

**Consistency conventions**:
- All components set `data-slot="component-name"` attribute on the root element, ensuring predictable CSS selectors
- Variants defined via CVA, using `cn()` for class name merging
- Zero business logic — no imports of any business models or API clients

### 2. Composition Layer (Custom Layer)

| Component | Purpose | Dependencies |
|---|---|---|
| `custom/combobox` | Multi-select chip search input | Full set of UI-layer Combobox sub-components |
| `custom/pager/usePager` | Pagination state management hook | `useErrorHandler` |
| `custom/pager/component` | Paginator UI (smart ellipsis) | UI-layer Pagination primitives |
| `custom/tab/TabManager` | Registrable tab manager | `ClientRegistry` (plugin system) |

### 3. Business Layer (Template Layer)

| Component | Purpose | Key Props |
|---|---|---|
| `ModelListContentTemplate<T>` | Split-view master/detail list page | `modelApi`, `contextType`, `tabManagerAccessor`, `createHandler`, `cloneHandler` |
| `ModelEditForm<T>` | Model edit form | `contextType`, `updateHandler`, `updateContent` |
| `EntryList<T>` | Sub-entry CRUD management | `modelApi`, `entryType`, `updateContent` |
| `ModelNavigationTemplate` | Navigation tab (translated title) | `modelType` |
| `EntryNavigationTemplate` | Navigation icon tab | `value` |

**Template layer data flow**:

```
API request → Repository → Response data
    │
    ├── usePager → data[], totalCount, loading
    │
    ├── ModelContext.Provider → Currently selected model
    │
    └── useErrorHandler → Toast error notifications
```

## Context Mechanism in Templates

`template/models.ts` defines generic Context factories:

```ts
// Create
const StoryContext = createModelContextType<StoryModel>();

// Use (deep within the component tree)
const { model, setModel, refreshModel } = useModelContext(StoryContext, "story", t);
```

**Design intent**: Avoid props drilling. After selecting a model in the list page, deeply nested edit forms can access current model data via Context without passing through intermediate components.

## i18n Strategy

All user-visible text is processed through `next-intl`'s `useTranslations()`:

```tsx
// Using dynamic keys in templates
t(`default.${modelType}`)          // "Story" / "Preset" / "LLM API"
t(`${modelType}.name`)            // Entity-specific field names
t('page.previous'), t('page.next') // Common UI text
```

UI-layer components do **not** use i18n — they receive labels/props from outside, staying pure.
