<template>
	<Button
		:href="link.url"
		target="_blank"
		rel="noopener noreferrer"
		variant="secondary"
		size="message"
		class="rounded-lg bg-newt-bg-hover hover:bg-newt-bg-active"
	>
		{{ link.label }}
		<UIcon name="ic:round-open-in-new" class="size-4" aria-hidden="true" />
	</Button>
</template>

<script setup lang="ts">
import type { AnnouncementLink } from "#shared/types/announcement";
import { Button } from "~/components/ui/button";

/** A post's link button, which opens its page in a new tab as Discord's does. */
const { link } = defineProps<{ link: AnnouncementLink }>();
</script>
