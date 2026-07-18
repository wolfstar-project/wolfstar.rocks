<template>
	<section v-if="contributors.length > 0" class="not-prose mt-8" :aria-labelledby="headingId">
		<h3 :id="headingId" class="mb-3 text-lg font-semibold text-highlighted">Contributors</h3>
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
import { slugifyHeadingText } from "~/utils/changelog-heading-ids";

const props = defineProps<{
	contributors: ChangelogContributorItem[];
	/** Release tag used to keep heading ids unique across versions. */
	idPrefix: string;
}>();

const headingId = computed(() => `${slugifyHeadingText(props.idPrefix)}-contributors`);
</script>
