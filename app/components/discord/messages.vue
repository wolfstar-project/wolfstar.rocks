<template>
	<MessageList
		class="discord-messages rounded-xl bg-(--discord-surface) p-1 font-whitney drop-shadow-md sm:p-2"
	>
		<slot></slot>
	</MessageList>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface MessagesSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
import { MessageList } from "~/components/ui/message-list";

defineSlots<MessagesSlots>();
</script>
