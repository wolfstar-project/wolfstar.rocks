<template>
	<section v-if="contributors.length > 0" class="not-prose mt-8" :aria-label="regionLabel">
		<h3 class="mb-3 text-lg font-semibold text-highlighted">Contributors</h3>
		<ul class="list-disc space-y-1 ps-5">
			<li v-for="contributor in contributors" :key="contributor.username">
				<ChangelogContributorMention
					:name="contributor.name"
					:username="contributor.username"
					:commits="contributor.commits"
					:has-contributed="contributor.hasContributed"
					:avatar-src="contributor.avatarSrc"
				/>
			</li>
		</ul>
	</section>
</template>

<script setup lang="ts">
import type { ChangelogContributorItem } from "~/utils/parse-release-contributors";

const props = defineProps<{
	contributors: ChangelogContributorItem[];
	/**
	 * Release tag used to keep the landmark's accessible name unique across
	 * versions. Every release renders its own "Contributors" region, so a shared
	 * name would trip html-validate's `unique-landmark` rule during prerender.
	 */
	idPrefix: string;
}>();

const regionLabel = computed(() => `Contributors for ${props.idPrefix}`);
</script>
