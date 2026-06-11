# Components 模块 — 使用指南

## UI 组件速查

### Button

```tsx
import { Button } from "@/components/ui/button";

<Button variant="default" size="default">Click me</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="ghost" size="icon"><TrashIcon /></Button>

// 变体：default, outline, secondary, ghost, destructive, link
// 尺寸：default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg
```

### Dialog

```tsx
import {
    Dialog, DialogTrigger, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";

<Dialog>
    <DialogTrigger asChild>
        <Button>打开</Button>
    </DialogTrigger>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>标题</DialogTitle>
            <DialogDescription>描述</DialogDescription>
        </DialogHeader>
        {/* 内容 */}
        <DialogFooter>
            <DialogClose>取消</DialogClose>
            <Button>确认</Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
```

### AlertDialog（确认对话框）

```tsx
import {
    AlertDialog, AlertDialogTrigger, AlertDialogContent,
    AlertDialogHeader, AlertDialogFooter,
    AlertDialogTitle, AlertDialogDescription,
    AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";

<AlertDialog>
    <AlertDialogTrigger asChild>
        <Button variant="destructive">删除</Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>确认删除？</AlertDialogTitle>
            <AlertDialogDescription>此操作不可撤销。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>确认删除</AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
```

### Field（表单布局）

```tsx
import { Field, FieldLabel, FieldContent, FieldDescription, FieldError, FieldSet } from "@/components/ui/field";

<FieldSet>
    <Field orientation="horizontal">
        <FieldLabel>名称</FieldLabel>
        <FieldContent>
            <Input name="name" />
            <FieldDescription>请输入名称</FieldDescription>
            <FieldError errors={errors.name} />
        </FieldContent>
    </Field>
</FieldSet>
```

### InputGroup（输入装饰）

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

### Combobox（多选搜索）

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
        <ComboboxEmpty>无匹配结果</ComboboxEmpty>
    </ComboboxContent>
    <ComboboxClear />
</Combobox>
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="tab1" variant="line">
    <TabsList>
        <TabsTrigger value="tab1">标签 1</TabsTrigger>
        <TabsTrigger value="tab2">标签 2</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">内容 1</TabsContent>
    <TabsContent value="tab2">内容 2</TabsContent>
</Tabs>
```

### 其他 UI 组件

- **Card**：`<Card size="sm">` 含 CardHeader/CardContent/CardFooter
- **Select**：`<Select>` 单选择，含 SelectTrigger/SelectContent/SelectItem
- **Switch**：`<Switch size="sm">` 开关
- **Checkbox**：`<Checkbox />`
- **Accordion**：可折叠面板
- **Tooltip**：`<TooltipProvider><Tooltip><TooltipTrigger/><TooltipContent/></Tooltip></TooltipProvider>`
- **Pagination**：`<Pagination>` 纯展示分页器
- **Resizable**：`<ResizablePanelGroup>` 可拖拽调整面板
- **Skeleton**：加载骨架屏
- **Empty**：空状态展示
- **Item**：列表项（支持多媒体）
- **Separator**：分割线
- **Sonner (Toaster)**：Toast 通知系统

## Template 使用

### ModelListContentTemplate（列表+详情页）

```tsx
import { ModelListContentTemplate } from "@/components/template/content-template";

<ModelListContentTemplate<MyModel>
    modelType="mymodel"                            // i18n 键前缀
    modelApi="mymodels"                            // API 路径段
    contextType={MyModelContext}                    // React Context
    modelContent={(model) => (
        <Item>
            <ItemTitle>{model.name}</ItemTitle>
            <ItemDescription>{model.code}</ItemDescription>
        </Item>
    )}
    cloneHandler={async (model, data) => {
        // POST 创建副本
    }}
    cloneContent={() => (
        <Field><FieldLabel>New Name</FieldLabel><Input name="name" /></Field>
    )}
    createHandler={async (data) => {
        // POST 创建新模型
    }}
    createContent={() => (
        <Field><FieldLabel>Name</FieldLabel><Input name="name" /></Field>
    )}
    tabManagerAccessor={() => myTabManager}
/>
```

### EditFormTemplate（编辑表单）

```tsx
import { EditFormTemplate } from "@/components/template/edit-form-template";

<EditFormTemplate<MyModel>
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

### EntryListTemplate（子条目管理）

```tsx
import { EntryListTemplate } from "@/components/template/entry-list-template";

<EntryListTemplate<MyModel>
    modelType="mymodel"
    modelApi="mymodels"
    contextType={MyModelContext}
    entryType="items"
    createEntryContent={() => <Input name="name" />}
    updateEntryContent={(entry) => <Input name="name" defaultValue={entry?.name} />}
/>
```

## Custom 组件使用

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

// 注册标签
myTabManager.register({
    id: "general",
    label: () => <span>General</span>,
    component: GeneralTab,
});

myTabManager.register({
    id: "advanced",
    label: () => <span>Advanced</span>,
    component: AdvancedTab,
    requires: ["general"],  // 排在 general 之后
});

// 获取排序后的标签
const tabs = myTabManager.getSorted();
```

## 添加新的 UI 组件

遵循项目约定：

```tsx
'use client';

import { cn } from "@/lib/utils";
import * as RadixPrimitive from "@radix-ui/react-xxx";

// 1. Props 类型定义
interface MyComponentProps extends React.ComponentProps<"div"> {
    size?: "sm" | "default";
}

// 2. 函数声明（不是箭头函数）
export function MyComponent({
    className,
    size = "default",
    children,
    ...props
}: MyComponentProps) {
    return (
        <div
            data-slot="my-component"        // 约定
            className={cn(/* Tailwind 类 */, className)}
            {...props}
        >
            {children}
        </div>
    );
}

// 3. 子组件同理
export function MyComponentHeader({ ... }) { ... }
```
