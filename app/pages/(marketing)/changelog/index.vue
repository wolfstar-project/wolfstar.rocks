<template>
	<UContainer class="pt-20 sm:pt-24">
		<UPageHero
			:title="title"
			:description="description"
			:ui="{ container: 'pb-12 sm:pb-16 lg:pb-20' }"
		>
			<template #links>
				<UButton
					to="https://github.com/wolfstar-project/wolfstar.rocks/releases"
					color="neutral"
					external
					icon="i-lucide-github"
					variant="subtle"
					size="xs"
					target="_blank"
				>
					GitHub Releases
				</UButton>
			</template>
		</UPageHero>

		<UPageBody>
			<UChangelogVersions v-if="versions?.length">
				<UChangelogVersion
					v-for="version in versions"
					:key="version.path"
					:title="version.title"
					:description="version.description"
					:date="formatDateByLocale('en', version.date)"
					:image="version.image"
					:badge="version.badge"
					:authors="version.authors"
				>
					<template #body>
						<ContentRenderer v-if="version" :value="version" />
					</template>
				</UChangelogVersion>
			</UChangelogVersions>

			<p v-else class="text-muted">No releases have been published yet.</p>
		</UPageBody>
	</UContainer>
</template>

<script setup lang="ts">
const site = useSiteConfig();

const { data: page } = await useAsyncData("changelog-hero", () =>
	queryCollection("changelogHero").first(),
);

const { data: versions } = await useAsyncData("changelog-versions", () =>
	queryCollection("changelogVersions").order("date", "DESC").all(),
);

const title = page.value?.title ?? "Changelog";
const description =
	page.value?.description ??
	"Track every release, improvement, and fix across the WolfStar Project.";

useSeoMeta({
	titleTemplate: "%s",
	title,
	description,
	ogTitle: title,
	ogDescription: description,
	ogUrl: `${site.url}/changelog`,
});

defineOgImage("Changelog", {
	title,
	description,
});
</script>
