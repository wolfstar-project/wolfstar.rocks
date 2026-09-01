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
			<UBlogPosts v-if="versions?.length" class="md:grid-cols-2">
				<UBlogPost
					v-for="version in versions"
					:key="version.path"
					:to="version.path"
					:title="version.title"
					:date="formatDateByLocale('en', version.date)"
					:image="
						version.image
							? {
									src: version.image,
									width: 1200,
									height: 630,
									alt: `${version.title} cover`,
								}
							: undefined
					"
					:badge="version.badge"
				/>
			</UBlogPosts>

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
