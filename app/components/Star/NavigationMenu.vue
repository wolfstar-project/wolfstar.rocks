<template>
	<ul
		:class="
			cn(
				'menu',
				orientation === 'horizontal' ? 'menu-horizontal' : 'menu-vertical',
				collapsed && 'items-center',
				ui?.root,
			)
		"
	>
		<template v-for="(item, index) in flatItems" :key="index">
			<li v-if="item.type === 'separator'" class="divider my-1" />
			<li v-else-if="item.type === 'label'" class="menu-title" :class="item.class">
				<span>{{ item.label }}</span>
			</li>
			<li v-else :class="item.class">
				<details v-if="item.children?.length && !collapsed" :open="item.active">
					<summary>
						<Icon
							v-if="item.icon"
							:name="item.icon"
							class="size-4"
							aria-hidden="true"
						/>
						<span v-if="!collapsed">{{ item.label }}</span>
					</summary>
					<ul :class="ui?.childList">
						<li v-for="(child, childIndex) in item.children" :key="childIndex">
							<NuxtLink
								v-if="child.to || child.href"
								:to="child.to ?? child.href"
								:target="child.target"
								:class="cn(ui?.childLink, child.active && 'active')"
								@click="child.onSelect?.($event)"
							>
								<Icon v-if="child.icon" :name="child.icon" class="size-4" />
								{{ child.label }}
							</NuxtLink>
							<button
								v-else
								type="button"
								:class="ui?.childLink"
								:disabled="child.disabled"
								@click="child.onSelect?.($event)"
							>
								<Icon v-if="child.icon" :name="child.icon" class="size-4" />
								{{ child.label }}
							</button>
						</li>
					</ul>
				</details>
				<NuxtLink
					v-else-if="item.to || item.href"
					:to="item.to ?? item.href"
					:target="item.target"
					:class="
						cn(
							ui?.link,
							variant === 'link' && 'btn btn-ghost btn-sm',
							item.active && 'active',
						)
					"
					:aria-label="collapsed ? item.label : undefined"
					@click="item.onSelect?.($event)"
				>
					<Icon
						v-if="item.icon"
						:name="item.icon"
						class="size-4 shrink-0"
						aria-hidden="true"
					/>
					<span v-if="!collapsed">{{ item.label }}</span>
				</NuxtLink>
				<button
					v-else
					type="button"
					:class="
						cn(
							ui?.link,
							variant === 'link' && 'btn btn-ghost btn-sm',
							item.active && 'active',
						)
					"
					:disabled="item.disabled || undefined"
					:aria-label="collapsed ? item.label : undefined"
					@click="item.onSelect?.($event)"
				>
					<Icon
						v-if="item.icon"
						:name="item.icon"
						class="size-4 shrink-0"
						aria-hidden="true"
					/>
					<span v-if="!collapsed">{{ item.label }}</span>
				</button>
			</li>
		</template>
	</ul>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "#shared/types/ui";
import { cn } from "cnfast";

const props = withDefaults(
	defineProps<{
		items?: NavigationMenuItem[] | NavigationMenuItem[][];
		orientation?: "horizontal" | "vertical";
		collapsed?: boolean;
		variant?: string;
		tooltip?: boolean | object;
		popover?: boolean | object;
		ui?: Record<string, string>;
	}>(),
	{
		items: () => [],
		orientation: "horizontal",
	},
);

const flatItems = computed<NavigationMenuItem[]>(() => {
	const items = props.items ?? [];
	if (items.length === 0) return [];
	const first = items[0];
	if (Array.isArray(first)) {
		return (items as NavigationMenuItem[][]).flat();
	}
	return items as NavigationMenuItem[];
});
</script>
