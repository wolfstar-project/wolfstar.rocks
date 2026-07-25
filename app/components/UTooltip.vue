<template>
	<TooltipProvider :delay-duration="200">
		<TooltipRoot>
			<TooltipTrigger as-child>
				<slot />
			</TooltipTrigger>
			<TooltipPortal>
				<TooltipContent
					class="z-50 rounded-md bg-neutral px-2 py-1 text-xs text-neutral-content shadow"
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
import {
	TooltipArrow,
	TooltipContent,
	TooltipPortal,
	TooltipProvider,
	TooltipRoot,
	TooltipTrigger,
} from "reka-ui";

defineProps<{
	text?: string;
	content?: {
		side?: "top" | "right" | "bottom" | "left";
		align?: "start" | "center" | "end";
		sideOffset?: number;
	};
	contentText?: string;
}>();
</script>
