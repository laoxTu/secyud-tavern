# Components Module — Usage Guide

## UI Component Quick Reference

### Button

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="default">Click me</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="ghost" size="icon"><TrashIcon /></Button>

// Variants: default, outline, secondary, ghost, destructive, link
// Sizes: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg
```

### Dialog

```tsx
import {
    Dialog, DialogTrigger, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";

<Dialog>
    <DialogTrigger asChild>
        <Button>Open</Button>
    </DialogTrigger>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
        </DialogHeader>
        {/* Content */}
        <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <Button>Confirm</Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

### AlertDialog (Confirmation Dialog)

```tsx
import {
    AlertDialog, AlertDialogTrigger, AlertDialogContent,
    AlertDialogHeader, AlertDialogFooter,
    AlertDialogTitle, AlertDialogDescription,
    AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";

<AlertDialog>
    <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Confirm Delete</AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
```

### Field (Form Layout)

```tsx
import { Field, FieldLabel, FieldContent, FieldDescription, FieldError, FieldSet } from "@/components/ui/field";

<FieldSet>
    <Field orientation="horizontal">
        <FieldLabel>Name</FieldLabel>
        <FieldContent>
            <Input name="name" />
            <FieldDescription>Please enter a name</FieldDescription>
            <FieldError errors={errors.name} />
        </FieldContent>
    </Field>
</FieldSet>
```

### InputGroup (Input Decoration)

```tsx
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

<InputGroup>
    <InputGroupAddon align="inline-start">https://</InputGroupAddon>
    <InputGroupInput name="url" />
    <InputGroupButton align="inline-end">
        <SearchIcon />
    </InputGroupButton>
</InputGroup>
```

### Combobox (Multi-Select Search)

```tsx
import { Combobox, ComboboxChips, ComboboxChip, ComboboxChipsInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty, ComboboxClear } from "@/components/ui/combobox";

<Combobox>
    <ComboboxChips>
        <ComboboxChip value="opt1">Option 1 <ComboboxChipRemove /></ComboboxChip>
        <ComboboxChipsInput />
    </ComboboxChips>
    <ComboboxContent>
        <ComboboxList>
            <ComboboxItem value="opt1">Option 1</ComboboxItem>
            <ComboboxItem value="opt2">Option 2</ComboboxItem>
        </ComboboxList>
        <ComboboxEmpty>No matching results</ComboboxEmpty>
    </ComboboxContent>
    <ComboboxClear />
</Combobox>
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="tab1" variant="line">
    <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">Content 1</TabsContent>
    <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Other UI Components

- **Card**: `<Card size="sm">` with CardHeader/CardContent/CardFooter
- **Select**: `<Select>` single select, with SelectTrigger/SelectContent/SelectItem
- **Switch**: `<Switch size="sm">` toggle switch
- **Checkbox**: `<Checkbox />`
- **Accordion**: Collapsible panels
- **Tooltip**: `<TooltipProvider><Tooltip><TooltipTrigger/><TooltipContent/></Tooltip></TooltipProvider>`
- **Pagination**: `<Pagination>` display-only paginator
- **Resizable**: `<ResizablePanelGroup>` draggable resizable panels
- **Skeleton**: Loading skeleton
- **Empty**: Empty state display
- **Item**: List item (supports multimedia)
- **Separator**: Divider
- **Sonner (Toaster)**: Toast notification system

## Template Usage

### ModelListContentTemplate (List + Detail Page)

```tsx
import { ModelListContentTemplate } from "@/components/template/content-template";

<ModelListContentTemplate<MyModel>
    modelType="mymodel"                            // i18n key prefix
    modelApi="mymodels"                            // API path segment
    contextType={MyModelContext}                    // React Context
    modelContent={(model) => (
        <Item>
            <ItemTitle>{model.name}</ItemTitle>
            <ItemDescription>{model.code}</ItemDescription>
        </Item>
    )}
    cloneHandler={async (model, data) => {
        // POST to create a copy
    }}
    cloneContent={() => (
        <Field><FieldLabel>New Name</FieldLabel><Input name="name" /></Field>
    )}
    createHandler={async (data) => {
        // POST to create a new model
    }}
    createContent={() => (
        <Field><FieldLabel>Name</FieldLabel><Input name="name" /></Field>
    )}
    tabManagerAccessor={() => myTabManager}
/>
```

### ModelEditForm (Edit Form)

```tsx
import { ModelEditForm } from "@/components/template/edit-form-template";

<ModelEditForm<MyModel>
    modelType="mymodel"
    contextType={MyModelContext}
    updateHandler={async (model, data) => {
        await put(`/mymodels/{id}`, data, { params: { id: model.id } });
    }}
    updateContent={(model) => (
        <>
            <Field>
                <FieldLabel>Name</FieldLabel>
                <Input name="name" defaultValue={model?.name} />
            </Field>
            <Field>
                <FieldLabel>Description</FieldLabel>
                <Textarea name="description" defaultValue={model?.content?.description} />
            </Field>
        </>
    )}
/>
```

### EntryList (Sub-Entry Management)

```tsx
import { EntryList } from "@/components/template/entry-list-template";

<EntryList<MyModel>
    modelType="mymodel"
    modelApi="mymodels"
    contextType={MyModelContext}
    entryType="items"
    createEntryContent={() => <Input name="name" />}
    updateEntryContent={(entry) => <Input name="name" defaultValue={entry?.name} />}
/>
```

## Custom Component Usage

### PaginationWrapper

```tsx
import { PaginationWrapper, usePager } from "@/components/custom/pager";

function MyList() {
    const pager = usePager<MyModel>();
    // pager.data, pager.totalCount, pager.loading, pager.refresh()

    return (
        <>
            {pager.data.map(item => <div key={item.id}>{item.name}</div>)}
            <PaginationWrapper
                pageCount={pager.pageCount}
                onPageIndexChanged={pager.changePageIndex}
            />
        </>
    );
}
```

### TabManager

```tsx
import { TabManager, TabConfig } from "@/components/custom/tab";

const myTabManager = new TabManager("my-tabs");

// Register tabs
myTabManager.register({
    id: "general",
    label: () => <span>General</span>,
    component: GeneralTab,
});

myTabManager.register({
    id: "advanced",
    label: () => <span>Advanced</span>,
    component: AdvancedTab,
    requires: ["general"],  // Placed after "general"
});

// Get sorted tabs
const tabs = myTabManager.getSorted();
```

## Adding a New UI Component

Follow project conventions:

```tsx
'use client';

import { cn } from "@/lib/utils";
import * as RadixPrimitive from "@radix-ui/react-xxx";

// 1. Props type definition
interface MyComponentProps extends React.ComponentProps<"div"> {
    size?: "sm" | "default";
}

// 2. Function declaration (not arrow function)
export function MyComponent({
    className,
    size = "default",
    children,
    ...props
}: MyComponentProps) {
    return (
        <div
            data-slot="my-component"        // Convention
            className={cn(/* Tailwind classes */, className)}
            {...props}
        >
            {children}
        </div>
    );
}

// 3. Sub-components follow the same pattern
export function MyComponentHeader({ ... }) { ... }
```
