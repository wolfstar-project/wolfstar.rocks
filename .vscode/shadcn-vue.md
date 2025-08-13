---
url: /docs/about.md
description: Powered by amazing open source projects.
---

## About

[shadcn-vue](https://shadcn-vue.com) is a port of [shadcn/ui](https://ui.shadcn.com) for Vue/Nuxt. It's maintained by [unovue](https://github.com/unovue).

## Credits

- [shadcn](https://twitter.com/shadcn) - The brilliant mind behind the designs, methodology, and implementation of the original [shadcn/ui](https://ui.shadcn.com).
- [Radix Vue](https://reka-ui.com) - The headless components that power this project.
- [Radix UI](https://radix-ui.com) - The headless components and examples that the original [shadcn/ui](https://ui.shadcn.com) was built on.
- [Shu Ding](https://shud.in) - The typography style is adapted from his work on Nextra.
- [Cal](https://cal.com) - Where shad copied the styles for the first component: the `Button`.

## License

MIT © [shadcn](https://shadcn.com) & [unovue](https://github.com/unovue)

---

---

url: /docs/components/accordion.md
description: >-
A vertically stacked set of interactive headings that each reveal a section of
content.

---

<ComponentPreview name="AccordionDemo" class="sm:max-w-[70%]" />

## Installation

```bash
npx shadcn-vue@latest add accordion
```

## Usage

```vue
<template>
  <Accordion type="single" collapsible>
    <AccordionItem value="item-1">
      <AccordionTrigger>Is it accessible?</AccordionTrigger>
      <AccordionContent> Yes. It adheres to the WAI-ARIA design pattern. </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<script setup lang="ts">
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
</script>
```

---

---

url: /docs/components/alert.md
description: Displays a callout for user attention.

---

<ComponentPreview name="AlertDemo"  />

## Installation

```bash
npx shadcn-vue@latest add alert
```

## Usage

```vue
<template>
  <Alert>
    <AlertTitle>Heads up!</AlertTitle>
    <AlertDescription> You can add components to your app using the cli. </AlertDescription>
  </Alert>
</template>

<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
</script>
```

## Examples

### Default

<ComponentPreview name="AlertDemo"  />

### Destructive

<ComponentPreview name="AlertDestructiveDemo"  />

---

---

url: /docs/components/alert-dialog.md
description: >-
A modal dialog that interrupts the user with important content and expects a
response.

---

<ComponentPreview name="AlertDialogDemo" />

## Installation

```bash
npx shadcn-vue@latest add alert-dialog
```

## Usage

```vue
<template>
  <AlertDialog>
    <AlertDialogTrigger>Open</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your account and remove your data from our servers.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>Continue</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
</script>
```

---

---

url: /docs/charts/area.md
description: >-
An area chart visually represents data over time, displaying trends and
patterns through filled-in areas under a line graph.

---

<ComponentPreview name="AreaChartDemo"  />

## Installation

<Callout>
  Only works with Vue >3.3
</Callout>

<Steps>

### Run the following command

```bash
npx shadcn-vue@latest add chart-area
```

### Setup

Follow the [guide](/docs/charts.html#installation) to complete the setup.

</Steps>

## API

<!-- @include: @/content/meta/AreaChart.md -->

## Example

### Sparkline

We can turn the chart into sparkline chart by hiding axis, gridline and legends.

<ComponentPreview name="AreaChartSparkline"  />

### Custom Tooltip

If you want to render custom tooltip, you can easily pass in a custom component. Refer to prop definition [here](/docs/charts.html#custom-tooltip).

<ComponentPreview name="AreaChartCustomTooltip"  />

---

---

url: /docs/components/aspect-ratio.md
description: Displays content within a desired ratio.

---

<ComponentPreview name="AspectRatioDemo" />

## Installation

<TabPreview name="CLI">
<template #CLI>

```bash
npx shadcn-vue@latest add aspect-ratio
```

</template>

<template #Manual>

<Steps>

### Install the following dependency:

```bash
npm install reka-ui
```

### Copy and paste the following code into your project:

<<< @/registry/default/ui/aspect-ratio/AspectRatio.vue

</Steps>

</template>
</TabPreview>

## Usage

```vue
<template>
  <div class="w-[450px]">
    <AspectRatio :ratio="16 / 9">
      <img src="..." alt="Image" class="h-full w-full rounded-md object-cover" />
    </AspectRatio>
  </div>
</template>

<script setup lang="ts">
import { AspectRatio } from '@/components/ui/aspect-ratio'
</script>
```

---

---

url: /docs/installation/astro.md
description: Install and configure Astro.

---

<Callout class="bg-blue-50 border-blue-600 dark:border-blue-900 dark:bg-blue-950 mt-0 mb-6 [&_code]:bg-blue-100 dark:[&_code]:bg-blue-900">

**Note:** The following guide is for Tailwind v4. If you are using Tailwind
v3, use `shadcn-vue@1.0.3`.

</Callout>

<Steps>

### Create project

Start by creating a new Astro project:

```bash
npx create-astro@latest astro-app  --template with-tailwindcss --install --add vue --git
```

### Edit tsconfig.json file

Add the following code to the `tsconfig.json` file to resolve paths:

```ts:line-numbers title="tsconfig.json" {4-9}
{
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
    // ...
  }
}
```

### Run the CLI

Run the `shadcn` init command to setup your project:

```bash
npx shadcn-vue@latest init
```

### Add Components

You can now start adding components to your project.

```bash
npx shadcn-vue@latest add button
```

The command above will add the `Button` component to your project. You can then import it like this:

```astro:line-numbers {2,10}
---
import { Button } from "@/components/ui/button"
---

<html lang="en">
	<head>
		<title>Astro</title>
	</head>
	<body>
		<Button>Hello World</Button>
	</body>
</html>
```

</Steps>

---

---

url: /docs/dark-mode/astro.md
description: Adding dark mode to your astro app.

---

## Dark mode

<Steps>

### Create an inline theme script

```astro title="src/pages/index.astro"
---
import '../styles/globals.css'
---

<script is:inline>
	const getThemePreference = () => {
		if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
			return localStorage.getItem('theme');
		}
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	};
	const isDark = getThemePreference() === 'dark';
	document.documentElement.classList[isDark ? 'add' : 'remove']('dark');

	if (typeof localStorage !== 'undefined') {
		const observer = new MutationObserver(() => {
			const isDark = document.documentElement.classList.contains('dark');
			localStorage.setItem('theme', isDark ? 'dark' : 'light');
		});
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
	}
</script>

<html lang="en">
	<body>
      <h1>Astro</h1>
	</body>
</html>
</script>
```

### Install Dependencies

```bash
npm install @vueuse/core
```

Optional, to include icons for theme button.

```bash
npm install -D @iconify/vue @iconify-json/radix-icons
```

### Add a mode toggle

Place a mode toggle on your site to toggle between light and dark mode.

We're using [`useColorMode`](https://vueuse.org/core/usecolormode/) from [`@vueuse/core`](https://vueuse.org/core/).

> Reactive color mode (dark / light / customs) with auto data persistence.

```vue
<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        <Icon icon="radix-icons:moon" class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Icon icon="radix-icons:sun" class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="mode = 'light'"> Light </DropdownMenuItem>
      <DropdownMenuItem @click="mode = 'dark'"> Dark </DropdownMenuItem>
      <DropdownMenuItem @click="mode = 'auto'"> System </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useColorMode } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const mode = useColorMode()
</script>
```

### Display the mode toggle

Place a mode toggle on your site to toggle between light and dark mode.

```astro title="src/pages/index.astro"
---
import '../styles/globals.css'
import ModeToggle from '@/components/ModeToggle.vue';
---

<!-- Inline script -->

<html lang="en">
	<body>
      <h1>Astro</h1>
      <ModeToggle client:load />
	</body>
</html>
```

</Steps>

---

---

url: /docs/components/auto-form.md
description: Automatically generate a form from Zod schema.

---

<Callout class="mt-6">

**Legacy**: Component will be moved to [extended repo](https://github.com/unovue/shadcn-vue/issues/1077) with Tailwind v4 support.

---

Credit: Heavily inspired by [AutoForm](https://github.com/vante…his cannot be changed after initialization.\*\* To switch between CSS variables and utility classes, you'll have to delete and re-install your components.

### tailwind.prefix

The prefix to use for your Tailwind CSS utility classes. Components will be added with this prefix.

```json title="components.json"
{
  "tailwind": {
    "prefix": "tw-"
  }
}
```

## aliases

The CLI uses these values and the `paths` config from your `tsconfig.json` or `jsconfig.json` file to place generated components in the correct location.

Path aliases have to be set up in your `tsconfig.json` or `jsconfig.json` file.

> A fallback to `tsconfig.app.json` if no `paths` were found in `tsconfig.json`

<Callout class="mt-6">

**Important:** If you're using the `src` directory, make sure it is included
under `paths` in your `tsconfig.json` or `jsconfig.json` file.

</Callout>

### aliases.utils

Import alias for your utility functions.

```json title="components.json"
{
  "aliases": {
    "utils": "@/lib/utils"
  }
}
```

### aliases.components

Import alias for your components.

```json title="components.json"
{
  "aliases": {
    "components": "@/components"
  }
}
```

### aliases.ui

Import alias for `ui` components.

The CLI will use the `aliases.ui` value to determine where to place your `ui` components. Use this config if you want to customize the installation directory for your `ui` components.

```json title="components.json"
{
  "aliases": {
    "ui": "@/app/ui"
  }
}
```

### aliases.lib

Import alias for `lib` functions such as `cn` or `valueUpdater`.

```json title="components.json"
{
  "aliases": {
    "lib": "@/lib"
  }
}
```

### aliases.composables

Import alias for `composables` such as `useMediaQuery` or `useToast`.

```json title="components.json"
{
  "aliases": {
    "composables": "@/composables"
  }
}
```

---

---

url: /docs/components/context-menu.md
description: >-
Displays a menu to the user — such as a set of actions or functions —
triggered by a button.

---

<ComponentPreview name="ContextMenuDemo"  />

## Installation

```bash
npx shadcn-vue@latest add context-menu
```

## Usage

```vue
<template>
  <ContextMenu>
    <ContextMenuTrigger>Right click</ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem>Profile</ContextMenuItem>
      <ContextMenuItem>Billing</ContextMenuItem>
      <ContextMenuItem>Team</ContextMenuItem>
      <ContextMenuItem>Subscription</ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>

<script setup lang="ts">
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
</script>
```

---

---

url: /docs/dark-mode.md
description: Adding dark mode to your site.

---

<script setup>
  import { useData } from 'vitepress'
  const { isDark } = useData()
  import ViteIcon from '~icons/simple-icons/vite'
  import NuxtIcon from '~icons/simple-icons/nuxtdotjs'
  import AstroIcon from '~icons/simple-icons/astro'
</script>

<div class="grid gap-4 sm:grid-cols-2 sm:gap-6 not-docs">
  <LinkedCard href="/docs/dark-mode/vite">
    <ViteIcon class="w-10 h-10" />
    <p class="mt-2 font-medium">Vite</p>
  </LinkedCard>

  <LinkedCard href="/docs/dark-mode/nuxt">
    <NuxtIcon class="w-10 h-10" />
    <p class="mt-2 font-medium">Nuxt</p>
  </LinkedCard>

  <LinkedCard href="/docs/dark-mode/vitepress">
    <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.03628 7.87818C4.75336 5.83955 6.15592 3.95466 8.16899 3.66815L33.6838 0.0367403C35.6969 -0.24977 37.5581 1.1706 37.841 3.20923L42.9637 40.1218C43.2466 42.1604 41.8441 44.0453 39.831 44.3319L14.3162 47.9633C12.3031 48.2498 10.4419 46.8294 10.159 44.7908L5.03628 7.87818Z" />
      <path d="M6.85877 7.6188C6.71731 6.59948 7.41859 5.65703 8.42512 5.51378L33.9399 1.88237C34.9465 1.73911 35.8771 2.4493 36.0186 3.46861L41.1412 40.3812C41.2827 41.4005 40.5814 42.343 39.5749 42.4862L14.0601 46.1176C13.0535 46.2609 12.1229 45.5507 11.9814 44.5314L6.85877 7.6188Z" class="fill-background"/>
      <path d="M33.1857 14.9195L25.8505 34.1576C25.6991 34.5547 25.1763 34.63 24.9177 34.2919L12.3343 17.8339C12.0526 17.4655 12.3217 16.9339 12.7806 16.9524L22.9053 17.3607C22.9698 17.3633 23.0344 17.3541 23.0956 17.3337L32.5088 14.1992C32.9431 14.0546 33.3503 14.4878 33.1857 14.9195Z" />
      <path d="M27.0251 12.5756L19.9352 15.0427C19.8187 15.0832 19.7444 15.1986 19.7546 15.3231L20.3916 23.063C20.4066 23.2453 20.5904 23.3628 20.7588 23.2977L22.7226 22.5392C22.9064 22.4682 23.1021 22.6138 23.0905 22.8128L22.9102 25.8903C22.8982 26.0974 23.1093 26.2436 23.295 26.1567L24.4948 25.5953C24.6808 25.5084 24.892 25.6549 24.8795 25.8624L24.5855 30.6979C24.5671 31.0004 24.9759 31.1067 25.1013 30.8321L25.185 30.6487L29.4298 17.8014C29.5008 17.5863 29.2968 17.3809 29.0847 17.454L27.0519 18.1547C26.8609 18.2205 26.6675 18.0586 26.6954 17.8561L27.3823 12.8739C27.4103 12.6712 27.2163 12.5091 27.0251 12.5756Z" class="stroke-background"/>
    </svg>
    <p class="mt-2 font-medium">Vitepress</p>
  </LinkedCard>

  <LinkedCard href="/docs/dark-mode/astro">
    <AstroIcon class="w-10 h-10" />
    <p class="mt-2 font-medium">Astro</p>
  </LinkedCard>
</div>

---

---

url: /docs/components/data-table.md
description: Powerful table and datagrids built using TanStack Table.

---

<ComponentPreview name="DataTableDemo" />

## Introduction

Every data table or datagrid I've created has been unique. They all behave differently, have specific sorting and filtering requirements, and work with different data sources.

It doesn't make sense to combine all of these variations into a single component. If we do that, we'll lose the flexibility that [headless UI](https://tanstack.com/table/latest/docs/introduction#what-is-headless-ui) provides.

So instead of a data-table component, I thought it would be more helpful to provide a guide on how to build your own.

We'll start with the basic `<Table />` component and build a complex data table from scratch.

<Callout class="mt-4">

**Tip:** If you find yourself using the same table in multiple places in your app, you can always extract it into a reusable component.

</Callout>

## Table of Contents

This guide will show you how to use [TanStack Table](https://tanstack.com/table/v8) and the `<Table />` component to build your own custom data table. We'll cover the following topics:

- [Basic Table](#basic-table)
- [Row Actions](#row-actions)
- [Pagination](#pagination)
- [Sorting](#sorting)
- [Filtering](#filtering)
- [Visibility](#visibility)
- [Row Selection](#row-selection)
- [Reusable Components](#reusable-components)

## Installation

1. Add the `<Table />` component to your project:

```bash
npx shadcn-vue@latest add table
```

2. Add `tanstack/vue-table` dependency:

```bash
npm install @tanstack/vue-table
```

## Examples

### Column Pinning

<ComponentPreview name="DataTableColumnPinningDemo" />

### Reactive Table

A reactive table was added in `v8.20.0` of the TanStack Table. You can see the [docs](https://tanstack.com/table/latest/docs/framework/vue/guide/table-state#using-reactive-data) for more information. We added an example where we are randomizing `status` column. One main point is that you need to mutate **full** data, as it is a `shallowRef` object.

> **_⚠️ `shallowRef` is used under the hood for performance reasons, meaning that the data is not deeply reactive, only the `.value` is. To update the data you have to mutate the data directly._**

Relative PR: [Tanstack/table #5687](https://github.com/TanStack/table/pull/5687#issuecomment-2281067245)

If you want to mutate `props.data`, you should use [`defineModel`](https://vuejs.org/api/sfc-script-setup.html#definemodel).

There is no difference between using `ref` or `shallowRef` for your data object; it will be automatically mutated by the TanStack Table to `shallowRef`.

<ComponentPreview name="DataTableReactiveDemo" />

## Prerequisites

We are going to build a table to show recent payments. Here's what our data looks like:

```ts:line-numbers
interface Payment {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  email: string
}

export const payments: Payment[] = [
  {
    id: '728ed52f',
    amount: 100,
    status: 'pending',
    email: 'm@example.com',
  },
  {
    id: '489e1d42',
    amount: 125,
    status: 'processing',
    email: 'example@gmail.com',
  },
  // ...
]
```

## Project Structure

Start by creating the following file structure:

```ansi
 components
    └── payments
          ├── columns.ts
          ├── data-table.vue
          ├── data-table-dropdown.vue
└── app.vue
```

I'm using a Nuxt example here but this works for any other Vue framework.

- `columns.ts` It will contain our column definitions.
- `data-table.vue` It will contain our `<DataTable />` component.
- `data-table-dropdown.vue` It will contain our `<DropdownAction />` component.
- `app.vue` This is where we'll fetch data and render our table.

## Basic Table

Let's start by building a basic table.

<Steps>

### Column Definitions

First, we'll define our columns in the `columns.ts` file.

```ts:line-numbers
import { h } from 'vue'

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'amount',
    header: () => h('div', { class: 'text-right' }, 'Amount'),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('amount'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)

      return h('div', { class: 'text-right font-medium' }, formatted)
    },
  }
]
```

<Callout class="mt-4">

**Note:** Columns are where you define the core of what your table
will look like. They define the data that will be displayed, how it will be
formatted, sorted and filtered.

</Callout>

### `<DataTable />` component

Next, we'll create a `<DataTable />` component to render our table.

```vue
<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <TableRow v-for="row in table.getRowModel().rows" :key="row.id" :data-state="row.getIsSelected() ? 'selected' : undefined">
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow>
            <TableCell :colspan="columns.length" class="h-24 text-center"> No results. </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef } from '@tanstack/vue-table'
import { FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}>()

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel()
})
</script>
```

<Callout>

**Tip**: If you find yourself using `<DataTable />` in multiple places, this is the component you could make reusable by extracting it to `components/ui/data-table.vue`.

`<DataTable :columns="columns" :data="data" />`

</Callout>

### Render the table

Finally, we'll render our table in our index component.

```vue
<template>
  <div class="container mx-auto py-10">
    <DataTable :columns="columns" :data="data" />
  </div>
</template>

<script setup lang="ts">
import type { Payment } from './components/columns'
import { onMounted, ref } from 'vue'
import { columns } from './components/columns'
import DataTable from './components/DataTable.vue'

const data = ref<Payment[]>([])

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: '728ed52f',
      amount: 100,
      status: 'pending',
      email: 'm@example.com'
    }
    // ...
  ]
}

onMounted(async () => {
  data.value = await getData()
})
</script>
```

</Steps>

## Cell Formatting

Let's format the amount cell to display the dollar amount. We'll also align the cell to the right.

<Steps>

### Update columns definition

Update the `header` and `cell` definitions for amount as follows:

```ts
import { h } from 'vue'

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'amount',
    header: () => h('div', { class: 'text-right' }, 'Amount'),
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue('amount'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)

      return h('div', { class: 'text-right font-medium' }, formatted)
    }
  }
]
```

You can use the same approach to format other cells and headers.
</Steps>

## Row Actions

Let's add row actions to our table. We'll use a `<Dropdown />` component for this.

<Steps>

### Add the following into your `DataTableDropDown.vue` component

```vue
<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="h-8 w-8 p-0">
        <span class="sr-only">Open menu</span>
        <MoreHorizontal class="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuItem @click="copy(payment.id)"> Copy payment ID </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>View customer</DropdownMenuItem>
      <DropdownMenuItem>View payment details</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

defineProps<{
  payment: {
    id: string
  }
}>()

function copy(id: string) {
  navigator.clipboard.writeText(id)
}
</script>
```

### Update columns definition

Update our columns definition to add a new `actions` column. The `actions` cell returns a `<Dropdown />` component.

```ts
import { ColumnDef } from '@tanstack/vue-table'
import DropdownAction from '@/components/DataTableDropDown.vue'

export const columns: ColumnDef<Payment>[] = [
  // ...
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original

      return h(
        'div',
        { class: 'relative' },
        h(DropdownAction, {
          payment
        })
      )
    }
  }
]
```

You can access the row data using `row.original` in the `cell` function. Use this to handle actions for your row eg. use the `id` to make a DELETE call to your API.

</Steps>

## Pagination

Next, we'll add pagination to our table.

<Steps>

### Update `<DataTable>`

```ts:line-numbers {4,12}
import {
    FlexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useVueTable,
} from "@tanstack/vue-table"

const table = useVueTable({
    get data() { return props.data },
    get columns() { return props.columns },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
})
```

This will automatically paginate your rows into pages of 10. See the [pagination docs](https://tanstack.com/table/v8/docs/api/features/pagination) for more information on customizing page size and implementing manual pagination.

### Add pagination controls

We can add pagination controls to our table using the `<Button />` component and the `table.previousPage()`, `table.nextPage()` API methods.

```vue
<template>
  <div>
    <div class="rounded-md border">
      <Table> { // .... } </Table>
    </div>
    <div class="flex items-center justify-end space-x-2 py-4">
      <Button variant="outline" size="sm" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()"> Previous </Button>
      <Button variant="outline" size="sm" :disabled="!table.getCanNextPage()" @click="table.nextPage()"> Next </Button>
    </div>
  </div>
</template>

<script lang="ts" generic="TData, TValue">
import { Button } from '@/components/ui/button'

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel()
})
</script>
```

See [Reusable Components](#reusable-components) section for a more advanced pagination component.

</Steps>

## Sorting

Let's make the email column sortable.

<Steps>

### Add the following into your `utils` file

```ts
import type { Updater } from '@tanstack/vue-table'
import type { ClassValue } from 'clsx'

import type { Ref } from 'vue'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value = typeof updaterOrValue === 'function' ? updaterOrValue(ref.value) : updaterOrValue
}
```

The `valueUpdater` function updates a Vue `ref` object's value. It handles both direct assignments and transformations using a function. If `updaterOrValue` is a function, it's called with the current `ref` value, and the result is assigned to `ref.value`. If it's not a function, it's directly assigned to `ref.value`. This utility enhances flexibility in updating `ref` values. While Vue `ref` can manage reactive state directly, `valueUpdater` simplifies value updates, improving code readability and maintainability when the new state can be a direct value or a function generating it based on the current one.

### Update `<DataTable>`

```vue:line-numbers {4,14,17,33,40-44}
<script setup lang="ts" generic="TData, TValue">
import type {
  ColumnDef,
  SortingState,
} from '@tanstack/vue-table'

import { ArrowUpDown, ChevronDown } from 'lucide-vue-next'
import { h, ref } from 'vue'

import {
  FlexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { valueUpdater } from '@/lib/utils'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}>()

const sorting = ref<SortingState>([])

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  state: {
    get sorting() { return sorting.value },
  },
})
</script>

<template>
  <div>
    <div class="border rounded-md">
      <Table>{ ... }</Table>
    </div>
  </div>
</template>
```

### Make header cell sortable

We can now update the `email` header cell to add sorting controls.

```ts:line-numbers {5,10-17}
// components/payments/columns.ts
import type {
  ColumnDef,
} from '@tanstack/vue-table'
import { ArrowUpDown, ChevronDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

export const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: 'email',
        header: ({ column }) => {
            return h(Button, {
                variant: 'ghost',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            }, () => ['Email', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })])
        },
        cell: ({ row }) => h('div', { class: 'lowercase' }, row.getValue('email')),
    },
]
```

This will automatically sort the table (asc and desc) when the user toggles on the header cell.

</Steps>

## Filtering

Let's add a search input to filter emails in our table.

<Steps>

### Update `<DataTable>`

```vue:line-numbers {4,11,19,39,48-49,52,60-64}
<script setup lang="ts" generic="TData, TValue">
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from '@tanstack/vue-table'

import { valueUpdater } from '@/lib/utils'

import { ArrowUpDown, ChevronDown } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { h, ref } from 'vue'

import {
    FlexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useVueTable,
} from "@tanstack/vue-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const props = defineProps<{
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}>()

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])

const table = useVueTable({
    get data() { return props.data },
    get columns() { return props.columns },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
    onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
        get sorting() { return sorting.value },
        get columnFilters() { return columnFilters.value },
    },
})

</script>

<template>
    <div>
        <div class="flex items-center py-4">
            <Input class="max-w-sm" placeholder="Filter emails..."
                :model-value="table.getColumn('email')?.getFilterValue() as string"
                @update:model-value=" table.getColumn('email')?.setFilterValue($event)" />
        </div>
        <div class="border rounded-md">
            <Table>{ ... }</Table>
        </div>
    </div>
</template>

```

Filtering is now enabled for the `email` column. You can add filters to other columns as well. See the [filtering docs](https://tanstack.com/table/v8/docs/guide/filters) for more information on customizing filters.

</Steps>

## Visibility

Adding column visibility is fairly simple using `@tanstack/vue-table` visibility API.

<Steps>

### Update `<DataTable>`

```vue:line-numbers {6,9-14,48,59,63,75-91}
<script setup lang="ts" generic="TData, TValue">
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/vue-table'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { valueUpdater } from '@/lib/utils'

import { ArrowUpDown, ChevronDown } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { h, ref } from 'vue'

import {
    FlexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useVueTable,
} from "@tanstack/vue-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const props = defineProps<{
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}>()

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})

const table = useVueTable({
    get data() { return props.data },
    get columns() { return props.columns },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
    onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
    onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
    state: {
        get sorting() { return sorting.value },
        get columnFilters() { return columnFilters.value },
        get columnVisibility() { return columnVisibility.value },
    },
})

</script>

<template>
    <div>
        <div class="flex items-center py-4">
            <Input class="max-w-sm" placeholder="Filter emails..."
                :model-value="table.getColumn('email')?.getFilterValue() as string"
                @update:model-value=" table.getColumn('email')?.setFilterValue($event)" />
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="outline" class="ml-auto">
                        Columns
                        <ChevronDown class="w-4 h-4 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                        v-for="column in table.getAllColumns().filter((column) => column.getCanHide())" :key="column.id"
                        class="capitalize" :modelValue="column.getIsVisible()" @update:modelValue="(value) => {
                            column.toggleVisibility(!!value)
                        }">
                        {{ column.id }}
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div class="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                        <TableHead v-for="header in headerGroup.headers" :key="header.id">
                            <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                                :props="header.getContext()" />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="table.getRowModel().rows?.length">
                        <TableRow v-for="row in table.getRowModel().rows" :key="row.id"
                            :data-state="row.getIsSelected() ? 'selected' : undefined">
                            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                            </TableCell>
                        </TableRow>
                    </template>
                    <template v-else>
                        <TableRow>
                            <TableCell :colSpan="columns.length" class="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    </template>
                </TableBody>
            </Table>
        </div>
    </div>
</template>

```

This adds a dropdown menu that you can use to toggle column visibility.

</Steps>

## Row Selection

Next, we're going to add row selection to our table.

<Steps>

### Update column definitions

```ts:line-numbers {3,6-20}
import type { ColumnDef } from '@tanstack/vue-table'

import { Checkbox } from '@/components/ui/checkbox'

export const columns: ColumnDef<Payment>[] = [
    {
        id: 'select',
        header: ({ table }) => h(Checkbox, {
            'modelValue': table.getIsAllPageRowsSelected(),
            'onUpdate:modelValue': (value: boolean) => table.toggleAllPageRowsSelected(!!value),
            'ariaLabel': 'Select all',
        }),
        cell: ({ row }) => h(Checkbox, {
            'modelValue': row.getIsSelected(),
            'onUpdate:modelValue': (value: boolean) => row.toggleSelected(!!value),
            'ariaLabel': 'Select row',
        }),
        enableSorting: false,
        enableHiding: false,
    },
]
```

### Update `<DataTable>`

```vue:line-numbers {10,22,27}
<script setup lang="ts" generic="TData, TValue">
const props = defineProps<{
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}>()

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})

const table = useVueTable({
    get data() { return props.data },
    get columns() { return props.columns },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
    onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
    onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
    onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
    state: {
        get sorting() { return sorting.value },
        get columnFilters() { return columnFilters.value },
        get columnVisibility() { return columnVisibility.value },
        get rowSelection() { return rowSelection.value },
    },
})

</script>

<template>
  <div>
    <div class="border rounded-md">
        <Table />
    </div>
  </div>
</template>

```

This adds a checkbox to each row and a checkbox in the header to select all rows.

### Show selected rows

You can show the number of selected rows using the `table.getFilteredSelectedRowModel()` API.

```vue:line-numbers {8-11}
<template>
  <div>
    <div class="border rounded-md">
        <Table />
    </div>

    <div class="flex items-center justify-end space-x-2 py-4">
      <div class="flex-1 text-sm text-muted-foreground">
        {{ table.getFilteredSelectedRowModel().rows.length }} of
        {{ table.getFilteredRowModel().rows.length }} row(s) selected.
      </div>
      <div class="space-x-2">
        <PaginationButtons />
      </div>
    </div>
  </div>
</template>

```

</Steps>

<Steps>

## Expanding

Let's make rows expandable.

### Update `<DataTable>`

```vue:line-numbers {7,30,43,52,57,63,103-116}
<script setup lang="ts" generic="TData, TValue">
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  ExpandedState,
} from '@tanstack/vue-table'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { valueUpdater } from '@/lib/utils'

import { ArrowUpDown, ChevronDown } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { h, ref } from 'vue'

import {
    FlexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getExpandedRowModel,
    useVueTable,
} from "@tanstack/vue-table"

const props = defineProps<{
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}>()

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})
const expanded = ref<ExpandedState>({})

const table = useVueTable({
    get data() { return props.data },
    get columns() { return props.columns },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
    onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
    onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
    onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
    onExpandedChange: updaterOrValue => valueUpdater(updaterOrValue, expanded),
    state: {
        get sorting() { return sorting.value },
        get columnFilters() { return columnFilters.value },
        get columnVisibility() { return columnVisibility.value },
        get rowSelection() { return rowSelection.value },
        get expanded() { return expanded.value },
    },
})
</script>

<template>
    <div>
        <div class="flex items-center py-4">
            <Input class="max-w-sm" placeholder="Filter emails..."
                :model-value="table.getColumn('email')?.getFilterValue() as string"
                @update:model-value=" table.getColumn('email')?.setFilterValue($event)" />
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button variant="outline" class="ml-auto">
                        Columns
                        <ChevronDown class="w-4 h-4 ml-2" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                        v-for="column in table.getAllColumns().filter((column) => column.getCanHide())" :key="column.id"
                        class="capitalize" :modelValue="column.getIsVisible()" @update:modelValue="(value) => {
                            column.toggleVisibility(!!value)
                        }">
                        {{ column.id }}
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div class="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                        <TableHead v-for="header in headerGroup.headers" :key="header.id">
                            <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                                :props="header.getContext()" />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="table.getRowModel().rows?.length">
                      <template v-for="row in table.getRowModel().rows" :key="row.id">
                        <TableRow :data-state="row.getIsSelected() ? 'selected' : undefined">
                            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                            </TableCell>
                        </TableRow>
                        <TableRow v-if="row.getIsExpanded()">
                          <TableCell :colspan="row.getAllCells().length">
                            {{ JSON.stringify(row.original) }}
                          </TableCell>
                        </TableRow>
                      </template>
                    </template>
                    <template v-else>
                        <TableRow>
                            <TableCell :colSpan="columns.length" class="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    </template>
                </TableBody>
            </Table>
        </div>
    </div>
</template>
```

### Add the expand action to the `DataTableDropDown.vue` component

```vue:line-numbers {12-14,34-36}
<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

defineProps<{
  payment: {
    id: string
  }
}>()

defineEmits<{
  (e: 'expand'): void
}>()

function copy(id: string) {
  navigator.clipboard.writeText(id)
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="w-8 h-8 p-0">
        <span class="sr-only">Open menu</span>
        <MoreHorizontal class="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuItem @click="copy(payment.id)">
        Copy payment ID
      </DropdownMenuItem>
      <DropdownMenuItem @click="$emit('expand')">
        Expand
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>View customer</DropdownMenuItem>
      <DropdownMenuItem>View payment details</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
```

### Make rows expandable

Now we can update the action cell to add the expand control.

```vue:line-numbers {11}
<script setup lang="ts">
export const columns: ColumnDef<Payment>[] = [
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original

      return h('div', { class: 'relative' }, h(DropdownAction, {
        payment,
        onExpand: row.toggleExpanded,
      }))
    },
  },
]
</script>

```

</Steps>

## Reusable Components

Here are some components you can use to build your data tables. This is from the [Tasks](/examples/tasks) demo.

### Column header

Make any column header sortable and hideable.

```vue:line-numbers
<script setup lang="ts">
import type { Column } from '@tanstack/vue-table'
import { type Task } from '../data/schema'
import ArrowDownIcon from '~icons/radix-icons/arrow-down'
import ArrowUpIcon from '~icons/radix-icons/arrow-up'
import CaretSortIcon from '~icons/radix-icons/caret-sort'
import EyeNoneIcon from '~icons/radix-icons/eye-none'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DataTableColumnHeaderProps {
  column: Column<Task, any>
  title: string
}

defineProps<DataTableColumnHeaderProps>()
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div v-if="column.getCanSort()" :class="cn('flex items-center space-x-2', $attrs.class ?? '')">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          class="-ml-3 h-8 data-[state=open]:bg-accent"
        >
          <span>{{ title }}</span>
          <ArrowDownIcon v-if="column.getIsSorted() === 'desc'" class="w-4 h-4 ml-2" />
          <ArrowUpIcon v-else-if=" column.getIsSorted() === 'asc'" class="w-4 h-4 ml-2" />
          <CaretSortIcon v-else class="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem @click="column.toggleSorting(false)">
          <ArrowUpIcon class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem @click="column.toggleSorting(true)">
          <ArrowDownIcon class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Desc
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="column.toggleVisibility(false)">
          <EyeNoneIcon class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Hide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  <div v-else :class="$attrs.class">
    {{ title }}
  </div>
</template>

```

```ts:line-numbers
export const columns = [
  {
    accessorKey: "email",
    header: ({ column }) => (
        h(DataTableColumnHeader, {
            column: column,
            title: 'Email'
        })
    ),
  },
]
```

### Pagination

Add pagination controls to your table including page size and selection count.

```vue:line-numbers
<script setup lang="ts">
import { type Table } from '@tanstack/vue-table'
import { type Task } from '../data/schema'
import ChevronLeftIcon from '~icons/radix-icons/chevron-left'
import ChevronRightIcon from '~icons/radix-icons/chevron-right'
import DoubleArrowLeftIcon from '~icons/radix-icons/double-arrow-left'
import DoubleArrowRightIcon from '~icons/radix-icons/double-arrow-right'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTablePaginationProps {
  table: Table<Task>
}
defineProps<DataTablePaginationProps>()
</script>

<template>
  <div class="flex items-center justify-between px-2">
    <div class="flex-1 text-sm text-muted-foreground">
      {{ table.getFilteredSelectedRowModel().rows.length }} of
      {{ table.getFilteredRowModel().rows.length }} row(s) selected.
    </div>
    <div class="flex items-center space-x-6 lg:space-x-8">
      <div class="flex items-center space-x-2">
        <p class="text-sm font-medium">
          Rows per page
        </p>
        <Select
          :model-value="`${table.getState().pagination.pageSize}`"
          @update:model-value="table.setPageSize"
        >
          <SelectTrigger class="h-8 w-[70px]">
            <SelectValue :placeholder="`${table.getState().pagination.pageSize}`" />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectItem v-for="pageSize in [10, 20, 30, 40, 50]" :key="pageSize" :value="`${pageSize}`">
              {{ pageSize }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {{ table.getState().pagination.pageIndex + 1 }} of
        {{ table.getPageCount() }}
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          class="hidden w-8 h-8 p-0 lg:flex"
          :disabled="!table.getCanPreviousPage()"
          @click="table.setPageIndex(0)"
        >
          <span class="sr-only">Go to first page</span>
          <DoubleArrowLeftIcon class="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          class="w-8 h-8 p-0"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          <span class="sr-only">Go to previous page</span>
          <ChevronLeftIcon class="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          class="w-8 h-8 p-0"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          <span class="sr-only">Go to next page</span>
          <ChevronRightIcon class="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          class="hidden w-8 h-8 p-0 lg:flex"
          :disabled="!table.getCanNextPage()"
          @click="table.setPageIndex(table.getPageCount() - 1)"
        >
          <span class="sr-only">Go to last page</span>
          <DoubleArrowRightIcon class="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

```

```vue
<DataTablePagination :table="table" />
```

### Column toggle

A component to toggle column visibility.

```vue:line-numbers
<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'
import { computed } from 'vue'
import { type Task } from '../data/schema'
import MixerHorizontalIcon from '~icons/radix-icons/mixer-horizontal'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DataTableViewOptionsProps {
  table: Table<Task>
}

const props = defineProps<DataTableViewOptionsProps>()

const columns = computed(() => props.table.getAllColumns()
  .filter(
    column =>
      typeof column.accessorFn !== 'undefined' && column.getCanHide(),
  ))
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        size="sm"
        class="hidden h-8 ml-auto lg:flex"
      >
        <MixerHorizontalIcon class="w-4 h-4 mr-2" />
        View
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-[150px]">
      <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
      <DropdownMenuSeparator />

      <DropdownMenuCheckboxItem
        v-for="column in columns"
        :key="column.id"
        class="capitalize"
        :modelValue="column.getIsVisible()"
        @update:modelValue="(value) => column.toggleVisibility(!!value)"
      >
        {{ column.id }}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
```

```vue
<DataTableViewOptions :table="table" />
```

---

---

url: /docs/components/date-picker.md
description: A date picker component with range and presets.

---

<ComponentPreview name="DatePickerDemo" />

## Installation

The Date Picker is built using a composition of the `<Popover />` and either the `<Calendar />` or `<RangeCalendar />` components.

See installations instructions for the [Popover](/docs/components/popover), [Calendar](/docs/components/calendar), and [Range Calendar](/docs/components/range-calendar) components.

## Examples

### Date Picker

<ComponentPreview name="DatePickerDemo" />

### Date Range Picker

<ComponentPreview name="DatePickerWithRange" />

### Date Range Picker with Independent Months

<ComponentPreview name="DatePickerWithIndependentMonths" />

### With Presets

<ComponentPreview name="DatePickerWithPresets" />

### Form

<ComponentPreview name="DatePickerForm" />

---

---

url: /docs/components/dialog.md
description: >-
A window overlaid on either the primary window or another dialog window,
rendering the content underneath inert.

---

<ComponentPreview name="DialogDemo" />

## Installation

```bash
npx shadcn-vue@latest add dialog
```

## Usage

```vue
<template>
  <Dialog>
    <DialogTrigger> Edit Profile </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription> Make changes to your profile here. Click save when you're done. </DialogDescription>
      </DialogHeader>

      <DialogFooter> Save changes </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
</script>
```

## Examples

### Custom close button

<ComponentPreview name="DialogCustomCloseButton" />

### Scroll body

<ComponentPreview name="DialogScrollBodyDemo" />

### Scroll overlay

<ComponentPreview name="DialogScrollOverlayDemo" />

### Form

<ComponentPreview name="DialogForm" />

## Notes

To activate the `Dialog` component from within a `Context Menu` or `Dropdown Menu`, you must encase the `Context Menu` or `Dropdown Menu` component in the `Dialog` component. For more information, refer to the linked issue [here](https://github.com/radix-ui/primitives/issues/1836).

```js:line-numbers showLineNumber{14-25}
<Dialog>
  <ContextMenu>
    <ContextMenuTrigger>Right click</ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem>Open</ContextMenuItem>
      <ContextMenuItem>Download</ContextMenuItem>
      <DialogTrigger asChild>
        <ContextMenuItem>
          <span>Delete</span>
        </ContextMenuItem>
      </DialogTrigger>
    </ContextMenuContent>
  </ContextMenu>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. Are you sure you want to permanently
        delete this file from our servers?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button type="submit">Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

---

url: /docs/charts/donut.md
description: >-
A line chart visually represents data in a circular form, similar to a pie
chart but with a central void, emphasizing proportions within categories.

---

<ComponentPreview name="DonutChartDemo"  />

## Installation

<Callout>
Only works with Vue >3.3
</Callout>

<Steps>

### Run the following command

```bash
npx shadcn-vue@latest add chart-donut
```

### Setup

Follow the [guide](/docs/charts.html#installation) to complete the setup.

</Steps>

## API

<!-- @include: @/content/meta/DonutChart.md -->

## Example

### Pie Chart

If you want to render pie chart instead, pass `type` as `pie`.

<ComponentPreview name="DonutChartPie"  />

### Color

We generate colors automatically based on the primary and secondary color and assigned them accordingly. Feel free to pass in your own array of colors.

<ComponentPreview name="DonutChartColor"  />

### Custom Tooltip

If you want to render custom tooltip, you can easily pass in a custom component. Refer to prop definition [here](/docs/charts.html#custom-tooltip).

<ComponentPreview name="DonutChartCustomTooltip"  />

---

---

url: /docs/components/drawer.md
description: A drawer component for vue.

---

<ComponentPreview name="DrawerDemo" />

## About

Drawer is built on top of [Vaul Vue](https://github.com/unovue/vaul-vue).

## Installation

```bash
npx shadcn-vue@latest add drawer
```

## Usage

```vue showLineNumbers
<template>
  <Drawer>
    <DrawerTrigger>Open</DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Are you absolutely sure?</DrawerTitle>
        <DrawerDescription>This action cannot be undone.</DrawerDescription>
      </DrawerHeader>
      <DrawerFooter>
        <Button>Submit</Button>
        <DrawerClose>
          <Button variant="outline"> Cancel </Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>

<script setup lang="ts">
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
</script>
```

### Scale Background

If you want the background to have a zoom effect, you need to add the `vaul-drawer-wrapper` attribute to the root component.

```html
<div vaul-drawer-wrapper id="app"></div>
```

## Examples

### Responsive Dialog

You can combine the `Dialog` and `Drawer` components to create a responsive dialog. This renders a `Dialog` component on desktop and a `Drawer` on mobile.

<ComponentPreview name="DrawerDialog" />

---

---

url: /docs/components/dropdown-menu.md
description: >-
Displays a menu to the user — such as a set of actions or functions —
triggered by a button.

---

<ComponentPreview name="DropdownMenuDemo" />

## Installation

```bash
npx shadcn-vue@latest add dropdown-menu
```

## Usage

```vue
<template>
  <DropdownMenu>
    <DropdownMenuTrigger>Open</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Billing</DropdownMenuItem>
      <DropdownMenuItem>Team</DropdownMenuItem>
      <DropdownMenuItem>Subscription</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
</script>
```

## Examples

### Checkboxes

<ComponentPreview name="DropdownMenuCheckboxes" />

### Radio Group

<ComponentPreview name="DropdownMenuRadioGroup" />

---

---

url: /docs/registry/examples.md
description: 'Examples of registry items: styles, components, css vars, etc.'

---

## registry:style

### Custom style that extends shadcn-vue

The following registry item is a custom style that extends shadcn-vue. On `npx shadcn-vue init`, it will:

- Install `@iconify/vue` as a dependency.
- Add the `Login01` block and `calendar` component to the project.
- Add the `editor` from a remote registry.
- Set the `font-sans` variable to `Inter, sans-serif`.
- Install a `brand` color in light and dark mode.

```json:line-numbers title="example-style.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "example-style",
  "type": "registry:style",
  "dependencies": ["@iconify/vue"],
  "registryDependencies": [
    "Login01",
    "calendar",
    "https://example.com/r/editor.json"
  ],
  "cssVars": {
    "theme": {
      "font-sans": "Inter, sans-serif"
    },
    "light": {
      "brand": "20 14.3% 4.1%"
    },
    "dark": {
      "brand": "20 14.3% 4.1%"
    }
  }
}
```

### Custom style from scratch

The following registry item is a custom style that doesn't extend shadcn-vue. See the `extends: none` field.

It can be used to create a new style from scratch i.e custom components, css vars, dependencies, etc.

On `npx shadcn-vue add`, the following will:

- Install `tailwind-merge` and `clsx` as dependencies.
- Add the `utils` registry item from the shadcn-vue registry.
- Add the `button`, `input`, `label`, and `select` components from a remote registry.
- Install new css vars: `main`, `bg`, `border`, `text`, `ring`.

```json:line-numbers title="example-style.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "extends": "none",
  "name": "new-style",
  "type": "registry:style",
  "dependencies": ["tailwind-merge", "clsx"],
  "registryDependencies": [
    "utils",
    "https://example.com/r/button.json",
    "https://example.com/r/input.json",
    "https://example.com/r/label.json",
    "https://example.com/r/select.json"
  ],
  "cssVars": {
    "theme": {
      "font-sans": "Inter, sans-serif",
    }
    "light": {
      "main": "#88aaee",
      "bg": "#dfe5f2",
      "border": "#000",
      "text": "#000",
      "ring": "#000",
    },
    "dark": {
      "main": "#88aaee",
      "bg": "#272933",
      "border": "#000",
      "text": "#e6e6e6",
      "ring": "#fff",
    }
  }
}
```

## registry:theme

### Custom theme

```json:line-numbers title="example-theme.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "custom-theme",
  "type": "registry:theme",
  "cssVars": {
    "light": {
      "background": "oklch(1 0 0)",
      "foreground": "oklch(0.141 0.005 285.823)",
      "primary": "oklch(0.546 0.245 262.881)",
      "primary-foreground": "oklch(0.97 0.014 254.604)",
      "ring": "oklch(0.746 0.16 232.661)",
      "sidebar-primary": "oklch(0.546 0.245 262.881)",
      "sidebar-primary-foreground": "oklch(0.97 0.014 254.604)",
      "sidebar-ring": "oklch(0.746 0.16 232.661)"
    },
    "dark": {
      "background": "oklch(1 0 0)",
      "foreground": "oklch(0.141 0.005 285.823)",
      "primary": "oklch(0.707 0.165 254.624)",
      "primary-foreground": "oklch(0.97 0.014 254.604)",
      "ring": "oklch(0.707 0.165 254.624)",
      "sidebar-primary": "oklch(0.707 0.165 254.624)",
      "sidebar-primary-foreground": "oklch(0.97 0.014 254.604)",
      "sidebar-ring": "oklch(0.707 0.165 254.624)"
    }
  }
}
```

### Custom colors

The following style will init using shadcn-vue defaults and then add a custom `brand` color.

```json:line-numbers title="example-style.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "custom-style",
  "type": "registry:style",
  "cssVars": {
    "light": {
      "brand": "oklch(0.99 0.00 0)"
    },
    "dark": {
      "brand": "oklch(0.14 0.00 286)"
    }
  }
}
```

## registry:block

### Custom block

This blocks installs the `Login01` block from the shadcn-vue registry.

```json:line-numbers title="Login01.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "Login01",
  "type": "registry:block",
  "description": "A simple login form.",
  "registryDependencies": ["button", "card", "input", "label"],
  "files": [
    {
      "path": "blocks/Login01/page.vue",
      "content": "import { LoginForm } ...",
      "type": "registry:page",
      "target": "pages/login/index.vue"
    },
    {
      "path": "blocks/Login01/components/LoginForm.vue",
      "content": "...",
      "type": "registry:component"
    }
  ]
}
```

### Install a block and override primitives

You can install a block fromt the shadcn-vue registry and override the primitives using your custom ones.

On `npx shadcn-vue add`, the following will:

- Add the `Login01` block from the shadcn-vue registry.
- Override the `button`, `input`, and `label` primitives with the ones from the remote registry.

```json:line-numbers title="example-style.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "custom-login",
  "type": "registry:block",
  "registryDependencies": [
    "Login01",
    "https://example.com/r/button.json",
    "https://example.com/r/input.json",
    "https://example.com/r/label.json"
  ]
}
```

## CSS Variables

### Custom Theme Variables

Add custom theme variables to the `theme` object.

```json:line-numbers title="example-theme.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "custom-theme",
  "type": "registry:theme",
  "cssVars": {
    "theme": {
      "font-heading": "Inter, sans-serif",
      "shadow-card": "0 0 0 1px rgba(0, 0, 0, 0.1)"
    }
  }
}
```

### Override Tailwind CSS variables

```json:line-numbers title="example-theme.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "custom-theme",
  "type": "registry:theme",
  "cssVars": {
    "theme": {
      "spacing": "0.2rem",
      "breakpoint-sm": "640px",
      "breakpoint-md": "768px",
      "breakpoint-lg": "1024px",
      "breakpoint-xl": "1280px",
      "breakpoint-2xl": "1536px"
    }
  }
}
```

## Add custom CSS

### Base styles

```json:line-numbers title="example-base.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "custom-style",
  "type": "registry:style",
  "css": {
    "@layer base": {
      "h1": {
        "font-size": "var(--text-2xl)"
      },
      "h2": {
        "font-size": "var(--text-xl)"
      }
    }
  }
}
```

### Components

```json:line-numbers title="example-card.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "custom-card",
  "type": "registry:component",
  "css": {
    "@layer components": {
      "card": {
        "background-color": "var(--color-white)",
        "border-radius": "var(--rounded-lg)",
        "padding": "var(--spacing-6)",
        "box-shadow": "var(--shadow-xl)"
      }
    }
  }
}
```

## Add custom utilities

### Simple utility

```json:line-numbers title="example-component.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "custom-component",
  "type": "registry:component",
  "css": {
    "@utility content-auto": {
      "content-visibility": "auto"
    }
  }
}
```

### Complex utility

```json:line-numbers title="example-utility.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "custom-component",
  "type": "registry:component",
  "css": {
    "@utility scrollbar-hidden": {
      "scrollbar-hidden": {
        "&::-webkit-scrollbar": {
          "display": "none"
        }
      }
    }
  }
}
```

### Functional utilities

```json:line-numbers title="example-functional.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "custom-component",
  "type": "registry:component",
  "css": {
    "@utility tab-*": {
      "tab-size": "var(--tab-size-*)"
    }
  }
}
```

## Add custom animations

Note: you need to define both `@keyframes` in css and `theme` in cssVars to use animations.

```json:line-numbers title="example-component.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "custom-component",
  "type": "registry:component",
  "cssVars": {
    "theme": {
      "--animate-wiggle": "wiggle 1s ease-in-out infinite"
    }
  },
  "css": {
    "@keyframes wiggle": {
      "0%, 100%": {
        "transform": "rotate(-3deg)"
      },
      "50%": {
        "transform": "rotate(3deg)"
      }
    }
  }
}
```

---

---

url: /docs/registry/faq.md
description: Frequently asked questions about running a registry.

---

## Frequently asked questions

### What does a complex component look like?

Here's an example of a complex component that installs a page, two components, a composable, a format date utils and a config file.

```json:line-numbers
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "hello-world",
  "title": "Hello World",
  "type": "registry:block",
  "description": "A complex hello world component",
  "files": [
    {
      "path": "registry/new-york/HelloWorld/page.vue",
      "type": "registry:page",
      "target": "pages/hello/index.vue"
    },
    {
      "path": "registry/new-york/HelloWorld/components/HelloWorld.vue",
      "type": "registry:component"
    },
    {
      "path": "registry/new-york/HelloWorld/components/FormattedMessage.vue",
      "type": "registry:component"
    },
    {
      "path": "registry/new-york/HelloWorld/composables/useHello.ts",
      "type": "registry:hook"
    },
    {
      "path": "registry/new-york/HelloWorld/lib/formatDate.ts",
      "type": "registry:utils"
    },
    {
      "path": "registry/new-york/HelloWorld/hello.config.ts",
      "type": "registry:file",
      "target": "~/hello.config.ts"
    }
  ]
}
```

### How do I add a new Tailwind color?

To add a new color you need to add it to `cssVars` and `tailwind.config.theme.extend.colors`.

```json:line-numbers {10-19} {24-29}
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "hello-world",
  "title": "Hello World",
  "type": "registry:block",
  "description": "A complex hello world component",
  "files": [
    // ...
  ],
  "cssVars": {
    "light": {
      "brand-background": "20 14.3% 4.1%",
      "brand-accent": "20 14.3% 4.1%"
    },
    "dark": {
      "brand-background": "20 14.3% 4.1%",
      "brand-accent": "20 14.3% 4.1%"
    }
  },
  "tailwind": {
    "config": {
      "theme": {
        "extend": {
          "colors": {
            "brand": {
              "DEFAULT": "hsl(var(--brand-background))",
              "accent": "hsl(var(--brand-accent))"
            }
          }
        }
      }
    }
  }
}
```

The CLI will update the project CSS file and tailwind.config.js file. Once updated, the new colors will be available to be used as utility classes: `bg-brand` and `text-brand-accent`.

### How do I add a Tailwind animation?

To add a new animation you add it to `tailwind.config.theme.extend.animation` and `tailwind.config.theme.extend.keyframes`.

```json:line-numbers {14-22}
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "hello-world",
  "title": "Hello World",
  "type": "registry:block",
  "description": "A complex hello world component",
  "files": [
    // ...
  ],
  "tailwind": {
    "config": {
      "theme": {
        "extend": {
          "keyframes": {
            "wiggle": {
              "0%, 100%": { "transform": "rotate(-3deg)" },
              "50%": { "transform": "rotate(3deg)" }
            }
          },
          "animation": {
            "wiggle": "wiggle 1s ease-in-out infinite"
          }
        }
      }
    }
  }
}
```

---

---

url: /docs/figma.md
description: >-
Every component recreated in Figma. With customizable props, typography and
icons.

---

<script setup>
import { AspectRatio } from '@/registry/default/ui/aspect-ratio';
</script>

The Figma UI Kit is open sourced by [Pietro Schirano](https://twitter.com/skirano).

<AspectRatio :ratio="16 / 9" class="w-full mt-4">
  <iframe
    src="https://embed.figma.com/file/1203061493325953101/hf_embed?community_viewer=true&embed_host=shadcn&hub_file_id=1203061493325953101&kind=&viewer=1"
    class="h-full w-full overflow-hidden rounded-lg border bg-muted"
  />
</AspectRatio>

## Grab a copy

<div class="break-words">

https://www.figma.com/community/file/1203061493325953101

</div>

---

---

url: /docs/registry/getting-started.md
description: Learn how to get setup and run your own component registry.

---

This guide will walk you through the process of setting up your own component registry.

It assumes you already have a project with components and would like to turn it into a registry.

<!-- If you're starting a new registry project, you can use the [registry template](https://github.com/shadcn-ui/registry-template) as a starting point. We have already configured it for you. -->

## registry.json

The `registry.json` file is only required if you're using the `shadcn-vue` CLI to build your registry.

If you're using a different build system, you can skip this step as long as your build system produces valid JSON files that conform to the [registry-item schema specification](/docs/registry/registry-item-json).

<Steps>

### Add a registry.json file

Create a `registry.json` file in the root of your project. Your project can be a Nuxt, Vite, or any other project that supports Vue.

```json:line-numbers title="registry.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry.json",
  "name": "acme",
  "homepage": "https://acme.com",
  "items": [
    // ...
  ]
}
```

This `registry.json` file must conform to the [registry schema specification](/docs/registry/registry-json).

</Steps>

## Add a registry item

<Steps>

### Create your component

Add your first component. Here's an example of a simple `<HelloWorld />` component:

```vue:line-numbers title="registry/new-york/HelloWorld/HelloWorld.vue"
<script setup lang="ts">
import { Button } from "@/components/ui/button"
</script>

<template>
  <Button>Hello World</Button>
</template>
```

<Callout class="mt-6">

**Note:** This example places the component in the `registry/new-york`
directory. You can place it anywhere in your project as long as you set the
correct path in the `registry.json` file and you follow the `registry/[NAME]`
directory structure.

</Callout>

```txt
registry
└── new-york
    └── HelloWorld
        └── HelloWorld.vue
```

<Callout class="mt-6 [&_pre]:mb-0">

**Important:** If you're placing your component in a custom directory, make
sure it is configured in your `tailwind.config.ts` file.

```ts:line-numbers
// tailwind.config.ts
export default {
  content: ["./registry/**/*.{js,ts,jsx,tsx,vue}"],
}
```

</Callout>

### Add your component to the registry

To add your component to the registry, you need to add your component definition to `registry.json`.

```json:line-numbers title="registry.json"  {6-17}
{
  "$schema": "https://shadcn-vue.com/schema/registry.json",
  "name": "acme",
  "homepage": "https://acme.com",
  "items": [
    {
      "name": "hello-world",
      "type": "registry:block",
      "title": "Hello World",
      "description": "A simple hello world component.",
      "files": [
        {
          "path": "registry/new-york/HelloWorld/HelloWorld.vue",
          "type": "registry:component"
        }
      ]
    }
  ]
}
```

You define your registry item by adding a `name`, `type`, `title`, `description` and `files`.

For every file you add, you must specify the `path` and `type` of the file. The `path` is the relative path to the file from the root of your project. The `type` is the type of the file.

You can read more about the registry item schema and file types in the [registry item schema docs](/docs/registry/registry-item-json).

</Steps>

## Build your registry

<Steps>

### Install the shadcn-vue CLI

Note: the `build` command is currently only available in the `shadcn-vue@canary` version of the CLI.

```bash
npm install shadcn-vue@latest
```

### Add a build script

Add a `registry:build` script to your `package.json` file.

```json:line-numbers title="package.json"
{
  "scripts": {
    "registry:build": "shadcn-vue build"
  }
}
```

### Run the build script

Run the build script to generate the registry JSON files.

```bash
npm run registry:build
```

<Callout class="mt-6">

**Note:** By default, the build script will generate the registry JSON files in `public/r` e.g `public/r/hello-world.json`.

You can change the output directory by passing the `--output` option. See the [shadcn build command](/docs/cli#build) for more information.

</Callout>

</Steps>

## Serve your registry

If you're running your registry on Nuxt, you can now serve your registry by running the `nuxt` server. The command might differ for other frameworks.

```bash
npm run dev
```

Your files will now be served at `http://localhost:3000/r/[NAME].json` eg. `http://localhost:3000/r/hello-world.json`.

## Publish your registry

To make your registry available to other developers, you can publish it by deploying your project to a public URL.

## Adding Auth

The `shadcn-vue` CLI does not offer a built-in way to add auth to your registry. We recommend handling authorization on your registry server.

A common simple approach is to use a `token` query parameter to authenticate requests to your registry. e.g. `http://localhost:3000/r/hello-world.json?token=[SECURE_TOKEN_HERE]`.

Use the secure token to authenticate requests and return a 401 Unauthorized response if the token is invalid. Both the `shadcn` CLI and `Open in v0` will handle the 401 response and display a message to the user.

<Callout className="mt-6">
  **Note:** Make sure to encrypt and expire tokens.
</Callout>

## Guidelines

Here are some guidelines to follow when building components for a registry.

- Place your registry item in the `registry/[STYLE]/[NAME]` directory. I'm using `new-york` as an example. It can be anything you want as long as it's nested under the `registry` directory.
- The following properties are required for the block definition: `name`, `description`, `type` and `files`.
- Make sure to list all registry dependencies in `registryDependencies`. A registry dependency is the name of the component in the registry eg. `input`, `button`, `card`, etc or a URL to a registry item eg. `http://localhost:3000/r/editor.json`.
- Make sure to list all dependencies in `dependencies`. A dependency is the name of the package in the registry eg. `zod`, `sonner`, etc. To set a version, you can use the `name@version` format eg. `zod@^3.20.0`.
- **Imports should always use the `@/registry` path.** eg. `import { HelloWorld } from "@/registry/new-york/hello-world/hello-world"`
- Ideally, place your files within a registry item in `components`, `hooks`, `lib` directories.

## Install using the CLI

To install a registry item using the `shadcn-vue` CLI, use the `add` command followed by the URL of the registry item.

```bash
npx shadcn-vue@latest add http://localhost:3000/r/hello-world.json
```

---

---

url: /docs/components/hover-card.md
description: For sighted users to preview content available behind a link.

---

<ComponentPreview name="HoverCardDemo" />

## Installation

```bash
npx shadcn-vue@latest add hover-card
```

## Usage

```vue
<template>
  <HoverCard>
    <HoverCardTrigger>Hover</HoverCardTrigger>
    <HoverCardContent> The Vue Framework – created and maintained by @vuejs. </HoverCardContent>
  </HoverCard>
</template>

<script setup lang="ts">
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
</script>
```

---

---

url: /docs/components/input.md
description: Displays a form input field or a component that looks like an input field.

---

<ComponentPreview name="InputDemo" class="max-w-xs" />

## Installation

<TabPreview name="CLI">
<template #CLI>

```bash
npx shadcn-vue@latest add input
```

</template>

<template #Manual>

<Steps>

### Copy and paste the following code into your project:

<<< @/registry/default/ui/input/Input.vue

</Steps>

</template>
</TabPreview>

## Usage

```vue
<template>
  <Input />
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input'
</script>
```

## Examples

### Default

<ComponentPreview name="InputDemo" class="max-w-xs" />

### File

<ComponentPreview name="InputFile" class="max-w-xs" />

### Disabled

<ComponentPreview name="InputDisabled" class="max-w-xs" />

### With Label

<ComponentPreview name="InputWithLabel" class="max-w-xs" />

### With Button

<ComponentPreview name="InputWithButton" class="max-w-xs" />

### With Icon

<ComponentPreview name="InputWithIcon" class="max-w-xs" />

### Form

<ComponentPreview name="InputForm" />

---

---

url: /docs/installation.md
description: How to install dependencies and structure your app.

---

## Frameworks

<div class="grid gap-4 mt-8 sm:grid-cols-2 sm:gap-6 not-docs">
  <LinkedCard href="/docs/installation/vite">
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      class="w-10 h-10"
      fill="currentColor"
    >
      <title>Vite</title>
      <path d="m8.286 10.578.512-8.657a.306.306 0 0 1 .247-.282L17.377.006a.306.306 0 0 1 .353.385l-1.558 5.403a.306.306 0 0 0 .352.385l2.388-.46a.306.306 0 0 1 .332.438l-6.79 13.55-.123.19a.294.294 0 0 1-.252.14c-.177 0-.35-.152-.305-.369l1.095-5.301a.306.306 0 0 0-.388-.355l-1.433.435a.306.306 0 0 1-.389-.354l.69-3.375a.306.306 0 0 0-.37-.36l-2.32.536a.306.306 0 0 1-.374-.316zm14.976-7.926L17.284 3.74l-.544 1.887 2.077-.4a.8.8 0 0 1 .84.369.8.8 0 0 1 .034.783L12.9 19.93l-.013.025-.015.023-.122.19a.801.801 0 0 1-.672.37.826.826 0 0 1-.634-.302.8.8 0 0 1-.16-.67l1.029-4.981-1.12.34a.81.81 0 0 1-.86-.262.802.802 0 0 1-.165-.67l.63-3.08-2.027.468a.808.808 0 0 1-.768-.233.81.81 0 0 1-.217-.6l.389-6.57-7.44-1.33a.612.612 0 0 0-.64.906L11.58 23.691a.612.612 0 0 0 1.066-.004l11.26-20.135a.612.612 0 0 0-.644-.9z" />
    </svg>
    <p class="mt-2 font-medium">Vite</p>
  </LinkedCard>
  <LinkedCard href="/docs/installation/nuxt">
    <svg xmlns="http://www.w3.org/2000/svg"  class="w-12 h-12" viewBox="0 0 900 900" fill="none">
    <title>Nuxt</title>
    <path d="M504.908 750H839.476C850.103 750.001 860.542 747.229 869.745 741.963C878.948 736.696 886.589 729.121 891.9 719.999C897.211 710.876 900.005 700.529 900 689.997C899.995 679.465 897.193 669.12 891.873 660.002L667.187 274.289C661.876 265.169 654.237 257.595 645.036 252.329C635.835 247.064 625.398 244.291 614.773 244.291C604.149 244.291 593.711 247.064 584.511 252.329C575.31 257.595 567.67 265.169 562.36 274.289L504.908 372.979L392.581 179.993C387.266 170.874 379.623 163.301 370.42 158.036C361.216 152.772 350.777 150 340.151 150C329.525 150 319.086 152.772 309.883 158.036C300.679 163.301 293.036 170.874 287.721 179.993L8.12649 660.002C2.80743 669.12 0.00462935 679.465 5.72978e-06 689.997C-0.00461789 700.529 2.78909 710.876 8.10015 719.999C13.4112 729.121 21.0523 736.696 30.255 741.963C39.4576 747.229 49.8973 750.001 60.524 750H270.538C353.748 750 415.112 713.775 457.336 643.101L559.849 467.145L614.757 372.979L779.547 655.834H559.849L504.908 750ZM267.114 655.737L120.551 655.704L340.249 278.586L449.87 467.145L376.474 593.175C348.433 639.03 316.577 655.737 267.114 655.737Z" fill="currentColor"/>
    </svg>
    <p class="mt-2 font-medium">Nuxt</p>
  </LinkedCard>
  <LinkedCard href="/docs/installation/astro">
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      class="w-10 h-10"
      fill="currentColor"
    >
      <title>Astro</title>
      <path
        d="M16.074 16.86C15.354 17.476 13.917 17.895 12.262 17.895C10.23 17.895 8.527 17.263 8.075 16.412C7.914 16.9 7.877 17.458 7.877 17.814C7.877 17.814 7.771 19.564 8.988 20.782C8.988 20.15 9.501 19.637 10.133 19.637C11.216 19.637 11.215 20.582 11.214 21.349V21.418C11.214 22.582 11.925 23.579 12.937 24C12.7812 23.6794 12.7005 23.3275 12.701 22.971C12.701 21.861 13.353 21.448 14.111 20.968C14.713 20.585 15.383 20.161 15.844 19.308C16.0926 18.8493 16.2225 18.3357 16.222 17.814C16.2221 17.4903 16.1722 17.1685 16.074 16.86ZM15.551 0.6C15.747 0.844 15.847 1.172 16.047 1.829L20.415 16.176C18.7743 15.3246 17.0134 14.7284 15.193 14.408L12.35 4.8C12.3273 4.72337 12.2803 4.65616 12.2162 4.60844C12.152 4.56072 12.0742 4.53505 11.9943 4.53528C11.9143 4.5355 11.8366 4.56161 11.7727 4.60969C11.7089 4.65777 11.6623 4.72524 11.64 4.802L8.83 14.405C7.00149 14.724 5.23264 15.3213 3.585 16.176L7.974 1.827C8.174 1.171 8.274 0.843 8.471 0.6C8.64406 0.385433 8.86922 0.218799 9.125 0.116C9.415 0 9.757 0 10.443 0H13.578C14.264 0 14.608 0 14.898 0.117C15.1529 0.219851 15.3783 0.386105 15.551 0.6Z"
        fill="currentColor"
      />
    </svg>
    <p class="mt-2 font-medium">Astro</p>
  </LinkedCard>
  <LinkedCard href="/docs/installation/laravel">
    <svg
      role="img"
      viewBox="0 0 62 65"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      class="w-10 h-10"
    >
      <path d="M61.8548 14.6253C61.8778 14.7102 61.8895 14.7978 61.8897 14.8858V28.5615C61.8898 28.737 61.8434 28.9095 61.7554 29.0614C61.6675 29.2132 61.5409 29.3392 61.3887 29.4265L49.9104 36.0351V49.1337C49.9104 49.4902 49.7209 49.8192 49.4118 49.9987L25.4519 63.7916C25.3971 63.8227 25.3372 63.8427 25.2774 63.8639C25.255 63.8714 25.2338 63.8851 25.2101 63.8913C25.0426 63.9354 24.8666 63.9354 24.6991 63.8913C24.6716 63.8838 24.6467 63.8689 24.6205 63.8589C24.5657 63.8389 24.5084 63.8215 24.456 63.7916L0.501061 49.9987C0.348882 49.9113 0.222437 49.7853 0.134469 49.6334C0.0465019 49.4816 0.000120578 49.3092 0 49.1337L0 8.10652C0 8.01678 0.0124642 7.92953 0.0348998 7.84477C0.0423783 7.8161 0.0598282 7.78993 0.0697995 7.76126C0.0884958 7.70891 0.105946 7.65531 0.133367 7.6067C0.152063 7.5743 0.179485 7.54812 0.20192 7.51821C0.230588 7.47832 0.256763 7.43719 0.290416 7.40229C0.319084 7.37362 0.356476 7.35243 0.388883 7.32751C0.425029 7.29759 0.457436 7.26518 0.498568 7.2415L12.4779 0.345059C12.6296 0.257786 12.8015 0.211853 12.9765 0.211853C13.1515 0.211853 13.3234 0.257786 13.475 0.345059L25.4531 7.2415H25.4556C25.4955 7.26643 25.5292 7.29759 25.5653 7.32626C25.5977 7.35119 25.6339 7.37362 25.6625 7.40104C25.6974 7.43719 25.7224 7.47832 25.7523 7.51821C25.7735 7.54812 25.8021 7.5743 25.8196 7.6067C25.8483 7.65656 25.8645 7.70891 25.8844 7.76126C25.8944 7.78993 25.9118 7.8161 25.9193 7.84602C25.9423 7.93096 25.954 8.01853 25.9542 8.10652V33.7317L35.9355 27.9844V14.8846C35.9355 14.7973 35.948 14.7088 35.9704 14.6253C35.9792 14.5954 35.9954 14.5692 36.0053 14.5405C36.0253 14.4882 36.0427 14.4346 36.0702 14.386C36.0888 14.3536 36.1163 14.3274 36.1375 14.2975C36.1674 14.2576 36.1923 14.2165 36.2272 14.1816C36.2559 14.1529 36.292 14.1317 36.3244 14.1068C36.3618 14.0769 36.3942 14.0445 36.4341 14.0208L48.4147 7.12434C48.5663 7.03694 48.7383 6.99094 48.9133 6.99094C49.0883 6.99094 49.2602 7.03694 49.4118 7.12434L61.3899 14.0208C61.4323 14.0457 61.4647 14.0769 61.5021 14.1055C61.5333 14.1305 61.5694 14.1529 61.5981 14.1803C61.633 14.2165 61.6579 14.2576 61.6878 14.2975C61.7103 14.3274 61.7377 14.3536 61.7551 14.386C61.7838 14.4346 61.8 14.4882 61.8199 14.5405C61.8312 14.5692 61.8474 14.5954 61.8548 14.6253ZM59.893 27.9844V16.6121L55.7013 19.0252L49.9104 22.3593V33.7317L59.8942 27.9844H59.893ZM47.9149 48.5566V37.1768L42.2187 40.4299L25.953 49.7133V61.2003L47.9149 48.5566ZM1.99677 9.83281V48.5566L23.9562 61.199V49.7145L12.4841 43.2219L12.4804 43.2194L12.4754 43.2169C12.4368 43.1945 12.4044 43.1621 12.3682 43.1347C12.3371 43.1097 12.3009 43.0898 12.2735 43.0624L12.271 43.0586C12.2386 43.0275 12.2162 42.9888 12.1887 42.9539C12.1638 42.9203 12.1339 42.8916 12.114 42.8567L12.1127 42.853C12.0903 42.8156 12.0766 42.7707 12.0604 42.7283C12.0442 42.6909 12.023 42.656 12.013 42.6161C12.0005 42.5688 11.998 42.5177 11.9931 42.4691C11.9881 42.4317 11.9781 42.3943 11.9781 42.3569V15.5801L6.18848 12.2446L1.99677 9.83281ZM12.9777 2.36177L2.99764 8.10652L12.9752 13.8513L22.9541 8.10527L12.9752 2.36177H12.9777ZM18.1678 38.2138L23.9574 34.8809V9.83281L19.7657 12.2459L13.9749 15.5801V40.6281L18.1678 38.2138ZM48.9133 9.14105L38.9344 14.8858L48.9133 20.6305L58.8909 14.8846L48.9133 9.14105ZM47.9149 22.3593L42.124 19.0252L37.9323 16.6121V27.9844L43.7219 31.3174L47.9149 33.7317V22.3593ZM24.9533 47.987L39.59 39.631L46.9065 35.4555L36.9352 29.7145L25.4544 36.3242L14.9907 42.3482L24.9533 47.987Z" />
    </svg>
    <p class="mt-2 font-medium">Laravel</p>
  </LinkedCard>
  <LinkedCard href="/docs/installation/manual">
    <svg class="w-10 h-10" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Akar Icons by Arturo Wibawa - https://github.com/artcoholic/akar-icons/blob/master/LICENSE --><path fill="currentColor" d="M19.114 2H15l-3 4.9L9.429 2H0l12 21L24 2zM3 3.75h2.914L12 14.6l6.086-10.85H21L12 19.5z"/></svg>
    <p class="mt-2 font-medium">Manual</p>
  </LinkedCard>
</div>

## TypeScript

This project and the components are written in TypeScript. We recommend using TypeScript for your project as well.

However we provide a JavaScript version of the components as well. The JavaScript version is available via the [cli](/docs/cli).

To opt-out of TypeScript, you can use the `typescript` flag in your `components.json` file.

```json {9} title="components.json"
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "typescript": false,
  "aliases": {
    "utils": "~/lib/utils",
    "components": "~/components"
  }
}
```

To configure import aliases, you can use the following `jsconfig.json`:

```json {4} title="jsconfig.json"
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## VSCode extension

Install the [shadcn-vue](https://marketplace.visualstudio.com/items?itemName=Selemondev.shadcn-vue) extension by [@selemondev](https://github.com/selemondev) in Visual Studio Code to easily add Shadcn Vue components to your project.

This extension offers a range of features:

- Ability to initialize the Shadcn Vue CLI
- Install components
- Open documentation
- Navigate to a specific component's documentation page directly from your IDE.
- Handy snippets for quick and straightforward component imports and markup.

---

---

url: /docs/introduction.md
description: 'Re-usable components built with Radix Vue, and Tailwind CSS.'

---

<script setup>
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/registry/new-york/ui/accordion'
</script>

An unofficial, community-led [Vue](https://vuejs.org/) port of [shadcn/ui](https://ui.shadcn.com). We are not affiliated with [shadcn](https://twitter.com/shadcn), but we did get his blessing before creating a Vue version of his work. This project was born out of the need for a similar project for the Vue ecosystem.

This is **NOT** a component library. It's a collection of re-usable components that you can copy and paste or use the CLI to add to your apps.

**What do you mean not a component library?**

It means you do not install it as a dependency. It is not available or distributed via npm, with no plans to publish it.

Pick the components you need. Use the CLI to automatically add the components, or copy and paste the code into your project and customize to your needs. The code is yours.

_Use this as a reference to build your own component libraries._

<div class="[&>h2]:!mb-0">

## FAQ

</div>

<div class="[&_h3]:!mt-0">
<Accordion  type="multiple">

<AccordionItem value="faq-1">
<AccordionTrigger>
Why not packaged as a dependency?
</AccordionTrigger>
<AccordionContent>

The idea behind this is to give you ownership and control over the code, allowing you to decide how the components are built and styled.

Start with some sensible defaults, then customize the components to your needs.

One of the drawback of packaging the components in an npm package is that the style is coupled with the implementation. _The design of your components should be separate from their implementation._

</AccordionContent>
</AccordionItem>
<AccordionItem value="faq-2">
<AccordionTrigger>
Which frameworks are supported?
</AccordionTrigger>
<AccordionContent>

This port is built to be used with Vue/Nuxt.

</AccordionContent>
</AccordionItem>
<AccordionItem value="faq-3">
<AccordionTrigger>
Can I use this in my project?
</AccordionTrigger>
<AccordionContent>
Yes. Free to use for personal and commercial projects. No attribution required.

But let us know if you do use it. We'd love to see what you build with it.
</AccordionContent>
</AccordionItem>
</Accordion>

</div>

---

---

url: /docs/components/label.md
description: Renders an accessible label associated with controls.

---

<ComponentPreview name="LabelDemo" />

## Installation

<TabPreview name="CLI">
<template #CLI>

```bash
npx shadcn-vue@latest add label
```

</template>

<template #Manual>

<Steps>

### Install the following dependency:

```bash
npm install reka-ui
```

### Copy and paste the following code into your project:

<<< @/registry/default/ui/label/Label.vue

</Steps>

</template>
</TabPreview>

## Usage

```vue
<template>
  <Label for="email">Your email address</Label>
</template>

<script setup lang="ts">
import { Label } from '@/components/ui/label'
</script>
```

---

---

url: /docs/installation/laravel.md
description: Install and configure Laravel with Inertia

---

<Callout class="bg-blue-50 border-blue-600 dark:border-blue-900 dark:bg-blue-950 mt-0 mb-6 [&_code]:bg-blue-100 dark:[&_code]:bg-blue-900">

**Note:** The following guide is for Tailwind v4. If you are using Tailwind
v3, use `shadcn-vue@1.0.3`.

</Callout>

<Steps>

### Create project

Start by creating a new Laravel project with Inertia and Vue using the laravel installer `laravel new my-app`:

```bash
laravel new my-app --vue
```

### Add Components

You can now start adding components to your project.

```bash
npx shadcn-vue@latest add switch
```

The command above will add the `Switch` component to `resources/js/components/ui/switch`. You can then import it like this:

```vue {2,7}
<template>
  <div>
    <Switch />
  </div>
</template>

<script setup lang="ts">
import { Switch } from '@/Components/ui/switch'
</script>
```

</Steps>

---

---

url: /docs/charts/line.md
description: >-
A line chart visually displays data points connected by straight lines,
illustrating trends or relationships over a continuous axis.

---

<ComponentPreview name="LineChartDemo"  />

## Installation

<Callout>
  Only works with Vue >3.3
</Callout>

<Steps>

### Run the following command

```bash
npx shadcn-vue@latest add chart-line
```

### Setup

Follow the [guide](/docs/charts.html#installation) to complete the setup.

</Steps>

## API

<!-- @include: @/content/meta/LineChart.md -->

## Example

### Sparkline

We can turn the chart into sparkline chart by hiding axis, gridline and legends.

<ComponentPreview name="LineChartSparkline"  />

### Custom Tooltip

If you want to render custom tooltip, you can easily pass in a custom component. Refer to prop definition [here](/docs/charts.html#custom-tooltip).

<ComponentPreview name="LineChartCustomTooltip"  />

---

---

url: /docs/installation/manual.md
description: Add dependencies to your project manually.

---

<Steps>

### Add Tailwind CSS

Components are styled using Tailwind CSS. You need to install Tailwind CSS in your project.

[Follow the Tailwind CSS installation instructions to get started.](https://tailwindcss.com/docs/installation)

### Add dependencies

Add the following dependencies to your project:

```bash
npm install class-variance-authority clsx tailwind-merge lucide-vue-next tw-animate-css
```

### Configure path aliases

Configure the path aliases in your `tsconfig.json` file.

```json:line-numbers {3-6} title="tsconfig.json"
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

The `@` alias is a preference. You can use other aliases if you want.

### Configure styles

Add the following to your styles/globals.css file. You can learn more about using CSS variables for theming in the [theming section](/docs/theming).

```css:line-numbers title="src/styles/globals.css"
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;

  @keyframes accordion-down {
    from {
      height: 0;
    }
    to {
      height: var(--reka-accordion-content-height);
    }
  }

  @keyframes accordion-up {
    from {
      height: var(--reka-accordion-content-height);
    }
    to {
      height: 0;
    }
  }
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Add a cn helper

```ts:line-numbers title="lib/utils.ts"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Create a `components.json` file

Create a `components.json` file in the root of your project.

```json:line-numbers title="components.json"
{
  "$schema": "https://shadcn-vue.com/schema.json",
  "style": "new-york",
  "typescript": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "composables": "@/composables",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
  },
  "iconLibrary": "lucide"
}
```

### That's it

You can now start adding components to your project.

</Steps>

---

---

url: /docs/components/menubar.md
description: >-
A visually persistent menu common in desktop applications that provides quick
access to a consistent set of commands.

---

<ComponentPreview name="MenubarDemo" />

## Installation

```bash
npx shadcn-vue@latest add menubar
```

## Usage

```vue
<template>
  <Menubar>
    <MenubarMenu>
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent>
        <MenubarItem> New Tab <MenubarShortcut>⌘T</MenubarShortcut> </MenubarItem>
        <MenubarItem>New Window</MenubarItem>
        <MenubarSeparator />
        <MenubarItem>Share</MenubarItem>
        <MenubarSeparator />
        <MenubarItem>Print</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
</template>

<script setup lang="ts">
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from '@/components/ui/menubar'
</script>
```

---

---

url: /docs/components/navigation-menu.md
description: A collection of links for navigating websites.

---

<ComponentPreview name="NavigationMenuDemo" />

## Installation

```bash
npx shadcn-vue@latest add navigation-menu
```

## Usage

```vue
<template>
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Item One</NavigationMenuTrigger>
        <NavigationMenuContent>
          <NavigationMenuLink>Link</NavigationMenuLink>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
</template>

<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport
} from '@/components/ui/navigation-menu'
</script>
```

## Examples

### Link Component

When using the Nuxt `<NuxtLink />` component, you can use `navigationMenuTriggerStyle()` to apply the correct styles to the trigger.

```ts
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu'
```

```vue
<template>
  <NavigationMenuItem>
    <NuxtLink v-slot="{ isActive, href, navigate }" to="/docs" custom>
      <NavigationMenuLink :active="isActive" :href :class="navigationMenuTriggerStyle()" @click="navigate"> Documentation </NavigationMenuLink>
    </NuxtLink>
  </NavigationMenuItem>
</template>
```

---

---

url: /docs/components/number-field.md
description: >-
A number field allows a user to enter a number and increment or decrement the
value using stepper buttons.

---

<ComponentPreview name="NumberFieldDemo" class="max-w-[180px]" />

## Installation

<TabPreview name="CLI">
<template #CLI>

```bash
npx shadcn-vue@latest add number-field
```

</template>
</TabPreview>

## Usage

```vue
<template>
  <NumberField>
    <Label>Age</Label>
    <NumberFieldContent>
      <NumberFieldDecrement />
      <NumberFieldInput />
      <NumberFieldIncrement />
    </NumberFieldContent>
  </NumberField>
</template>

<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput } from '@/components/ui/number-field'
</script>
```

## Examples

### Default

<ComponentPreview name="NumberFieldDemo" class="max-w-[180px]" />

### Disabled

<ComponentPreview name="NumberFieldDisabled" class="max-w-[180px]" />

### Decimal

<ComponentPreview name="NumberFieldDecimal" class="max-w-[180px]" />

### Percentage

<ComponentPreview name="NumberFieldPercentage" class="max-w-[180px]" />

### Currency

<ComponentPreview name="NumberFieldCurrency" class="max-w-[220px]" />

### Form

<ComponentPreview name="NumberFieldForm" class="max-w-xs" />

---

---

url: /docs/dark-mode/nuxt.md
description: Adding dark mode to your nuxt app.

---

## Dark mode

<Steps>

### Install Dependencies

```bash
npm install -D @nuxtjs/color-mode
```

Then, add `@nuxtjs/color-mode` to the modules section of your `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode'],
  colorMode: {
    classSuffix: ''
  }
})
```

### Add a mode toggle

Place a mode toggle on your site to toggle between light and dark mode.

We're using [`useColorMode`](https://color-mode.nuxtjs.org/#usage) from [`Nuxt Color Mode`](https://color-mode.nuxtjs.org/).

Optional, to include icons for theme button.

```bash
npm install -D @iconify/vue @iconify-json/radix-icons
```

```vue
<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        <Icon icon="radix-icons:moon" class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Icon icon="radix-icons:sun" class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="colorMode.preference = 'light'"> Light </DropdownMenuItem>
      <DropdownMenuItem @click="colorMode.preference = 'dark'"> Dark </DropdownMenuItem>
      <DropdownMenuItem @click="colorMode.preference = 'system'"> System </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const colorMode = useColorMode()
</script>
```

</Steps>

---

---

url: /docs/installation/nuxt.md
description: Install and configure Nuxt.

---

<Callout class="bg-blue-50 border-blue-600 dark:border-blue-900 dark:bg-blue-950 mt-0 mb-6 [&_code]:bg-blue-100 dark:[&_code]:bg-blue-900">

**Note:** The following guide is for Tailwind v4. If you are using Tailwind
v3, use `shadcn-vue@1.0.3`.

</Callout>

<Steps>

### Create project

Start by creating a new Nuxt project using `create-nuxt-app`:

```bash
npm create nuxt@latest
```

<Callout>

If you encounter the error `ERROR: Cannot read properties of undefined (reading 'sys') (x4)`, please proceed to install TypeScript as a dependency, as advised in this [issue](https://github.com/nuxt/nuxt/issues/20936)

```bash
npm install -D typescript
```

</Callout>

### Add Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/vite
```

Replace everything in `assets/css/tailwind.css` with the following:

```css title="assets/css/tailwind.css"
@import 'tailwindcss';
```

Update `nuxt.config.ts` with the following:

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  // ...
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()]
  }
})
```

### Add `Nuxt` module

Due to Nuxt auto-import feature, if you skip this step you will observe many warning in console.

<TabsMarkdown>
  <TabMarkdown title="shadcn-nuxt">

Install the package below.

```bash
npx nuxi@latest module add shadcn-nuxt
```

  </TabMarkdown>

  <TabMarkdown title="manual">

Add the following code to `modules/shadcn.ts`.

```bash
import {
  defineNuxtModule,
  addComponent,
  addComponentsDir,
  tryResolveModule,
} from 'nuxt/kit';

export interface ShadcnVueOptions {
  /**
   * Prefix for all the imported component
   */
  prefix: string;

  /**
   * Directory that the component lives in.
   * @default "~/components/ui"
   */
  componentDir: string;
}

export default defineNuxtModule<ShadcnVueOptions>({
  defaults: {
    prefix: 'Ui',
    componentDir: '~/components/ui',
  },
  meta: {
    name: 'ShadcnVue',
    configKey: 'shadcn',
    version: '0.0.1',
    compatibility: {
      nuxt: '>=3.9.0',
      bridge: false,
    },
  },
  async setup({ componentDir, prefix }) {
    const veeValidate = await tryResolveModule('vee-validate');
    const vaulVue = await tryResolveModule('vaul-vue');

    addComponentsDir(
      {
        path: componentDir,
        extensions: ['.vue'],
        prefix,
        pathPrefix: false,
      },
      {
        prepend: true,
      }
    );

    if (veeValidate !== undefined) {
      addComponent({
        filePath: 'vee-validate',
        export: 'Form',
        name: `${prefix}Form`,
        priority: 999,
      });

      addComponent({
        filePath: 'vee-validate',
        export: 'Field',
        name: `${prefix}FormField`,
        priority: 999,
      });
    }

    if(vaulVue !== undefined) {
      ['DrawerPortal', 'DrawerTrigger', 'DrawerClose'].forEach((item) => {
        addComponent({
          filePath: 'vaul-vue',
          export: item,
          name: prefix + item,
          priority: 999,
        });
      })
    }

    addComponent({
      filePath: 'reka-ui',
      export: 'PaginationRoot',
      name: `${prefix}Pagination`,
      priority: 999,
    });

    addComponent({
      filePath: 'reka-ui',
      export: 'PaginationList',
      name: `${prefix}PaginationList`,
      priority: 999,
    });

    addComponent({
      filePath: 'reka-ui',
      export: 'PaginationListItem',
      name: `${prefix}PaginationListItem`,
      priority: 999,
    });
  },
});

declare module '@nuxt/schema' {
  interface NuxtConfig {
    shadcn?: ShadcnVueOptions;
  }
  interface NuxtOptions {
    shadcn?: ShadcnVueOptions;
  }
}
```

  </TabMarkdown>
</TabsMarkdown>

### Configure `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  // ...
  modules: ['shadcn-nuxt'],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  }
})
```

### Run Nuxt Prepare

If you are initiating a new project, you need to run the command so that Nuxt generates the necessary `.nuxt` folder:

```bash
npx nuxi prepare
```

### Run the CLI

Run the `shadcn-vue` init command to setup your project:

```bash
npx shadcn-vue@latest init
```

You will be asked a few questions to configure `components.json`.

```txt
Which color would you like to use as base color? › Neutral
```

### Add Components

You can now start adding components to your project.

```bash
npx shadcn-vue@latest add button
```

The command above will add the `Button` component to your project. Nuxt autoImport will handle importing the components, you can just use it as such:

```vue {3}
<template>
  <div>
    <Button>Click me</Button>
  </div>
</template>
```

</Steps>

---

---

url: /docs/components/pagination.md
description: Displays data in paged format and provides navigation between pages.

---

<ComponentPreview name="PaginationDemo" />

## Installation

```bash
npx shadcn-vue@latest add pagination
```

## Usage

```vue
<template>
  <Pagination v-slot="{ page }" :items-per-page="10" :total="100" :sibling-count="1" show-edges :default-page="2">
    <PaginationList v-slot="{ items }" class="flex items-center gap-1">
      <PaginationFirst />
      <PaginationPrev />

      <template v-for="(item, index) in items">
        <PaginationListItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
          <Button class="h-10 w-10 p-0" :variant="item.value === page ? 'default' : 'outline'">
            {{ item.value }}
          </Button>
        </PaginationListItem>
        <PaginationEllipsis v-else :key="item.type" :index="index" />
      </template>

      <PaginationNext />
      <PaginationLast />
    </PaginationList>
  </Pagination>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev
} from '@/components/ui/pagination'
</script>
```

---

---

url: /docs/components/pin-input.md
description: Allows users to input a sequence of one-character alphanumeric inputs.

---

<ComponentPreview name="PinInputDemo" />

## Installation

```bash
npx shadcn-vue@latest add pin-input
```

## Usage

### Controlled

<ComponentPreview name="PinInputControlled" />

### Disabled

<ComponentPreview name="PinInputDisabled" />

### Separator

<ComponentPreview name="PinInputSeparatorDemo" />

### Form

<ComponentPreview name="PinInputFormDemo" />

---

---

url: /docs/components/popover.md
description: 'Displays rich content in a portal, triggered by a button.'

---

<ComponentPreview name="PopoverDemo" />

## Installation

```bash
npx shadcn-vue@latest add popover
```

## Usage

```vue
<template>
  <Popover>
    <PopoverTrigger> Open popover </PopoverTrigger>
    <PopoverContent> Some popover content </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
</script>
```

---

---

url: /docs/components/progress.md
description: >-
Displays an indicator showing the completion progress of a task, typically
displayed as a progress bar.

---

<ComponentPreview name="ProgressDemo" />

## Installation

<TabPreview name="CLI">
<template #CLI>

```bash
npx shadcn-vue@latest add progress
```

</template>

<template #Manual>

<Steps>

### Install the following dependency:

```bash
npm install reka-ui
```

### Copy and paste the following code into your project:

<<< @/registry/default/ui/progress/Progress.vue

</Steps>

</template>
</TabPreview>

## Usage

```vue
<template>
  <Progress :model-value="33" />
</template>

<script setup lang="ts">
import { Progress } from '@/components/ui/progress'
</script>
```

---

---

url: /docs/components/radio-group.md
description: >-
A set of checkable buttons—known as radio buttons—where no more than one of
the buttons can be checked at a time.

---

<ComponentPreview name="RadioGroupDemo" />

## Installation

```bash
npx shadcn-vue@latest add radio-group
```

## Usage

```vue
<template>
  <RadioGroup default-value="option-one">
    <div class="flex items-center space-x-2">
      <RadioGroupItem id="option-one" value="option-one" />
      <Label for="option-one">Option One</Label>
    </div>
    <div class="flex items-center space-x-2">
      <RadioGroupItem id="option-two" value="option-two" />
      <Label for="option-two">Option Two</Label>
    </div>
  </RadioGroup>
</template>

<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
</script>
```

## Examples

### Form

Please first read `vee-validate` section for [Checkbox and Radio Inputs](https://vee-validate.logaretm.com/v4/examples/checkboxes-and-radio/)

<ComponentPreview name="RadioGroupForm" />

---

---

url: /docs/components/range-calendar.md
description: A calendar component that allows users to select a range of dates.

---

<ComponentPreview name="RangeCalendarDemo" />

## About

The `<RangeCalendar />` component is built on top of the [RadixVue Range Calendar](https://www.reka-ui.com/docs/components/date-range-picker.html) component, which uses the [@internationalized/date](https://react-spectrum.adobe.com/internationalized/date/index.html) package to handle dates.

## Installation

```bash
npx shadcn-vue@latest add range-calendar
```

---

---

url: /docs/registry/index.md
description: Run your own component registry.

---

<Callout class="mt-0" >

**Note:** This feature is currently experimental. Help us improve it by
testing it out and sending feedback. If you have any questions, please [reach
out to us](https://github.com/unovue/shadcn-vue/discussions).

</Callout>

You can use the `shadcn-vue` CLI to run your own component registry. Running your own registry allows you to distribute your custom components, hooks, pages, and other files to any Vue project.

Registry items are automatically compatible with the `shadcn-vue` CLI.

## Requirements

You are free to design and host your custom registry as you see fit. The only requirement is that your registry items must be valid JSON files that conform to the [registry-item schema specification](/docs/registry/registry-item-json).

<!-- If you'd like to see an example of a registry, we have a [template project](https://github.com/shadcn-ui/registry-template) for you to use as a starting point. -->

---

---

url: /docs/registry/registry-item-json.md
description: Specification for registry items.

---

The `registry-item.json` schema is used to define your custom registry items.

```json:line-numbers title="registry-item.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json",
  "name": "hello-world",
  "type": "registry:block",
  "title": "Hello World",
  "description": "A simple hello world component.",
  "files": [
    {
      "path": "registry/new-york/HelloWorld/HelloWorld.vue",
      "type": "registry:component"
    },
    {
      "path": "registry/new-york/HelloWorld/useHelloWorld.ts",
      "type": "registry:hook"
    }
  ]
}
```

## Definitions

You can see the JSON Schema for `registry-item.json` [here](https://shadcn-vue.com/schema/registry-item.json).

### $schema

The `$schema` property is used to specify the schema for the `registry-item.json` file.

```json:line-numbers title="registry-item.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry-item.json"
}
```

### name

The `name` property is used to specify the name of your registry item.

```json:line-numbers title="registry-item.json"
{
  "name": "hello-world"
}
```

### title

A human-readable title for your registry item. Keep it short and descriptive.

```json:line-numbers title="registry-item.json"
{
  "title": "Hello World"
}
```

### description

A description of your registry item. This can be longer and more detailed than the `title`.

```json:line-numbers title="registry-item.json"
{
  "description": "A simple hello world component."
}
```

### type

The `type` property is used to specify the type of your registry item.

```json:line-numbers title="registry-item.json"
{
  "type": "registry:block"
}
```

The following types are supported:

| Type                 | Description                                      |
| -------------------- | ------------------------------------------------ |
| `registry:block`     | Use for complex components with multiple files.  |
| `registry:component` | Use for simple components.                       |
| `registry:lib`       | Use for lib and utils.                           |
| `registry:hook`      | Use for composables (hooks).                     |
| `registry:ui`        | Use for UI components and single-file primitives |
| `registry:page`      | Use for page or file-based routes.               |
| `registry:file`      | Use for miscellaneous files.                     |

### author

The `author` property is used to specify the author of the registry item.

It can be unique to the registry item or the same as the author of the registry.

```json:line-numbers title="registry-item.json"
{
  "author": "John Doe <john@doe.com>"
}
```

### dependencies

The `dependencies` property is used to specify the dependencies of your registry item. This is for `npm` packages.

Use `@version` to specify the version of your registry item.

```json:line-numbers title="registry-item.json"
{
  "dependencies": [
    "reka-ui",
    "zod",
    "lucide-vue-next",
    "name@1.0.2"
  ]
}
```

### registryDependencies

Used for registry dependencies. Can be names or URLs.

- For `shadcn/ui` registry items such as `button`, `input`, `select`, etc use the name eg. `['button', 'input', 'select']`.
- For custom registry items use the URL of the registry item eg. `['https://example.com/r/hello-world.json']`.

```json:line-numbers title="registry-item.json"
{
  "registryDependencies": [
    "button",
    "input",
    "select",
    "https://example.com/r/editor.json"
  ]
}
```

Note: The CLI will automatically resolve remote registry dependencies.

### files

The `files` property is used to specify the files of your registry item. Each file has a `path`, `type` and `target` (optional) property.

**The `target` property is required for `registry:page` and `registry:file` types.**

```json:line-numbers title="registry-item.json"
{
  "files": [
    {
      "path": "registry/new-york/HelloWorld/page.vue",
      "type": "registry:page",
      "target": "pages/hello/index.vue"
    },
    {
      "path": "registry/new-york/HelloWorld/HelloWorld.vue",
      "type": "registry:component"
    },
    {
      "path": "registry/new-york/HelloWorld/useHelloWorld.ts",
      "type": "registry:hook"
    },
    {
      "path": "registry/new-york/HelloWorld/.env",
      "type": "registry:file",
      "target": "~/.env"
    }
  ]
}
```

#### path

The `path` property is used to specify the path to the file in your registry. This path is used by the build script to parse, transform and build the registry JSON payload.

#### type

The `type` property is used to specify the type of the file. See the [type](#type) section for more information.

#### target

The `target` property is used to indicate where the file should be placed in a project. This is optional and only required for `registry:page` and `registry:file` types.

By default, the `shadcn-vue` cli will read a project's `components.json` file to determine the target path. For some files, such as routes or config you can specify the target path manually.

Use `~` to refer to the root of the project e.g `~/foo.config.js`.

### tailwind

**DEPRECATED:** Use `cssVars.theme` instead for Tailwind v4 projects.

The `tailwind` property is used for tailwind configuration such as `theme`, `plugins` and `content`.

You can use the `tailwind.config` property to add colors, animations and plugins to your registry item.

```json:line-numbers title="registry-item.json"
{
  "tailwind": {
    "config": {
      "theme": {
        "extend": {
          "colors": {
            "brand": "hsl(var(--brand))"
          },
          "keyframes": {
            "wiggle": {
              "0%, 100%": { "transform": "rotate(-3deg)" },
              "50%": { "transform": "rotate(3deg)" }
            }
          },
          "animation": {
            "wiggle": "wiggle 1s ease-in-out infinite"
          }
        }
      }
    }
  }
}
```

### cssVars

Use to define CSS variables for your registry item.

```json:line-numbers title="registry-item.json"
{
  "cssVars": {
    "light": {
      "brand": "20 14.3% 4.1%",
      "radius": "0.5rem"
    },
    "dark": {
      "brand": "20 14.3% 4.1%"
    }
  }
}
```

### css

Use `css` to add new rules to the project's CSS file eg. `@layer base`, `@layer components`, `@utility`, `@keyframes`, etc.

```json:line-numbers title="registry-item.json"
{
  "css": {
    "@layer base": {
      "body": {
        "font-size": "var(--text-base)",
        "line-height": "1.5"
      }
    },
    "@layer components": {
      "button": {
        "background-color": "var(--color-primary)",
        "color": "var(--color-white)"
      }
    },
    "@utility text-magic": {
      "font-size": "var(--text-base)",
      "line-height": "1.5"
    },
    "@keyframes wiggle": {
      "0%, 100%": {
        "transform": "rotate(-3deg)"
      },
      "50%": {
        "transform": "rotate(3deg)"
      }
    }
  }
}
```

### docs

Use `docs` to show custom documentation or message when installing your registry item via the CLI.

```json:line-numbers title="registry-item.json"
{
  "docs": "Remember to add the FOO_BAR environment variable to your .env file."
}
```

### categories

Use `categories` to organize your registry item.

```json:line-numbers title="registry-item.json"
{
  "categories": ["sidebar", "dashboard"]
}
```

### meta

Use `meta` to add additional metadata to your registry item. You can add any key/value pair that you want to be available to the registry item.

```json:line-numbers title="registry-item.json"
{
  "meta": { "foo": "bar" }
}
```

---

---

url: /docs/registry/registry-json.md
description: Schema for running your own component registry.

---

The `registry.json` schema is used to define your custom component registry.

```json:line-numbers title="registry.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry.json",
  "name": "shadcn",
  "homepage": "https://shadcn-vue.com",
  "items": [
    {
      "name": "hello-world",
      "type": "registry:block",
      "title": "Hello World",
      "description": "A simple hello world component.",
      "files": [
        {
          "path": "registry/new-york/HelloWorld/HelloWorld.vue",
          "type": "registry:component"
        }
      ]
    }
  ]
}
```

## Definitions

You can see the JSON Schema for `registry.json` [here](https://shadcn-vue.com/schema/registry.json).

### $schema

The `$schema` property is used to specify the schema for the `registry.json` file.

```json:line-numbers title="registry.json"
{
  "$schema": "https://shadcn-vue.com/schema/registry.json"
}
```

### name

The `name` property is used to specify the name of your registry. This is used for data attributes and other metadata.

```json:line-numbers title="registry.json"
{
  "name": "acme"
}
```

### homepage

The homepage of your registry. This is used for data attributes and other metadata.

```json:line-numbers title="registry.json"
{
  "homepage": "https://acme.com"
}
```

### items

The `items` in your registry. Each item must implement the [registry-item schema specification](https://shadcn-vue.com/schema/registry-item.json).

```json:line-numbers title="registry.json"
{
  "items": [
    {
      "name": "hello-world",
      "type": "registry:block",
      "title": "Hello World",
      "description": "A simple hello world component.",
      "files": [
        {
          "path": "registry/new-york/HelloWorld/HelloWorld.vue",
          "type": "registry:component"
        }
      ]
    }
  ]
}
```

See the [registry-item schema documentation](/docs/registry/registry-item-json) for more information.

---

---

url: /docs/components/resizable.md
description: Accessible resizable panel groups and layouts with keyboard support.

---

<ComponentPreview name="ResizableDemo" />

## Installation

<TabPreview name="CLI">
<template #CLI>

```bash
npx shadcn-vue@latest add resizable
```

</template>

<template #Manual>

<Steps>

### Install the following dependency:

```bash
npm install reka-ui
```

### Copy and paste the following code into your project:

`index.ts`

<<< @/registry/default/ui/resizable/index.ts

`ResizablePanelGroup.vue`

<<< @/registry/default/ui/resizable/ResizablePanelGroup.vue

`ResizableHandle.vue`

<<< @/registry/default/ui/resizable/ResizableHandle.vue

</Steps>

</template>
</TabPreview>

## Usage

```vue
<template>
  <ResizablePanelGroup direction="horizontal">
    <ResizablePanel>One</ResizablePanel>
    <ResizableHandle />
    <ResizablePanel>Two</ResizablePanel>
  </ResizablePanelGroup>
</template>

<script setup lang="ts">
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
</script>
```

## Examples

### Vertical

Use the direction prop to set the direction of the resizable panels.

<ComponentPreview name="ResizableVerticalDemo" />

```vue:line-numbers {10}
<script setup lang="ts">
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
</script>

<template>
  <ResizablePanelGroup direction="vertical">
    <ResizablePanel>One</ResizablePanel>
    <ResizableHandle />
    <ResizablePanel>Two</ResizablePanel>
  </ResizablePanelGroup>
</template>
```

### Handle

You can set or hide the handle by using the withHandle prop on the ResizableHandle component.

<ComponentPreview name="ResizableHandleDemo" />

```vue:line-numbers {12}
<script setup lang="ts">
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
</script>

<template>
  <ResizablePanelGroup direction="horizontal">
    <ResizablePanel>One</ResizablePanel>
    <ResizableHandle with-handle />
    <ResizablePanel>Two</ResizablePanel>
  </ResizablePanelGroup>
</template>
```

---

---

url: /docs/components/scroll-area.md
description: 'Augments native scroll functionality for custom, cross-browser styling.'

---

<ComponentPreview name="ScrollAreaDemo" />

## Installation

```bash
npx shadcn-vue@latest add scroll-area
```

## Usage

```vue
<template>
  <ScrollArea class="h-[200px] w-[350px] rounded-md border p-4">
    Jokester began sneaking into the castle in the middle of the night and leaving jokes all over the place: under the king's pillow, in his soup,
    even in the royal toilet. The king was furious, but he couldn't seem to stop Jokester. And then, one day, the people of the kingdom discovered
    that the jokes left by Jokester were so funny that they couldn't help but laugh. And once they started laughing, they couldn't stop.
  </ScrollArea>
</template>

<script setup lang="ts">
import { ScrollArea } from '@/components/ui/scroll-area'
</script>
```

## Examples

### Horizontal Scrolling

<ComponentPreview name="ScrollAreaHorizontalDemo" />

---

---

url: /docs/components/select.md
description: Displays a list of options for the user to pick from—triggered by a button.

---

<ComponentPreview name="SelectDemo" />

## Installation

```bash
npx shadcn-vue@latest add select
```

## Usage

```vue
<template>
  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Select a fruit" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Fruits</SelectLabel>
        <SelectItem value="apple"> Apple </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
</script>
```

## Examples

### Scrollable

<ComponentPreview name="SelectScrollable" />

### Form

<ComponentPreview name="SelectForm" />

---

---

url: /docs/components/separator.md
description: Visually or semantically separates content.

---

<ComponentPreview name="SeparatorDemo" />

## Installation

<TabPreview name="CLI">
<template #CLI>

```bash
npx shadcn-vue@latest add separator
```

</template>

<template #Manual>

<Steps>

### Install the following dependency

```bash
npm install reka-ui
```

### Copy and paste the following code into your project

<<< @/registry/default/ui/separator/Separator.vue

</Steps>

</template>
</TabPreview>

## Usage

```vue
<template>
  <Separator label="Or" />
</template>

<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
</script>
```

---

---

url: /docs/components/sheet.md
description: >-
Extends the Dialog component to display content that complements the main
content of the screen.

---

<ComponentPreview name="SheetDemo" />

## Installation

```bash
npx shadcn-vue@latest add sheet
```

## Usage

```vue
<template>
  <Sheet>
    <SheetTrigger>Open</SheetTrigger>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Are you absolutely sure?</SheetTitle>
        <SheetDescription>
          This action cannot be undone. This will permanently delete your account and remove your data from our servers.
        </SheetDescription>
      </SheetHeader>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
</script>
```

## Examples

### Side

Use the `side` property to `<SheetContent />` to indicate the edge of the screen where the component will appear. The values can be `top`, `right`, `bottom` or `left`.

<ComponentPreview name="SheetSideDemo" />

### Size

You can adjust the size of the sheet using CSS classes:

```vue:line-numbers {4}
<template>
  <Sheet>
    <SheetTrigger>Open</SheetTrigger>
    <SheetContent class="w-[400px] sm:w-[540px]">
      <SheetHeader>
        <SheetTitle>Are you absolutely sure?</SheetTitle>
        <SheetDescription>
          This action cannot be undone. This will permanently delete your account
          and remove your data from our servers.
        </SheetDescription>
      </SheetHeader>
    </SheetContent>
  </Sheet>
</template>
```

---

---

url: /docs/components/sidebar.md
description: 'A composable, themeable and customizable sidebar component.'

---

<figure class="flex flex-col gap-4">
  <BlockPreview url="/block-renderer?name=Sidebar07&styles=new-york" ></BlockPreview>
  <figcaption class="text-center text-sm text-gray-500">
    A sidebar that collapses to icons.
  </figcaption>
</figure>

Sidebars are one of the most complex components to build. They are central
to any application and often contain a lot of moving parts.

I don't like building sidebars. So I built 30+ of them. All kinds of
configurations. Then I extracted the core components into `Sidebar*.vue`.

We now have a solid foundation to build on top of. Composable. Themeable.
Customizable.

[Browse the Blocks Library](/blocks).

## Installation

<Steps>

### install this component

```bash
npx shadcn-vue@latest add sidebar
```

### Add the following colors to your CSS file

The command above should install the colors for you. If not, copy and paste the following in your CSS file.

```css
@layer base {
  :root {
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}
```

</Steps>

## Structure

A `Sidebar` component is composed of the following parts:

- `SidebarProvider` - Handles collapsible state.
- `Sidebar` - The sidebar container.
- `SidebarHeader` and SidebarFooter - Sticky at the top and bottom of the sidebar
- `SidebarContent` - Scrollable content.
- `SidebarGroup` - Section within the SidebarContent.
- `SidebarTrigger` - Trigger for the Sidebar

<img
  src="/images/sidebar-structure.png"
  width="716"
  height="420"
  alt="Sidebar Structure"
  class="border dark:hidden rounded-lg overflow-hidden mt-6 w-full"
/>
<img
  src="/images/sidebar-structure-dark.png"
  width="716"
  height="420"
  alt="Sidebar Structure"
  class="border hidden dark:block rounded-lg overflow-hidden mt-6 w-full"
/>

## Usage

```vue:line-numbers title="App.vue"
<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <main>
      <SidebarTrigger />
      <RouterView />
    </main>
  </SidebarProvider>
</template>
```

```vue:line-numbers title="@/components/AppSidebar.vue"
<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from '@/components/ui/sidebar'
</script>

<template>
  <Sidebar>
    <SidebarHeader />
    <SidebarContent>
      <SidebarGroup />
      <SidebarGroup />
    </SidebarContent>
    <SidebarFooter />
  </Sidebar>
</template>
```

## Your First Sidebar

Let's start with the most basic sidebar A collapsible sidebar with a menu.

<Steps>

### Add a `SidebarProvider` and `SidebarTrigger` at the root of your application.

```vue:line-numbers title="src/pages/index.vue"
<script setup lang="ts">
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar.vue";
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <main>
      <SidebarTrigger />
      <slot />
    </main>
  </SidebarProvider>
</template>
```

### Create a new sidebar component at `@/components/AppSidebar.vue`.

```vue:line-numbers title="@/components/AppSidebar.vue"
<script setup lang="ts">
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
</script>

<template>
  <Sidebar>
    <SidebarContent />
  </Sidebar>
</template>
```

### Now, let's add a `SidebarMenu` to the sidebar

We'll use the `SidebarMenu` component in a `SidebarGroup`.

```vue:line-numbers title="@/components/AppSidebar.vue"
<script setup lang="ts">
import { Calendar, Home, Inbox, Search, Settings } from "lucide-vue-next"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];
</script>

<template>
  <Sidebar>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
              <SidebarMenuItem v-for="item in items" :key="item.title">
                <SidebarMenuButton asChild>
                    <a :href="item.url">
                      <component :is="item.icon" />
                      <span>{{item.title}}</span>
                    </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>
```

### You've created your first sidebar

<figure class="flex flex-col gap-4">
  <BlockPreview url="/block-renderer?name=DemoSidebar&styles=new-york"></BlockPreview>
  <figcaption class="text-center text-sm text-gray-500">
    Your first sidebar
  </figcaption>
</figure>

</Steps>

## Components

The components in the `Sidebar*.vue` files are built to be composable i.e you build your sidebar by putting the provided components together. They also compose well with other shadcn-vue components such as `DropdownMenu`, `Collapsible`, `Dialog`, etc.

**If you need to change the code in the `Sidebar*.vue` files, you are encourage to do so. The code is yours. Use the provided components as a starting point to build your own**

In the next sections, we'll go over each component and how to use them.

## SidebarProvider

The `SidebarProvider` component is used to provide the sidebar context to the `Sidebar` component. You should always wrap your application in a `SidebarProvider` component.

### Props

| Name           | Type                      | Description                                  |
| -------------- | ------------------------- | -------------------------------------------- |
| `defaultOpen`  | `boolean`                 | Default open state of the sidebar.           |
| `open`         | `boolean`                 | Open state of the sidebar (controlled).      |
| `onOpenChange` | `(open: boolean) => void` | Sets open state of the sidebar (controlled). |

### Width

If you have a single sidebar in your application, you can use the `SIDEBAR_WIDTH` and `SIDEBAR_WIDTH_MOBILE` constants in `@/components/ui/sidebar/utils.ts` to set the width of the sidebar

```ts:line-numbers title="@/components/ui/sidebar/utils.ts"
export const SIDEBAR_WIDTH = "16rem";
export const SIDEBAR_WIDTH_MOBILE = "18rem";
```

For multiple sidebars in your application, you can use the `style` prop to set the width of the sidebar

To set the width of the sidebar, you can use the `--sidebar-width` and `--sidebar-width-mobile` CSS variables in the `style` prop.

```vue:line-numbers
<template>
  <SidebarProvider
    style="--sidebar-width: 20rem; --sidebar-width-mobile: 20rem;"
  >
    <Sidebar />
  </SidebarProvider>
</template>
```

This will not only handle the width of the sidebar but also the layout spacing.

### Keyboard Shortcut

The `SIDEBAR_KEYBOARD_SHORTCUT` variable in `@/components/ui/sidebar/utils.ts` is used to set the keyboard shortcut used to open and close the sidebar

To trigger the sidebar, you use the `cmd+b` keyboard shortcut on Mac and `ctrl+b` on Windows.

You can change the keyboard shortcut by changing the value of the `SIDEBAR_KEYBOARD_SHORTCUT` variable.

```ts:line-numbers title="@/components/ui/sidebar/utils.ts"
export const SIDEBAR_KEYBOARD_SHORTCUT = "b";
```

### Persisted State

The `SidebarProvider` supports persisting the sidebar state across page reloads and server-side rendering. It uses cookies to store the current state of the sidebar. When the sidebar state changes, a default cookie named `sidebar_state` is set with the current open/closed state. This cookie is then read on subsequent page loads to restore the sidebar state.

To persist sidebar state in SSR, set up your `SidebarProvider` in `App.vue` like this:

```vue:line-numbers title="App.vue"
<!-- with Nuxt -->
<script setup lang="ts">
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "@/components/AppSidebar.vue"

const defaultOpen = useCookie<string>('sidebar_state')
</script>

<template>
  <SidebarProvider :defaultOpen="defaultOpen">
    <AppSidebar />
    <main>
      <SidebarTrigger />
      <RouterView />  <!-- or <slot /> -->
    </main>
  </SidebarProvider>
</template>

```

You can change the name of the cookie by updating the `SIDEBAR_COOKIE_NAME` variable in `sidebar/utils.ts`.

```ts:line-numbers title="@/components/ui/sidebar/utils.ts"
export const SIDEBAR_COOKIE_NAME = "sidebar_state"
```

## Sidebar

The main `Sidebar` component used to render a collapsible sidebar

```vue:line-numbers
<script setup lang="ts">
import { Sidebar } from "@/components/ui/sidebar";
</script>

<template>
  <Sidebar />
</template>
```

### Props

| Property      | Type                              | Description                      |
| ------------- | --------------------------------- | -------------------------------- |
| `side`        | `left` or `right`                 | The side of the sidebar          |
| `variant`     | `sidebar`, `floating`, or `inset` | The variant of the sidebar       |
| `collapsible` | `offcanvas`, `icon`, or `none`    | Collapsible state of the sidebar |

### side

Use the `side` prop to change the side of the sidebar

Available options are `left` and `right`.

```vue:line-numbers
<Sidebar side="left | right" />
```

### variant

Use the `variant` prop to change the variant of the sidebar

Available options are `sidebar`, `floating` and `inset`.

```vue:line-numbers
<Sidebar variant="sidebar | floating | inset" />
```

<Callout>

**Note:** If you use the `inset` variant, remember to wrap your main content
in a `SidebarInset` component.

</Callout>

```vue:line-numbers
<template>
  <SidebarProvider>
    <Sidebar variant="inset">
      <SidebarInset>
        <main>
          <slot />
        </main>
      </SidebarInset>
    </Sidebar>
  </SidebarProvider>
</template>
```

### collapsible

Use the `collapsible` prop to make the sidebar collapsible

Available options are `offcanvas`, `icon` and `none`.

```vue:line-numbers
<Sidebar collapsible="offcanvas | icon | none" />
```

| Prop        | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| `offcanvas` | A collapsible sidebar that slides in from the left or right. |
| `icon`      | A sidebar that collapses to icons.                           |
| `none`      | A non-collapsible sidebar                                    |

## useSidebar

The `useSidebar` composable is used to control the sidebar.

```vue:line-numbers
<script setup lang="ts">
import { useSidebar } from "@/components/ui/sidebar";

const {
  state,
  open,
  setOpen,
  openMobile,
  setOpenMobile,
  isMobile,
  toggleSidebar,
} = useSidebar()
</script>
```

| Property        | Type                      | Description                                   |
| --------------- | ------------------------- | --------------------------------------------- |
| `state`         | `expanded` or `collapsed` | The current state of the sidebar.             |
| `open`          | `boolean`                 | Whether the sidebar is open.                  |
| `setOpen`       | `(open: boolean) => void` | Sets the open state of the sidebar.           |
| `openMobile`    | `boolean`                 | Whether the sidebar is open on mobile.        |
| `setOpenMobile` | `(open: boolean) => void` | Sets the open state of the sidebar on mobile. |
| `isMobile`      | `boolean`                 | Whether the sidebar is on mobile.             |
| `toggleSidebar` | `() => void`              | Toggles the sidebar. Desktop and mobile.      |

## SidebarHeader

Use the `SidebarHeader` component to add a sticky header to the sidebar

The following example adds a `<DropdownMenu>` to the `SidebarHeader`.

<figure class="flex flex-col gap-4">
  <BlockPreview url="/block-renderer?name=DemoSidebarHeader&styles=new-york" ></BlockPreview>
  <figcaption class="text-center text-sm text-gray-500">
   A sidebar header with a dropdown menu.
  </figcaption>
</figure>

```vue:line-numbers title="@/components/AppSidebar.vue"
<template>
  <Sidebar>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  Select Workspace
                  <ChevronDown class="ml-auto" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-[--bits-dropdown-menu-anchor-width]">
              <DropdownMenuItem>
                <span>Acme Inc</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Acme Corp.</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  </Sidebar>
</template>
```

## SidebarFooter

Use the `SidebarFooter` component to add a sticky footer to the sidebar

The following example adds a `<DropdownMenu>` to the `SidebarFooter`.

<figure class="flex flex-col gap-4">
  <BlockPreview url="/block-renderer?name=DemoSidebarFooter&styles=new-york" ></BlockPreview>
  <figcaption class="text-center text-sm text-gray-500">
  A sidebar footer with a dropdown menu.
  </figcaption>
</figure>

```vue:line-numbers title="@/components/AppSidebar.vue"
<template>
  <SidebarProvider>
    <Sidebar>
      <SidebarHeader />
      <SidebarContent />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Username
                  <ChevronUp class="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                class="w-[--reka-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  </SidebarProvider>
</template>
```

## SidebarContent

The `SidebarContent` component is used to wrap the content of the sidebar This is where you add your `SidebarGroup` components. It is scrollable.

```vue:line-numbers
<template>
  <Sidebar>
    <SidebarContent>
      <SidebarGroup />
      <SidebarGroup />
    </SidebarContent>
  </Sidebar>
</template>
```

## SidebarGroup

Use the `SidebarGroup` component to create a section within the sidebar

A `SidebarGroup` has a `SidebarGroupLabel`, a `SidebarGroupContent` and an optional `SidebarGroupAction`.

<figure class="flex flex-col gap-4">
  <BlockPreview url="/block-renderer?name=DemoSidebarGroup&styles=new-york" ></BlockPreview>
  <figcaption class="text-center text-sm text-gray-500">
A sidebar group.
  </figcaption>
</figure>

```vue:line-numbers
<template>
  <Sidebar>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupAction>
          <Plus /> <span class="sr-only">Add Project</span>
        </SidebarGroupAction>
        <SidebarGroupContent></SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
</template>
```

## Collapsible SidebarGroup

To make a `SidebarGroup` collapsible, wrap it in a `Collapsible`.

<figure class="flex flex-col gap-4">
  <BlockPreview url="/block-renderer?name=DemoSidebarGroupCollapsible&styles=new-york" ></BlockPreview>
  <figcaption class="text-center text-sm text-gray-500">
A collapsible sidebar group.
  </figcaption>
</figure>

```vue:line-numbers
<template>
  <Collapsible defaultOpen class="group/collapsible">
    <SidebarGroup>
      <SidebarGroupLabel asChild>
        <CollapsibleTrigger>
          Help
          <ChevronDown class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
        </CollapsibleTrigger>
      </SidebarGroupLabel>
      <CollapsibleContent>
        <SidebarGroupContent />
      </CollapsibleContent>
    </SidebarGroup>
  </Collapsible>
</template>
```

<Callout>

**Note:** We wrap the `CollapsibleTrigger` in a `SidebarGroupLabel` to render
a button.

</Callout>

## SidebarGroupAction

Use the `SidebarGroupAction` component to add an action to a `SidebarGroup`.

```vue:line-numbers {4-6}
<template>
  <SidebarGroup>
    <SidebarGroupLabel>Projects</SidebarGroupLabel>
    <SidebarGroupAction title="Add Project">
      <Plus /> <span class="sr-only">Add Project</span>
    </SidebarGroupAction>
    <SidebarGroupContent />
  </SidebarGroup>
</template>
```

<figure class="flex flex-col gap-4">
  <BlockPreview url="/block-renderer?name=DemoSidebarGroupAction&styles=new-york" ></BlockPreview>
  <figcaption class="text-center text-sm text-gray-500">
A sidebar group with an action button.
  </figcaption>
</figure>

## SidebarMenu

The `SidebarMenu` component is used for building a menu within a `SidebarGroup`.

A `SidebarMenu` is composed of `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, and `SidebarMenuSub` components.

<img
  src="/images/sidebar-menu.png"
  width="716"
  height="420"
  alt="Sidebar Menu"
  class="border dark:hidden rounded-lg overflow-hidden mt-6 w-full"
/>
<img
  src="/images/sidebar-menu-dark.png"
  width="716"
  height="420"
  alt="Sidebar Menu"
  class="border hidden dark:block rounded-lg overflow-hidden mt-6 w-full"
/>

Here's an example of a `SidebarMenu` component rendering a list of projects.

<figure class="flex flex-col gap-4">
  <BlockPreview url="/block-renderer?name=DemoSidebarMenu&styles=new-york" ></BlockPreview>
  <figcaption class="text-center text-sm text-gray-500">
A sidebar menu with a list of projects.
  </figcaption>
</figure>

```vue:line-numbers
<template>
<Sidebar>
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
            <SidebarMenuItem v-for="project in projects" :key="project.name">
              <SidebarMenuButton asChild>
                <a :href="project.url">
                  <component :is="project.icon" />
                  <span>{{project.name}}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>
</Sidebar>
</template>
```

## SidebarMenuButton

The `SidebarMenuButton` component is used to render a menu button within a `SidebarMenuItem`.

### Link or Anchor

By default, the `SidebarMenuButton` renders a button, but you can use the `asChild` prop to render a different component such as an `<a>` tag.

```vue:line-numbers
<template>
  <SidebarMenuButton asChild>
    <a href="#">Home</a>
  </SidebarMenuButton>
</template>
```

### Icon and Label

You can render an icon and a truncated label inside the button. Remember to wrap the label in a `<span>` tag.

```vue:line-numbers
<template>
  <SidebarMenuButton asChild>
    <a href="#">
      <Home />
      <span>Home</span>
    </a>
  </SidebarMenuButton>
</template>
```

### isActive

Use the `isActive` prop to mark a menu item as active.

```vue:line-numbers
<template>
  <SidebarMenuButton asChild isActive>
    <a href="#">Home</a>
  </SidebarMenuButton>
</template>
```

## SidebarMenuAction

The `SidebarMenuAction` component is used to render a menu action within a `SidebarMenuItem`.

This button works independently of the `SidebarMenuButton` i.e. you can have the `SidebarMenuButton` as a clickable link and the `SidebarMenuAction` as a button.

```vue:line-numbers
<template>
  <SidebarMenuItem>
    <SidebarMenuButton asChild>
      <a href="#">
        <Home />
        <span>Home</span>
      </a>
    </SidebarMenuButton>
    <SidebarMenuAction>
      <Plus /> <span classs="sr-only">Add Project</span>
    </SidebarMenuAction>
  </SidebarMenuItem>
</template>
```

### DropdownMenu

Here's an example of a `SidebarMenuAction` component rendering a `DropdownMenu`.

<figure class="flex flex-col gap-4">
  <BlockPreview url="/block-renderer?name=DemoSidebarMenuAction&styles=new-york" ></BlockPreview>
  <figcaption class="text-center text-sm text-gray-500">
A sidebar menu action with a dropdown menu.
  </figcaption>
</figure>

```vue:line-numbers
<template>
<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <a href="#">
      <Home />
      <span>Home</span>
    </a>
  </SidebarMenuButton>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <SidebarMenuAction>
        <MoreHorizontal />
      </SidebarMenuAction>
    </DropdownMenuTrigger>
    <DropdownMenuContent side="right" align="start">
      <DropdownMenuItem>
        <span>Edit Project</span>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <span>Delete Project</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</SidebarMenuItem>
</template>
```

## SidebarMenuSub

The `SidebarMenuSub` component is used to render a submenu within a `SidebarMenu`.

Use `SidebarMenuSubItem` and `SidebarMenuSubButton` to render a submenu item.

<figure class="flex flex-col gap-4">
  <BlockPreview url="/block-renderer?name=DemoSidebarMenuSub&styles=new-york" ></BlockPreview>
  <figcaption class="text-center text-sm text-gray-500">
A sidebar menu sub.
  </figcaption>
</figure>

```vue:line-numbers
<template>
  <SidebarMenuItem>
    <SidebarMenuButton />
    <SidebarMenuSub>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton />
      </SidebarMenuSubItem>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton />
      </SidebarMenuSubItem>
    </SidebarMenuSub>
  </SidebarMenuItem>
</template>
```

## Collapsible SidebarMenu

To make a `SidebarMenu` component collapsible, wrap it and the `SidebarMenuSub` components in a `Collapsible`.

<figure class="flex flex-col gap-4">
  <BlockPreview url="/block-renderer?name=DemoSidebarMenuCollapsible&styles=new-york" ></BlockPreview>
  <figcaption class="text-center text-sm text-gray-500">
A collapsible sidebar menu.
  </figcaption>
</figure>

```vue:line-numbers
<template>
  <SidebarMenu>
    <Collapsible defaultOpen classs="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            <SidebarMenuSubItem />
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  </SidebarMenu>
</template>
```

## SidebarMenuBadge

The `SidebarMenuBadge` component is used to render a badge within a `SidebarMenuItem`.

<figure class="flex flex-col gap-4">
  <BlockPreview url="/block-renderer?name=DemoSidebarMenuBadge&styles=new-york" ></BlockPreview>
  <figcaption class="text-center text-sm text-gray-500">
A sidebar menu badge.
  </figcaption>
</figure>

```vue:line-numbers
<template>
  <SidebarMenuItem>
    <SidebarMenuButton />
    <SidebarMenuBadge>24</SidebarMenuBadge>
  </SidebarMenuItem>
</template>
```

## SidebarMenuSkeleton

The `SidebarMenuSkeleton` component is used to render a skeleton within a `SidebarMenu`. You can use this to show a loading state while waiting for data to load.

```vue:line-numbers
<template>
  <SidebarMenu>
    <SidebarMenuItem v-for="i in 5" :key="i">
      <SidebarMenuSkeleton />
    </SidebarMenuItem>
  </SidebarMenu>
</template>
```

## SidebarSeparator

The `SidebarSeparator` component is used to render a separator within a `Sidebar`.

```vue:line-numbers
<template>
  <Sidebar>
    <SidebarHeader />
    <SidebarSeparator />
    <SidebarContent>
      <SidebarGroup />
      <SidebarSeparator />
      <SidebarGroup />
    </SidebarContent>
  </Sidebar>
</template>
```

## SidebarTrigger

Use the `SidebarTrigger` component to render a button that toggles the sidebar.

The `SidebarTrigger` component must be used within a `SidebarProvider`.

```vue:line-numbers
<template>
  <SidebarProvider>
    <Sidebar />
    <main>
      <SidebarTrigger />
    </main>
  </SidebarProvider>
</template>
```

## Custom Trigger

To create a custom trigger, you can use the `useSidebar` composable.

```vue:line-numbers
<script setup lang="ts">
import { useSidebar } from "@/components/ui/sidebar";
const { toggleSidebar } = useSidebar();
</script>

<template>
  <button @click="toggleSidebar">Toggle Sidebar</button>
</template>
```

## SidebarRail

The `SidebarRail` component is used to render a rail within a `Sidebar`. This rail can be used to toggle the sidebar

```vue:line-numbers
<template>
  <Sidebar>
    <SidebarHeader />
    <SidebarContent>
      <SidebarGroup />
    </SidebarContent>
    <SidebarFooter />
    <SidebarRail />
  </Sidebar>
</template>
```

## Controlled Sidebar

Use the `open` prop and `@update:open` emit (or `v-model:open`) to control the sidebar state.

<figure class="flex flex-col gap-4">
  <BlockPreview url="/block-renderer?name=DemoSidebarControlled&styles=new-york" ></BlockPreview>
  <figcaption class="text-center text-sm text-gray-500">
A controlled sidebar.
  </figcaption>
</figure>

```vue:line-numbers
<script setup lang="ts">
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { ref } from "vue"

const open = ref(false)
</script>

<template>
  <SidebarProvider v-model:open="open">
    <Sidebar />
  </SidebarProvider>
</template>
```

## Theming

We use the following CSS variables to theme the sidebar

```css
@layer base {
  :root {
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 0 0% 98%;
    --sidebar-primary-foreground: 240 5.9% 10%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}
```

**We intentionally use different variables for the sidebar and the rest of the application** to make it easy to have a sidebar that is styled differently from the rest of the application. Think a sidebar with a darker shade from the main application.

## Styling

Here are some tips for styling the sidebar based on different states.

- **Styling an element based on the sidebar collapsible state.** The following will hide the `SidebarGroup` when the sidebar is in `icon` mode.

```vue
<template>
  <Sidebar collapsible="icon">
    <SidebarContent>
      <SidebarGroup class="group-data-[collapsible=icon]:hidden" />
    </SidebarContent>
  </Sidebar>
</template>
```

- **Styling a menu action based on the menu button active state.** The following will force the menu action to be visible when the menu button is active.

```vue
<template>
  <SidebarMenuItem>
    <SidebarMenuButton />
    <SidebarMenuAction class="peer-data-[active=true]/menu-button:opacity-100" />
  </SidebarMenuItem>
</template>
```

You can find more tips on using states for styling in this [Twitter thread](https://x.com/shadcn/status/1842329158879420864).

---

---

url: /docs/components/skeleton.md
description: Use to show a placeholder while content is loading.

---

<ComponentPreview name="SkeletonDemo" />

## Installation

<TabPreview name="CLI">
<template #CLI>

```bash
npx shadcn-vue@latest add skeleton
```

</template>

<template #Manual>

<Steps>

### Copy and paste the following code into your project

<<< @/registry/default/ui/skeleton/Skeleton.vue

</Steps>

</template>
</TabPreview>

## Usage

```vue
<template>
  <Skeleton class="h-5 w-[100px] rounded-full" />
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>
```

## Examples

### Card

<ComponentPreview name="SkeletonCard" />

---

---

url: /docs/components/slider.md
description: An input where the user selects a value from within a given range.

---

<ComponentPreview name="SliderDemo" />

## Installation

```bash
npx shadcn-vue@latest add slider
```

## Usage

```vue
<template>
  <Slider :default-value="[33]" :max="100" :step="1" />
</template>

<script setup lang="ts">
import { Slider } from '@/components/ui/slider'
</script>
```

## Examples

### Form

<ComponentPreview name="SliderForm" />

---

---

url: /docs/components/sonner.md
description: An opinionated toast component for Vue.

---

<ComponentPreview name="SonnerDemo" />

## About

The Sonner component is provided by [vue-sonner](https://vue-sonner.vercel.app/), which is a Vue port of Sonner, originally created by [Emil Kowalski](https://twitter.com/emilkowalski_) for React.

## Installation

<Steps>

### Run the following command

```bash
npx shadcn-vue@latest add sonner
```

### Add the Toaster component

Add the following `Toaster` component to your `App.vue` file:

```vue title="App.vue" {2,6}
<template>
  <Toaster />

  <!-- Nuxt  -->
  <ClientOnly>
    <Toaster />
  </ClientOnly>
</template>

<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
</script>
```

</Steps>

## Usage

```vue
<template>
  <Button
    variant="outline"
    @click="
      () => {
        toast('Event has been created', {
          description: 'Sunday, December 03, 2023 at 9:00 AM',
          action: {
            label: 'Undo',
            onClick: () => console.log('Undo'),
          },
        });
      }
    "
  >
    Add to calendar
  </Button>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
</script>
```

## Examples

### Sonner with Dialog

Related issue https://github.com/unovue/shadcn-vue/issues/462

Add `pointer-events-auto` class to Toaster component in your `App.vue` file:

```vue {6}
<template>
  <Toaster class="pointer-events-auto" />
</template>

<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
</script>
```

<ComponentPreview name="SonnerWithDialog" />

---

---

url: /docs/components/stepper.md
description: >-
A set of steps that are used to indicate progress through a multi-step
process.

---

<ComponentPreview name="StepperDemo" />

## Installation

```bash
npx shadcn-vue@latest add stepper
```

## Usage

```vue
<template>
  <Stepper>
    <StepperItem :step="1">
      <StepperTrigger>
        <StepperIndicator>1</StepperIndicator>
        <StepperTitle>Step 1</StepperTitle>
        <StepperDescription>This is the first step</StepperDescription>
      </StepperTrigger>
      <StepperSeparator />
    </StepperItem>
    <StepperItem :step="2">
      <StepperTrigger>
        <StepperIndicator>2</StepperIndicator>
        <StepperTitle>Step 2</StepperTitle>
        <StepperDescription>This is the second step</StepperDescription>
      </StepperTrigger>
    </StepperItem>
  </Stepper>
</template>

<script setup lang="ts">
import { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from '@/components/ui/stepper'
</script>
```

## Examples

### Horizontal

<ComponentPreview name="StepperHorizental" />

### Vertical

<ComponentPreview name="StepperVertical" />

### Form

<ComponentPreview name="StepperForm" />

---

---

url: /docs/components/switch.md
description: A control that allows the user to toggle between checked and not checked.

---

<ComponentPreview name="SwitchDemo" />

## Installation

<TabPreview name="CLI">
<template #CLI>

```bash
npx shadcn-vue@latest add switch
```

</template>

<template #Manual>

<Steps>

### Install the following dependency:

```bash
npm install reka-ui
```

### Copy and paste the following code into your project

<<< @/registry/default/ui/switch/Switch.vue

</Steps>

</template>
</TabPreview>

## Usage

```vue
<template>
  <Switch />
</template>

<script setup lang="ts">
import { Switch } from '@/components/ui/switch'
</script>
```

# Add icon inside switch thumb

```vue
<template>
  <Switch :model-value="isDark" @update:model-value="toggleTheme">
    <template #thumb>
      <Icon v-if="isDark" icon="lucide:moon" class="size-3" />
      <Icon v-else icon="lucide:sun" class="size-3" />
    </template>
  </Switch>
</template>
```

## Examples

### Form

<ComponentPreview name="SwitchForm" />

---

---

url: /docs/components/table.md
description: A responsive table component.

---

<ComponentPreview name="TableDemo" />

## Installation

```bash
npx shadcn-vue@latest add table
```

## Usage

```vue
<template>
  <Table>
    <TableCaption>A list of your recent invoices.</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead class="w-[100px]"> Invoice </TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Method</TableHead>
        <TableHead class="text-right"> Amount </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell class="font-medium"> INV001 </TableCell>
        <TableCell>Paid</TableCell>
        <TableCell>Credit Card</TableCell>
        <TableCell class="text-right"> $250.00 </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

<script setup lang="ts">
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
</script>
```

## Data Table

You can use the `<Table />` component to build more complex data tables. Combine it with [@tanstack/vue-table](https://tanstack.com/table/v8) to create tables with sorting, filtering and pagination.

See the [Data Table](/docs/components/data-table) documentation for more information.

You can also see an example of a data table in the [Tasks](/examples/tasks) demo.

---

---

url: /docs/components/tabs.md
description: >-
A set of layered sections of content—known as tab panels—that are displayed
one at a time.

---

<ComponentPreview name="TabsDemo" />

## Installation

```bash
npx shadcn-vue@latest add tabs
```

## Usage

```vue
<template>
  <Tabs default-value="account" class="w-[400px]">
    <TabsList>
      <TabsTrigger value="account"> Account </TabsTrigger>
      <TabsTrigger value="password"> Password </TabsTrigger>
    </TabsList>
    <TabsContent value="account"> Make changes to your account here. </TabsContent>
    <TabsContent value="password"> Change your password here. </TabsContent>
  </Tabs>
</template>

<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
</script>
```

## Examples

### Vertical

<ComponentPreview name="TabsVerticalDemo" />

---

---

url: /docs/components/tags-input.md
description: 'Tag inputs render tags inside an input, followed by an actual text input.'

---

<ComponentPreview name="TagsInputDemo" />

## Installation

```bash
npx shadcn-vue@latest add tags-input
```

## Usage

### Tags with Combobox

<ComponentPreview name="TagsInputComboboxDemo" />

### Form

<ComponentPreview name="TagsInputFormDemo" />

---

---

url: /docs/tailwind-v4.md
description: How to use shadcn-vue with Tailwind v4.

---

<script setup>
import Button from '@/registry/new-york/ui/button/Button.vue'
</script>

It's here! Tailwind v4. Ready for you to try out. You can start using it today.

<div class="flex gap-2 items-center mt-6 not-docs">
  <Button asChild size="sm" class="rounded-lg">
    <a href="#try-it-out">Get Started</a>
  </Button>
  <Button asChild size="sm" variant="outline" class="rounded-lg">
    <a href="https://v4.shadcn-vue.com" target="_blank" rel="noopener noreferrer">
      See Demo
    </a>
  </Button>
</div>

## What's New

- The CLI can now initialize projects with Tailwind v4.
- Full support for the new `@theme` directive and `@theme inline` option.
- All components are updated for Tailwind v4.
- Every primitive now has a `data-slot` attribute for styling.
- We've fixed and cleaned up the style of the components.
- We're deprecating the `toast` component in favor of `sonner`.
- Buttons now use the default cursor.
- We're deprecating the `default` style. New projects will use `new-york`.
- HSL colors are now converted to OKLCH.

**Note: this is non-breaking. Your existing apps with Tailwind v3 will still work. When you add new components, they'll still be in v3 until you upgrade. Only new projects start with Tailwind v4.**

## See it Live

I put together a demo with all the updated components here: https://v4.shadcn-vue.com

Take a look and test the components. If you find any bugs, please let me know on [GitHub](https://github.com/unovue/shadcn-vue).

## Try It Out

See the framework specific guides below for how to get started.

<div class="grid gap-4 mt-8 sm:grid-cols-2 sm:gap-6 not-docs">
  <LinkedCard href="/docs/installation/vite">
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      class="w-10 h-10"
      fill="currentColor"
    >
      <title>Vite</title>
      <path d="m8.286 10.578.512-8.657a.306.306 0 0 1 .247-.282L17.377.006a.306.306 0 0 1 .353.385l-1.558 5.403a.306.306 0 0 0 .352.385l2.388-.46a.306.306 0 0 1 .332.438l-6.79 13.55-.123.19a.294.294 0 0 1-.252.14c-.177 0-.35-.152-.305-.369l1.095-5.301a.306.306 0 0 0-.388-.355l-1.433.435a.306.306 0 0 1-.389-.354l.69-3.375a.306.306 0 0 0-.37-.36l-2.32.536a.306.306 0 0 1-.374-.316zm14.976-7.926L17.284 3.74l-.544 1.887 2.077-.4a.8.8 0 0 1 .84.369.8.8 0 0 1 .034.783L12.9 19.93l-.013.025-.015.023-.122.19a.801.801 0 0 1-.672.37.826.826 0 0 1-.634-.302.8.8 0 0 1-.16-.67l1.029-4.981-1.12.34a.81.81 0 0 1-.86-.262.802.802 0 0 1-.165-.67l.63-3.08-2.027.468a.808.808 0 0 1-.768-.233.81.81 0 0 1-.217-.6l.389-6.57-7.44-1.33a.612.612 0 0 0-.64.906L11.58 23.691a.612.612 0 0 0 1.066-.004l11.26-20.135a.612.612 0 0 0-.644-.9z" />
    </svg>
    <p class="mt-2 font-medium">Vite</p>
  </LinkedCard>
  <LinkedCard href="/docs/installation/nuxt">
    <svg xmlns="http://www.w3.org/2000/svg"  class="w-12 h-12" viewBox="0 0 900 900" fill="none">
    <title>Nuxt</title>
    <path d="M504.908 750H839.476C850.103 750.001 860.542 747.229 869.745 741.963C878.948 736.696 886.589 729.121 891.9 719.999C897.211 710.876 900.005 700.529 900 689.997C899.995 679.465 897.193 669.12 891.873 660.002L667.187 274.289C661.876 265.169 654.237 257.595 645.036 252.329C635.835 247.064 625.398 244.291 614.773 244.291C604.149 244.291 593.711 247.064 584.511 252.329C575.31 257.595 567.67 265.169 562.36 274.289L504.908 372.979L392.581 179.993C387.266 170.874 379.623 163.301 370.42 158.036C361.216 152.772 350.777 150 340.151 150C329.525 150 319.086 152.772 309.883 158.036C300.679 163.301 293.036 170.874 287.721 179.993L8.12649 660.002C2.80743 669.12 0.00462935 679.465 5.72978e-06 689.997C-0.00461789 700.529 2.78909 710.876 8.10015 719.999C13.4112 729.121 21.0523 736.696 30.255 741.963C39.4576 747.229 49.8973 750.001 60.524 750H270.538C353.748 750 415.112 713.775 457.336 643.101L559.849 467.145L614.757 372.979L779.547 655.834H559.849L504.908 750ZM267.114 655.737L120.551 655.704L340.249 278.586L449.87 467.145L376.474 593.175C348.433 639.03 316.577 655.737 267.114 655.737Z" fill="currentColor"/>
    </svg>
    <p class="mt-2 font-medium">Nuxt</p>
  </LinkedCard>
  <LinkedCard href="/docs/installation/astro">
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      class="w-10 h-10"
      fill="currentColor"
    >
      <title>Astro</title>
      <path
        d="M16.074 16.86C15.354 17.476 13.917 17.895 12.262 17.895C10.23 17.895 8.527 17.263 8.075 16.412C7.914 16.9 7.877 17.458 7.877 17.814C7.877 17.814 7.771 19.564 8.988 20.782C8.988 20.15 9.501 19.637 10.133 19.637C11.216 19.637 11.215 20.582 11.214 21.349V21.418C11.214 22.582 11.925 23.579 12.937 24C12.7812 23.6794 12.7005 23.3275 12.701 22.971C12.701 21.861 13.353 21.448 14.111 20.968C14.713 20.585 15.383 20.161 15.844 19.308C16.0926 18.8493 16.2225 18.3357 16.222 17.814C16.2221 17.4903 16.1722 17.1685 16.074 16.86ZM15.551 0.6C15.747 0.844 15.847 1.172 16.047 1.829L20.415 16.176C18.7743 15.3246 17.0134 14.7284 15.193 14.408L12.35 4.8C12.3273 4.72337 12.2803 4.65616 12.2162 4.60844C12.152 4.56072 12.0742 4.53505 11.9943 4.53528C11.9143 4.5355 11.8366 4.56161 11.7727 4.60969C11.7089 4.65777 11.6623 4.72524 11.64 4.802L8.83 14.405C7.00149 14.724 5.23264 15.3213 3.585 16.176L7.974 1.827C8.174 1.171 8.274 0.843 8.471 0.6C8.64406 0.385433 8.86922 0.218799 9.125 0.116C9.415 0 9.757 0 10.443 0H13.578C14.264 0 14.608 0 14.898 0.117C15.1529 0.219851 15.3783 0.386105 15.551 0.6Z"
        fill="currentColor"
      />
    </svg>
    <p class="mt-2 font-medium">Astro</p>
  </LinkedCard>
  <LinkedCard href="/docs/installation/laravel">
    <svg
      role="img"
      viewBox="0 0 62 65"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      class="w-10 h-10"
    >
      <path d="M61.8548 14.6253C61.8778 14.7102 61.8895 14.7978 61.8897 14.8858V28.5615C61.8898 28.737 61.8434 28.9095 61.7554 29.0614C61.6675 29.2132 61.5409 29.3392 61.3887 29.4265L49.9104 36.0351V49.1337C49.9104 49.4902 49.7209 49.8192 49.4118 49.9987L25.4519 63.7916C25.3971 63.8227 25.3372 63.8427 25.2774 63.8639C25.255 63.8714 25.2338 63.8851 25.2101 63.8913C25.0426 63.9354 24.8666 63.9354 24.6991 63.8913C24.6716 63.8838 24.6467 63.8689 24.6205 63.8589C24.5657 63.8389 24.5084 63.8215 24.456 63.7916L0.501061 49.9987C0.348882 49.9113 0.222437 49.7853 0.134469 49.6334C0.0465019 49.4816 0.000120578 49.3092 0 49.1337L0 8.10652C0 8.01678 0.0124642 7.92953 0.0348998 7.84477C0.0423783 7.8161 0.0598282 7.78993 0.0697995 7.76126C0.0884958 7.70891 0.105946 7.65531 0.133367 7.6067C0.152063 7.5743 0.179485 7.54812 0.20192 7.51821C0.230588 7.47832 0.256763 7.43719 0.290416 7.40229C0.319084 7.37362 0.356476 7.35243 0.388883 7.32751C0.425029 7.29759 0.457436 7.26518 0.498568 7.2415L12.4779 0.345059C12.6296 0.257786 12.8015 0.211853 12.9765 0.211853C13.1515 0.211853 13.3234 0.257786 13.475 0.345059L25.4531 7.2415H25.4556C25.4955 7.26643 25.5292 7.29759 25.5653 7.32626C25.5977 7.35119 25.6339 7.37362 25.6625 7.40104C25.6974 7.43719 25.7224 7.47832 25.7523 7.51821C25.7735 7.54812 25.8021 7.5743 25.8196 7.6067C25.8483 7.65656 25.8645 7.70891 25.8844 7.76126C25.8944 7.78993 25.9118 7.8161 25.9193 7.84602C25.9423 7.93096 25.954 8.01853 25.9542 8.10652V33.7317L35.9355 27.9844V14.8846C35.9355 14.7973 35.948 14.7088 35.9704 14.6253C35.9792 14.5954 35.9954 14.5692 36.0053 14.5405C36.0253 14.4882 36.0427 14.4346 36.0702 14.386C36.0888 14.3536 36.1163 14.3274 36.1375 14.2975C36.1674 14.2576 36.1923 14.2165 36.2272 14.1816C36.2559 14.1529 36.292 14.1317 36.3244 14.1068C36.3618 14.0769 36.3942 14.0445 36.4341 14.0208L48.4147 7.12434C48.5663 7.03694 48.7383 6.99094 48.9133 6.99094C49.0883 6.99094 49.2602 7.03694 49.4118 7.12434L61.3899 14.0208C61.4323 14.0457 61.4647 14.0769 61.5021 14.1055C61.5333 14.1305 61.5694 14.1529 61.5981 14.1803C61.633 14.2165 61.6579 14.2576 61.6878 14.2975C61.7103 14.3274 61.7377 14.3536 61.7551 14.386C61.7838 14.4346 61.8 14.4882 61.8199 14.5405C61.8312 14.5692 61.8474 14.5954 61.8548 14.6253ZM59.893 27.9844V16.6121L55.7013 19.0252L49.9104 22.3593V33.7317L59.8942 27.9844H59.893ZM47.9149 48.5566V37.1768L42.2187 40.4299L25.953 49.7133V61.2003L47.9149 48.5566ZM1.99677 9.83281V48.5566L23.9562 61.199V49.7145L12.4841 43.2219L12.4804 43.2194L12.4754 43.2169C12.4368 43.1945 12.4044 43.1621 12.3682 43.1347C12.3371 43.1097 12.3009 43.0898 12.2735 43.0624L12.271 43.0586C12.2386 43.0275 12.2162 42.9888 12.1887 42.9539C12.1638 42.9203 12.1339 42.8916 12.114 42.8567L12.1127 42.853C12.0903 42.8156 12.0766 42.7707 12.0604 42.7283C12.0442 42.6909 12.023 42.656 12.013 42.6161C12.0005 42.5688 11.998 42.5177 11.9931 42.4691C11.9881 42.4317 11.9781 42.3943 11.9781 42.3569V15.5801L6.18848 12.2446L1.99677 9.83281ZM12.9777 2.36177L2.99764 8.10652L12.9752 13.8513L22.9541 8.10527L12.9752 2.36177H12.9777ZM18.1678 38.2138L23.9574 34.8809V9.83281L19.7657 12.2459L13.9749 15.5801V40.6281L18.1678 38.2138ZM48.9133 9.14105L38.9344 14.8858L48.9133 20.6305L58.8909 14.8846L48.9133 9.14105ZM47.9149 22.3593L42.124 19.0252L37.9323 16.6121V27.9844L43.7219 31.3174L47.9149 33.7317V22.3593ZM24.9533 47.987L39.59 39.631L46.9065 35.4555L36.9352 29.7145L25.4544 36.3242L14.9907 42.3482L24.9533 47.987Z" />
    </svg>
    <p class="mt-2 font-medium">Laravel</p>
  </LinkedCard>
  <LinkedCard href="/docs/installation/manual">
    <svg class="w-10 h-10" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Akar Icons by Arturo Wibawa - https://github.com/artcoholic/akar-icons/blob/master/LICENSE --><path fill="currentColor" d="M19.114 2H15l-3 4.9L9.429 2H0l12 21L24 2zM3 3.75h2.914L12 14.6l6.086-10.85H21L12 19.5z"/></svg>
    <p class="mt-2 font-medium">Manual</p>
  </LinkedCard>
</div>

## Upgrade Your Project

<Callout class="bg-blue-50 mt-6 border-blue-600 dark:border-blue-900 dark:bg-blue-950 mb-6 [&_code]:bg-blue-100 dark:[&_code]:bg-blue-900 [&_a]:underline [&_a]:underline-offset-4">

**Important:** Before upgrading, please read the [Tailwind v4 Compatibility
Docs](https://tailwindcss.com/docs/compatibility) and make sure your project
is ready for the upgrade. Tailwind v4 uses bleeding-edge browser features and
is designed for modern browsers.

</Callout>

One of the major advantages of using `shadcn-vue` is that the code you end up with is exactly what you'd write yourself. There are no hidden abstractions.

This means when a dependency has a new release, you can just follow the official upgrade paths.

Here's how to upgrade your existing projects (full docs are on the way):

### 1. Follow the Tailwind v4 Upgrade Guide

- Upgrade to Tailwind v4 by following the official upgrade guide: https://tailwindcss.com/docs/upgrade-guide
- Use the `@tailwindcss/upgrade@next` codemod to remove deprecated utility classes and update tailwind config.

### 2. Update your CSS variables

The codemod will migrate your CSS variables as references under the `@theme` directive.

```css:line-numbers
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
  }
}

@theme {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
}
```

This works. But to make it easier to work with colors and other variables, we'll need to move the `hsl` wrappers and use `@theme inline`.

Here's how you do it:

1. Move `:root` and `.dark` out of the `@layer` base.
2. Wrap the color values in `hsl()`
3. Add the `inline` option to `@theme` i.e `@theme inline`
4. Remove the `hsl()` wrappers from `@theme`

```css:line-numbers
:root {
  --background: hsl(0 0% 100%); // <-- Wrap in hsl
  --foreground: hsl(0 0% 3.9%);
}

.dark {
  --background: hsl(0 0% 3.9%); // <-- Wrap in hsl
  --foreground: hsl(0 0% 98%);
}

@theme inline {
  --color-background: var(--background); // <-- Remove hsl
  --color-foreground: var(--foreground);
}
```

This change makes it much simpler to access your theme variables in both utility classes and outside of CSS for eg. using color values in JavaScript.

### 3. Use new `size-*` utility

The new `size-*` utility (added in Tailwind v3.4), is now fully supported by `tailwind-merge`. You can replace `w-* h-*` with the new `size-*` utility:

```diff
- w-4 h-4
+ size-4
```

### 4. Install and Update your dependencies

```bash
pnpm i tw-animate-css
pnpm up reka-ui lucide-vue-next tailwind-merge clsx --latest
```

---

---

url: /docs/components/textarea.md
description: Displays a form textarea or a component that looks like a textarea.

---

<ComponentPreview name="TextareaDemo" />

## Installation

<TabPreview name="CLI">
<template #CLI>

```bash
npx shadcn-vue@latest add textarea
```

</template>

<template #Manual>

<Steps>

### Install the following dependency:

```bash
npm install reka-ui
```

### Copy and paste the following code into your project

<<< @/registry/default/ui/textarea/Textarea.vue

</Steps>

</template>
</TabPreview>

## Usage

```vue
<template>
  <Textarea />
</template>

<script setup lang="ts">
import { Textarea } from '@/components/ui/textarea'
</script>
```

## Examples

### Default

<ComponentPreview name="TextareaDemo" />

### Disabled

<ComponentPreview name="TextareaDisabled" />

### With Label

<ComponentPreview name="TextareaWithLabel"   />

### With Text

<ComponentPreview name="TextareaWithText" />

### With Button

<ComponentPreview name="TextareaWithButton" />

### Form

<ComponentPreview name="TextareaForm" />

---

---

url: /docs/theming.md
description: Use CSS Variables to customize the look and feel of your application.

---

You can choose between using CSS variables or Tailwind CSS utility classes for theming.

## Utility classes

```html /bg-zinc-950/ /text-zinc-50/ /dark:bg-white/ /dark:text-zinc-950/
<div class="bg-zinc-950 dark:bg-white" />
```

To use utility classes for theming set `tailwind.cssVariables` to `false` in your `components.json` file.

```json {7} title="components.json"
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": false
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

## CSS Variables

```html /bg-background/ /text-foreground/
<div class="bg-background text-foreground" />
```

To use CSS variables for theming set `tailwind.cssVariables` to `true` in your `components.json` file.

```json {7} title="components.json"
{
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Convention

We use a simple `background` and `foreground` convention for colors. The `background` variable is used for the background color of the component and the `foreground` variable is used for the text color.

<Callout class="mt-4">

The `background` suffix is omitted when the variable is used for the background color of the component.

</Callout>

Given the following CSS variables:

```css
--primary: 222.2 47.4% 11.2%;
--primary-foreground: 210 40% 98%;
```

The `background` color of the following component will be `hsl(var(--primary))` and the `foreground` color will be `hsl(var(--primary-foreground))`.

```html
<div class="text-primary-foreground bg-primary">Hello</div>
```

<Callout>

**CSS variables must be defined without color space function**. See the [Tailwind CSS documentation](https://tailwindcss.com/docs/customizing-colors#using-css-variables) for more information.

</Callout>

### List of variables

Here's the list of variables available for customization:

<Steps>

```css
/* Default background color of <body />...etc */
--background: 0 0% 100%;
--foreground: 222.2 47.4% 11.2%;
```

```css
/* Muted backgrounds such as <TabsList />, <Skeleton /> and <Switch /> */
--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;
```

```css
/* Background color for <Card /> */
--card: 0 0% 100%;
--card-foreground: 222.2 47.4% 11.2%;
```

```css
/* Background color for popovers such as <DropdownMenu />, <HoverCard />, <Popover /> */
--popover: 0 0% 100%;
--popover-foreground: 222.2 47.4% 11.2%;
```

```css
/* Default border color */
--border: 214.3 31.8% 91.4%;
```

```css
/* Border color for inputs such as <Input />, <Select />, <Textarea /> */
--input: 214.3 31.8% 91.4%;
```

```css
/* Primary colors for <Button /> */
--primary: 222.2 47.4% 11.2%;
--primary-foreground: 210 40% 98%;
```

```css
/* Secondary colors for <Button /> */
--secondary: 210 40% 96.1%;
--secondary-foreground: 222.2 47.4% 11.2%;
```

```css
/* Used for accents such as hover effects on <DropdownMenuItem>, <SelectItem>...etc */
--accent: 210 40% 96.1%;
--accent-foreground: 222.2 47.4% 11.2%;
```

```css
/* Used for destructive actions such as <Button variant="destructive"> */
--destructive: 0 100% 50%;
--destructive-foreground: 210 40% 98%;
```

```css
/* Used for focus ring */
--ring: 215 20.2% 65.1%;
```

```css
/* Border radius for card, input and buttons */
--radius: 0.5rem;
```

</Steps>

### Adding new colors

To add new colors, you need to add them to your CSS file and to your `tailwind.config.js` file.

```css title="assets/css/tailwind.css"
:root {
  --warning: 38 92% 50%;
  --warning-foreground: 48 96% 89%;
}

.dark {
  --warning: 48 96% 89%;
  --warning-foreground: 38 92% 50%;
}
```

```js {5-6} title="tailwind.config.js"
module.exports = {
  theme: {
    extend: {
      colors: {
        'warning': 'hsl(var(--warning))',
        'warning-foreground': 'hsl(var(--warning-foreground))'
      }
    }
  }
}
```

You can now use the `warning` utility class in your components.

```html /bg-warning/ /text-warning-foreground/
<div class="text-warning-foreground bg-warning" />
```

### Other color formats

I recommend using [HSL colors](https://www.smashingmagazine.com/2021/07/hsl-colors-css/) for theming but you can also use other color formats if you prefer.

See the [Tailwind CSS documentation](https://tailwindcss.com/docs/customizing-colors#using-css-variables) for more information on using `rgb`, `rgba` or `hsl` colors.

## Hex -> Color Channel

You can use this tool to convert your HEX color to HSL without the color space function. Simply add your color in hex format, copy one of the generated values, then add them to the CSS variable.

<!-- <HexToChannels /> -->

---

---

url: /docs/components/toast.md
description: A succinct message that is displayed temporarily.

---

<ComponentPreview name="ToastDemo" />

## Installation

<Steps>

### Run the following command

```bash
npx shadcn-vue@latest add toast
```

### Add the Toaster component

Add the following `Toaster` component to your `App.vue` file:

```vue title="App.vue" {2,6}
<template>
  <Toaster />

  <!-- Nuxt  -->
  <ClientOnly>
    <Toaster />
  </ClientOnly>
</template>

<script setup lang="ts">
import Toaster from '@/components/ui/toast/Toaster.vue'
</script>
```

</Steps>

## Usage

The `useToast` hook returns a `toast` function that you can use to display a toast.

```tsx
import { useToast } from '@/components/ui/toast/use-toast'
```

```vue
<template>
  <Toaster />
  <Button
    @click="
      () => {
        toast({
          title: 'Scheduled: Catch up',
          description: 'Friday, February 10, 2023 at 5:57 PM',
        });
      }
    "
  >
    Add to calendar
  </Button>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/toast'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()
</script>
```

<Callout>

To display multiple toasts at the same time, you can update the `TOAST_LIMIT` in `use-toast.ts`.

</Callout>

## Examples

### Simple

<ComponentPreview name="ToastSimple" />

### With Title

<ComponentPreview name="ToastWithTitle" />

### With Action

<ComponentPreview name="ToastWithAction" />

### Destructive

Use `toast({ variant: "destructive" })` to display a destructive toast.

<ComponentPreview name="ToastDestructive" />

---

---

url: /docs/components/toggle.md
description: A two-state button that can be either on or off.

---

<ComponentPreview name="ToggleDemo" />

## Installation

<TabPreview name="CLI">
<template #CLI>

```bash
npx shadcn-vue@latest add toggle
```

</template>

<template #Manual>

<Steps>

### Install the following dependencies:

```bash
npm install reka-ui
```

### Copy and paste the following code into your project

<<< @/registry/default/ui/toggle/Toggle.vue

</Steps>

</template>
</TabPreview>

## Usage

```vue
<template>
  <Toggle>Toggle</Toggle>
</template>

<script setup lang="ts">
import { Toggle } from '@/components/ui/toggle'
</script>
```

## Examples

### Default

<ComponentPreview name="ToggleDemo" />

### Outline

<ComponentPreview name="ToggleItalicDemo" />

### With Text

<ComponentPreview name="ToggleItalicWithTextDemo" />

### Small

<ComponentPreview name="ToggleSmallDemo" />

### Large

<ComponentPreview name="ToggleLargeDemo" />

### Disabled

<ComponentPreview name="ToggleDisabledDemo" />

---

---

url: /docs/components/toggle-group.md
description: A set of two-state buttons that can be toggled on or off.

---

<ComponentPreview name="ToggleGroupDemo" />

## Installation

<TabPreview name="CLI">
<template #CLI>

```bash
npx shadcn-vue@latest add toggle-group
```

</template>

<template #Manual>

<Steps>

### Install the following dependencies:

```bash
npm install reka-ui
```

### Copy and paste the following code into your project

<<< @/registry/default/ui/toggle-group/ToggleGroup.vue

</Steps>

</template>
</TabPreview>

## Usage

```vue
<template>
  <ToggleGroup type="single">
    <ToggleGroupItem value="a"> A </ToggleGroupItem>
    <ToggleGroupItem value="b"> B </ToggleGroupItem>
    <ToggleGroupItem value="c"> C </ToggleGroupItem>
  </ToggleGroup>
</template>

<script setup lang="ts">
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
</script>
```

## Examples

### Default

<ComponentPreview name="ToggleGroupDemo" />

### Outline

<ComponentPreview name="ToggleGroupOutlineDemo" />

### Single

<ComponentPreview name="ToggleGroupSingleDemo" />

### Small

<ComponentPreview name="ToggleGroupSmallDemo" />

### Large

<ComponentPreview name="ToggleGroupLargeDemo" />

### Disabled

<ComponentPreview name="ToggleGroupDisabledDemo" />

---

---

url: /docs/components/tooltip.md
description: >-
A popup that displays information related to an element when the element
receives keyboard focus or the mouse hovers over it.

---

<ComponentPreview name="TooltipDemo" />

## Installation

```bash
npx shadcn-vue@latest add tooltip
```

## Usage

```vue
<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>Hover</TooltipTrigger>
      <TooltipContent>
        <p>Add to library</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
</script>
```

---

---

url: /docs/components/form.md
description: Building forms with VeeValidate and Zod.

---

Forms are tricky. They are one of the most common things you'll build in a web application, but also one of the most complex.

Well-designed HTML forms are:

- Well-structured and semantically correct.
- Easy to use and navigate (keyboard).
- Accessible with ARIA attributes and proper labels.
- Has support for client and server side validation.
- Well-styled and consistent with the rest of the application.

In this guide, we will take a look at building forms with [`vee-validate`](https://vee-validate.logaretm.com/v4/) and [`zod`](https://zod.dev). We're going to use a `<FormField>` component to compose accessible forms using Reka UI components.

## Features

The `<Form />` component is a wrapper around the `vee-validate` library. It provides a few things:

- Composable components for building forms.
- A `<FormField />` component for building controlled form fields.
- Form validation using `zod`.
- Applies the correct `aria` attributes to form fields based on states, handle unique IDs
- Built to work with all Reka UI components.
- Bring your own schema library. We use `zod` but you can use any other supported schema validation you want, like [`yup`](https://github.com/jquense/yup) or [`valibot`](https://valibot.dev/).
- **You have full control over the markup and styling.**

[`vee-validate`](https://vee-validate.logaretm.com/v4/) makes use of two flavors to add validation to your forms.

- Composition API
- Higher-order components (HOC)

## Anatomy

```vue
<template>
  <Form>
    <FormField>
      <FormItem>
        <FormLabel />
        <FormControl>
          <!-- any Form Input component or native input elements -->
        </FormControl>
        <FormDescription />
        <FormMessage />
      </FormItem>
    </FormField>
  </Form>
</template>
```

## Example

<TabPreview name="Component" :names="['Component', 'Native']">
<template #Component>

#### `Input` Component

```vue
<template>
  <FormField v-slot="{ componentField }">
    <FormItem>
      <FormLabel>Username</FormLabel>
      <FormControl>
        <Input placeholder="shadcn" v-bind="componentField" />
      </FormControl>
      <FormDescription />
      <FormMessage />
    </FormItem>
  </FormField>
</template>
```

</template>

<template #Native>

#### native `input` element

```vue
<FormField v-slot="{ field }">
  <FormItem>
    <FormLabel>Username</FormLabel>
    <FormControl>
      <input placeholder="shadcn" v-bind="field" />
    </FormControl>
    <FormDescription />
    <FormMessage />
  </FormItem>
</FormField>
```

</template>
</TabPreview>

## Installation

<TabPreview name="CLI">
<template #CLI>

```bash
npx shadcn-vue@latest add form
```

</template>

<template #Manual>

<Steps>

### Install the following dependency:

```bash
npm install reka-ui vee-validate @vee-validate/zod zod
```

### Copy and paste the following codes into your project:

`index.ts`

<<< @/registry/default/ui/form/index.ts

`FormItem.vue`

<<< @/registry/default/ui/form/FormItem.vue

`FormLabel.vue`

<<< @/registry/default/ui/form/FormLabel.vue

`FormControl.vue`

<<< @/registry/default/ui/form/FormControl.vue

`FormMessage.vue`

<<< @/registry/default/ui/form/FormMessage.vue

`FormDescription.vue`

<<< @/registry/default/ui/form/FormDescription.vue

### Update the import paths to match your project setup.

</Steps>

</template>
</TabPreview>

## Usage

<Steps>

### Create a form schema

Define the shape of your form using a Zod schema. You can read more about using Zod in the [Zod documentation](https://zod.dev).

Use `@vee-validate/zod` to integrate Zod schema validation with `vee-validate`

`toTypedSchema` also makes the form values and submitted values typed automatically and caters for both input and output types of that schema.

```vue:line-numbers {2-3,5-7}
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

const formSchema = toTypedSchema(z.object({
  username: z.string().min(2).max(50),
}))
</script>
```

### Define a form

Use the `useForm` composable from `vee-validate` or use `<Form />` component to create a form.

<TabPreview name="Composition" :names="['Composition', 'Component']">
<template #Composition>

```vue:line-numbers {2,19-21}
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

const formSchema = toTypedSchema(z.object({
  username: z.string().min(2).max(50),
}))

const form = useForm({
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit((values) => {
  console.log('Form submitted!', values)
})
</script>

<template>
  <form @submit="onSubmit">
    ...
  </form>
</template>
```

</template>

<template #Component>

```vue:line-numbers {5,24-26}
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

const formSchema = toTypedSchema(z.object({
  username: z.string().min(2).max(50),
}))

function onSubmit(values) {
  console.log('Form submitted!', values)
}
</script>

<template>
  <Form :validation-schema="formSchema" @submit="onSubmit">
    ...
  </Form>
</template>
```

</template>
</TabPreview>

### Build your form

Based on last step we can either use `<Form />` component or `useForm` composable
`useForm` is recommended because values are typed automatically

```vue:line-numbers {2}
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = toTypedSchema(z.object({
  username: z.string().min(2).max(50),
}))

const form = useForm({
  validationSchema: formSchema,
})

const onSubmit = form.handleSubmit((values) => {
  console.log('Form submitted!', values)
})
</script>

<template>
  <form @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="username">
      <FormItem>
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input type="text" placeholder="shadcn" v-bind="componentField" />
        </FormControl>
        <FormDescription>
          This is your public display name.
        </FormDescription>
        <FormMessage />
      </FormItem>
    </FormField>
    <Button type="submit">
      Submit
    </Button>
  </form>
</template>
```

### Done

That's it. You now have a fully accessible form that is type-safe with client-side validation.

<ComponentPreview
  name="InputForm"
  class="[&_[role=tablist]]:hidden [&>div>div:first-child]:hidden"
/>

</Steps>

## Examples

See the following links for more examples on how to use the `vee-validate` features with other components:

- [Checkbox](/docs/components/checkbox#form)
- [Date Picker](/docs/components/date-picker#form)
- [Input](/docs/components/input#form)
- [Radio Group](/docs/components/radio-group#form)
- [Select](/docs/components/select#form)
- [Slider](/docs/components/slider#form)
- [Switch](/docs/components/switch#form)
- [Textarea](/docs/components/textarea#form)
- [Combobox](/docs/components/combobox#form)

## Extras

This example shows how to add motion to your forms with [Formkit AutoAnimate](https://auto-animate.formkit.com/)

<ComponentPreview name="InputFormAutoAnimate" />

---

---

url: /docs/dark-mode/vite.md
description: Adding dark mode to your vite app.

---

## Dark mode

<Steps>

### Install Dependencies

```bash
npm install @vueuse/core
```

Optional, to include icons for theme button.

```bash
npm install -D @iconify/vue @iconify-json/radix-icons
```

### Add a mode toggle

Place a mode toggle on your site to toggle between light and dark mode.

We're using [`useColorMode`](https://vueuse.org/core/usecolormode/) from [`@vueuse/core`](https://vueuse.org/core/).

> Reactive color mode (dark / light / customs) with auto data persistence.

```vue
<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        <Icon icon="radix-icons:moon" class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Icon icon="radix-icons:sun" class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="mode = 'light'"> Light </DropdownMenuItem>
      <DropdownMenuItem @click="mode = 'dark'"> Dark </DropdownMenuItem>
      <DropdownMenuItem @click="mode = 'auto'"> System </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useColorMode } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Pass { disableTransition: false } to enable transitions
const mode = useColorMode()
</script>
```

</Steps>

---

---

url: /docs/installation/vite.md
description: Install and configure Vite.

---

<Callout class="bg-blue-50 border-blue-600 dark:border-blue-900 dark:bg-blue-950 mt-0 mb-6 [&_code]:bg-blue-100 dark:[&_code]:bg-blue-900">

**Note:** The following guide is for Tailwind v4. If you are using Tailwind
v3, use `shadcn-vue@1.0.3`.

</Callout>

<Steps>

### Create project

Start by creating a new Vue project using `vite`:

```bash
npm create vite@latest my-vue-app -- --template vue-ts
```

### Add Tailwind CSS

```bash
npm install tailwindcss @tailwindcss/vite
```

Replace everything in `src/index.css` with the following:

```css title="src/index.css"
@import 'tailwindcss';
```

### Edit tsconfig.json file

The current version of Vite splits TypeScript configuration into three files, two of which need to be edited.
Add the `baseUrl` and `paths` properties to the `compilerOptions` section of the `tsconfig.json` and
`tsconfig.app.json` files:

```ts:line-numbers {11-16}
{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Edit tsconfig.app.json file

Add the following code to the `tsconfig.app.json` file to resolve paths, for your IDE:

```ts:line-numbers {4-9}
{
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
    // ...
  }
}
```

### Update vite.config.ts

Add the following code to the vite.config.ts so your app can resolve paths without error:

```bash
npm install -D @types/node
```

```typescript
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### Run the CLI

Run the `shadcn-vue` init command to setup your project:

```bash
npx shadcn-vue@latest init
```

You will be asked a few questions to configure `components.json`.

```txt
Which color would you like to use as base color? › Neutral
```

### Add Components

You can now start adding components to your project.

```bash
npx shadcn-vue@latest add button
```

The command above will add the `Button` component to your project. You can then import it like this:

```vue {2,7}
<template>
  <div>
    <Button>Click me</Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>
```

</Steps>

---

---

url: /docs/dark-mode/vitepress.md
description: Adding dark mode to your vitepress app.

---

## Dark mode

<Steps>

### Install Dependencies

```bash
npm install @vueuse/core
```

Optional, to include icons for theme button.

```bash
npm install -D @iconify/vue @iconify-json/radix-icons
```

### Add a mode toggle

Place a mode toggle on your site to toggle between light and dark mode.

We're using [`useToggle`](https://vueuse.org/shared/useToggle/) from [`@vueuse/core`](https://vueuse.org/core/).

> A boolean switcher with utility functions.

```vue
<template>
  <Button variant="outline">
    <Icon icon="radix-icons:moon" class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
    <Icon icon="radix-icons:sun" class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    <span class="sr-only">Toggle theme</span>
  </Button>
</template>

<script setup lang="ts">
import { useToggle } from '@vueuse/core'
import { useData } from 'vitepress'
import { Button } from '@/registry/default/ui/button'

const { frontmatter, isDark } = useData()
const toggleDark = useToggle(isDark)
</script>
```

</Steps>
