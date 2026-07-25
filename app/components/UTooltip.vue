<template>
	<TooltipProvider :delay-duration="delayDuration">
		<TooltipRoot v-model:open="open">
			<TooltipTrigger as-child>
				<slot />
			</TooltipTrigger>
			<TooltipPortal>
				<TooltipContent
					:class="
						cn(
							'z-50 rounded-md bg-neutral px-2 py-1 text-xs text-neutral-content shadow',
							ui?.content,
						)
					"
					:side="content?.side ?? 'top'"
					:align="content?.align ?? 'center'"
					:side-offset="content?.sideOffset ?? 4"
				>
					<slot name="content">{{ text ?? contentText }}</slot>
					<TooltipArrow class="fill-neutral" />
				</TooltipContent>
			</TooltipPortal>
		</TooltipRoot>
	</TooltipProvider>
</template>

<script setup lang="ts">
import { cn } from "cnfast";
import {
	TooltipArrow,
	TooltipContent,
	TooltipPortal,
	TooltipProvider,
	TooltipRoot,
	TooltipTrigger,
} from "reka-ui";

const props = withDefaults(
	defineProps<{
		text?: string;
		contentText?: string;
		delayDuration?: number;
		content?: {
			side?: "top" | "right" | "bottom" | "left";
			align?: "start" | "center" | "end";
			sideOffset?: number;
		};
		ui?: Record<string, string>;
	}>(),
	{
		delayDuration: 200,
	},
);

const open = defineModel<boolean>("open", { default: false });

// Support legacy `delay-duration` attr alias used by callers
const delayDuration = computed(() => props.delayDuration);
</script>
