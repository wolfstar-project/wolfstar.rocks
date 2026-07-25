<template>
	<CollapsibleRoot v-model:open="open" :unmount-on-hide="unmountOnHide">
		<CollapsibleTrigger as-child>
			<slot :open="open" />
		</CollapsibleTrigger>
		<CollapsibleContent>
			<slot name="content" :open="open" />
		</CollapsibleContent>
	</CollapsibleRoot>
</template>

<script setup lang="ts">
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from "reka-ui";

withDefaults(
	defineProps<{
		unmountOnHide?: boolean;
	}>(),
	{
		unmountOnHide: true,
	},
);

const open = defineModel<boolean>("open", { default: false });
</script>
