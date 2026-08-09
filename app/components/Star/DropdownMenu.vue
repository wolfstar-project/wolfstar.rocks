<template>
	<DropdownMenuRoot>
		<DropdownMenuTrigger as-child>
			<slot />
		</DropdownMenuTrigger>
		<DropdownMenuPortal>
			<DropdownMenuContent
				class="min-w-48 rounded-md border-base-200 bg-base-100 p-1 shadow-lg z-50 border"
				:align="content?.align ?? 'start'"
				:collision-padding="content?.collisionPadding ?? 8"
				:side="content?.side ?? 'bottom'"
				:side-offset="content?.sideOffset ?? 4"
			>
				<template v-for="(group, groupIndex) in normalizedGroups" :key="groupIndex">
					<DropdownMenuSeparator v-if="groupIndex > 0" class="my-1 bg-base-200 h-px" />
					<template v-for="(item, itemIndex) in group" :key="itemIndex">
						<DropdownMenuLabel
							v-if="item.type === 'label'"
							class="gap-2 px-2 py-1.5 text-sm font-semibold flex items-center"
						>
							<StarAvatar v-if="item.avatar" v-bind="item.avatar" size="xs" />
							<Icon v-else-if="item.icon" :name="item.icon" class="size-4" />
							{{ item.label }}
						</DropdownMenuLabel>
						<DropdownMenuSeparator
							v-else-if="item.type === 'separator'"
							class="my-1 bg-base-200 h-px"
						/>
						<DropdownMenuSub v-else-if="item.children?.length">
							<DropdownMenuSubTrigger
								class="gap-2 rounded-sm px-2 py-1.5 text-sm data-[highlighted]:bg-base-200 flex cursor-pointer items-center outline-none"
								:disabled="item.disabled"
							>
								<Icon v-if="item.icon" :name="item.icon" class="size-4" />
								{{ item.label }}
								<Icon name="lucide:chevron-right" class="size-4 ms-auto" />
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent
									class="min-w-40 rounded-md border-base-200 bg-base-100 p-1 shadow-lg z-50 border"
								>
									<DropdownMenuItem
										v-for="(child, childIndex) in item.children"
										:key="childIndex"
										class="gap-2 rounded-sm px-2 py-1.5 text-sm data-[highlighted]:bg-base-200 flex cursor-pointer items-center outline-none"
										:disabled="child.disabled"
										@select="onSelect(child, $event)"
									>
										<Icon v-if="child.icon" :name="child.icon" class="size-4" />
										<NuxtLink
											v-if="child.to || child.href"
											:to="child.to ?? child.href"
											:target="child.target"
											class="gap-2 flex flex-1 items-center"
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
							class="gap-2 rounded-sm px-2 py-1.5 text-sm data-[highlighted]:bg-base-200 flex cursor-pointer items-center outline-none"
							:disabled="item.disabled"
							@select="onSelect(item, $event)"
						>
							<Icon v-if="item.icon" :name="item.icon" class="size-4" />
							<StarAvatar v-else-if="item.avatar" v-bind="item.avatar" size="xs" />
							<template v-if="item.to || item.href">
								<NuxtLink
									:to="item.to ?? item.href"
									:target="item.target"
									class="gap-2 flex flex-1 items-center"
									@click.stop
								>
									{{ item.label }}
								</NuxtLink>
							</template>
							<span v-else class="flex-1">{{ item.label }}</span>
							<span v-if="item.kbds?.length" class="text-xs ms-auto opacity-60">
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
