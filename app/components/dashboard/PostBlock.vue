<template>
	<DashboardPostMarkdown v-if="block.kind === 'text'" :source="block.content" />
	<DiscordV2Section v-else-if="block.kind === 'section'">
		<DashboardPostMarkdown v-for="(text, index) of block.texts" :key="index" :source="text" />
		<template v-if="block.accessory" #accessory>
			<DiscordV2Thumbnail
				v-if="block.accessory.kind === 'thumbnail'"
				:src="block.accessory.image.url"
				:alt="block.accessory.image.alt"
			/>
			<DashboardPostLink v-else :link="block.accessory" />
		</template>
	</DiscordV2Section>
	<DiscordV2Separator
		v-else-if="block.kind === 'separator'"
		:divider="block.divider"
		:spacing="block.spacing"
	/>
	<DiscordV2MediaGallery
		v-else-if="block.kind === 'gallery'"
		:items="block.images.map(({ url, ...image }) => ({ src: url, ...image }))"
	/>
	<div v-else class="flex flex-wrap gap-2">
		<DashboardPostLink v-for="link of block.links" :key="link.url" :link />
	</div>
</template>

<script setup lang="ts">
import type { AnnouncementBlock } from "#shared/types/announcement";

/** One part of a post's Components V2 layout, drawn as Discord draws it. */
const { block } = defineProps<{ block: AnnouncementBlock }>();
</script>
