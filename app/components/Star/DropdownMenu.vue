<template>
	<DropdownMenuRoot>
		<DropdownMenuTrigger as-child>
			<slot />
		</DropdownMenuTrigger>
		<DropdownMenuPortal>
			<DropdownMenuContent
				class="z-50 min-w-48 rounded-md border border-base-200 bg-base-100 p-1 shadow-lg"
				:align="content?.align ?? 'start'"
				:collision-padding="content?.collisionPadding ?? 8"
				:side="content?.side ?? 'bottom'"
				:side-offset="content?.sideOffset ?? 4"
			>
				<template v-for="(group, groupIndex) in normalizedGroups" :key="groupIndex">
					<DropdownMenuSeparator v-if="groupIndex > 0" class="my-1 h-px bg-base-200" />
					<template v-for="(item, itemIndex) in group" :key="itemIndex">
						<DropdownMenuLabel
							v-if="item.type === 'label'"
							class="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold"
						>
							<StarAvatar v-if="item.avatar" v-bind="item.avatar" size="xs" />
							<Icon v-else-if="item.icon" :name="item.icon" class="size-4" />
							{{ item.label }}
						</DropdownMenuLabel>
						<DropdownMenuSeparator
							v-else-if="item.type === 'separator'"
							class="my-1 h-px bg-base-200"
						/>
						<DropdownMenuSub v-else-if="item.children?.length">
							<DropdownMenuSubTrigger
								class="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-base-200"
								:disabled="item.disabled"
							>
								<Icon v-if="item.icon" :name="item.icon" class="size-4" />
								{{ item.label }}
								<Icon name="lucide:chevron-right" class="ms-auto size-4" />
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent
									class="z-50 min-w-40 rounded-md border border-base-200 bg-base-100 p-1 shadow-lg"
								>
									<DropdownMenuItem
										v-for="(child, childIndex) in item.children"
										:key="childIndex"
										class="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-base-200"
										:disabled="child.disabled"
										@select="onSelect(child, $event)"
									>
										<Icon v-if="child.icon" :name="child.icon" class="size-4" />
										<NuxtLink
											v-if="child.to || child.href"
											:to="child.to ?? child.href"
											:target="child.target"
											class="flex flex-1 items-center gap-2"
										>
											{{ child.label }}
										</NuxtLink>
										<span v-else>{{ child.label }}</span>
									</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
						<DropdownMenuItem
							v-else
							class="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-base-200"
							:disabled="item.disabled"
							@select="onSelect(item, $event)"
						>
							<Icon v-if="item.icon" :name="item.icon" class="size-4" />
							<StarAvatar v-else-if="item.avatar" v-bind="item.avatar" size="xs" />
							<template v-if="item.to || item.href">
								<NuxtLink
									:to="item.to ?? item.href"
									:target="item.target"
									class="flex flex-1 items-center gap-2"
									@click.stop
								>
									{{ item.label }}
								</NuxtLink>
							</template>
							<span v-else class="flex-1">{{ item.label }}</span>
							<span v-if="item.kbds?.length" class="ms-auto text-xs opacity-60">
								{{ item.kbds.join(" ") }}
							</span>
						</DropdownMenuItem>
					</template>
				</template>
			</DropdownMenuContent>
		</DropdownMenuPortal>
	</DropdownMenuRoot>
</template>

<script setup lang="ts">
import type { DropdownMenuItem as MenuItem } from "#shared/types/ui";
import {
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRoot,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "reka-ui";

const props = defineProps<{
	items?: MenuItem[] | MenuItem[][];
	content?: {
		align?: "start" | "center" | "end";
		collisionPadding?: number;
		side?: "top" | "right" | "bottom" | "left";
		sideOffset?: number;
	};
	ui?: Record<string, string>;
}>();

const normalizedGroups = computed<MenuItem[][]>(() => {
	const items = props.items ?? [];
	if (items.length === 0) return [];
	const first = items[0];
	if (Array.isArray(first)) {
		return items as MenuItem[][];
	}
	return [items as MenuItem[]];
});

function onSelect(item: MenuItem, event: Event) {
	item.onSelect?.(event);
}
</script>
